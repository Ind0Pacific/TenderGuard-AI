import json
from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from backend.app.models.schemas import HumanReviewAction, ComplianceStatus, VendorAuditDossier, ComplianceCheckItem
from backend.app.models.database import get_db_connection

router = APIRouter(prefix="/review", tags=["Human-in-the-Loop Review Queue"])

@router.get("/queue")
def get_review_queue():
    """Returns all filings and rules marked as REQUIRES_REVIEW for officer evaluation."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vendor_filings WHERE requires_review_count > 0 ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()

    queue_items = []
    for r in rows:
        checks_data = json.loads(r["checks_json"])
        for c in checks_data:
            if c.get("status") == ComplianceStatus.REQUIRES_REVIEW.value:
                queue_items.append({
                    "filing_id": r["filing_id"],
                    "vendor_name": r["vendor_name"],
                    "tender_ref_number": r["tender_ref_number"],
                    "submission_timestamp": r["submission_timestamp"],
                    "rule": c
                })
    return queue_items

@router.post("/override")
def submit_reviewer_override(action: HumanReviewAction):
    """
    Submits an auditor sign-off or override on a flagged rule.
    Updates the filing's overall score, recalculates status, and appends an immutable audit log.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM vendor_filings WHERE filing_id = ?", (action.filing_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Filing not found")
        
    checks_data = json.loads(row["checks_json"])
    rule_found = False
    old_status = None
    
    for c in checks_data:
        if c.get("rule_id") == action.rule_id:
            rule_found = True
            old_status = c.get("status")
            c["status"] = action.new_status.value
            c["reviewer_override"] = {
                "reviewer_name": action.reviewer_name,
                "reviewer_role": action.reviewer_role,
                "comments": action.review_comments,
                "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                "previous_status": old_status
            }
            break
            
    if not rule_found:
        conn.close()
        raise HTTPException(status_code=404, detail="Rule ID not found in filing")
        
    # Recalculate stats
    total = len(checks_data)
    compliant = sum(1 for c in checks_data if c["status"] == ComplianceStatus.COMPLIANT.value)
    non_compliant = sum(1 for c in checks_data if c["status"] == ComplianceStatus.NON_COMPLIANT.value)
    requires_review = sum(1 for c in checks_data if c["status"] == ComplianceStatus.REQUIRES_REVIEW.value)
    new_score = round((compliant / max(total, 1)) * 100.0, 1)
    
    if non_compliant > 0:
        overall_status = ComplianceStatus.NON_COMPLIANT.value
    elif requires_review > 0:
        overall_status = ComplianceStatus.REQUIRES_REVIEW.value
    else:
        overall_status = ComplianceStatus.COMPLIANT.value

    # Update filing
    cursor.execute("""
    UPDATE vendor_filings
    SET checks_json = ?, overall_status = ?, overall_compliance_score = ?,
        compliant_count = ?, non_compliant_count = ?, requires_review_count = ?
    WHERE filing_id = ?
    """, (
        json.dumps(checks_data),
        overall_status,
        new_score,
        compliant,
        non_compliant,
        requires_review,
        action.filing_id
    ))

    # Insert Review Log
    cursor.execute("""
    INSERT INTO review_logs (filing_id, rule_id, old_status, new_status, reviewer_name, reviewer_role, review_comments, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        action.filing_id,
        action.rule_id,
        old_status,
        action.new_status.value,
        action.reviewer_name,
        action.reviewer_role,
        action.review_comments,
        datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    ))

    conn.commit()
    conn.close()

    return {
        "success": True,
        "filing_id": action.filing_id,
        "rule_id": action.rule_id,
        "new_overall_status": overall_status,
        "new_score": new_score,
        "message": f"Successfully updated rule status to {action.new_status.value} with digital audit signature."
    }

@router.get("/logs")
def get_review_logs():
    """Returns digital audit logs of all human review actions taken."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM review_logs ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(r) for r in rows]
