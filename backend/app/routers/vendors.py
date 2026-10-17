import json
import uuid
from typing import List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Response
from fastapi.responses import HTMLResponse

from backend.app.models.schemas import (
    VendorAuditDossier,
    ComplianceStatus,
    ComplianceCheckItem,
    DocumentExtractionResult,
    DocumentType
)
from backend.app.models.database import get_db_connection
from backend.app.services.ocr_engine import ocr_engine
from backend.app.services.compliance_engine import compliance_engine
from backend.app.services.report_service import report_service
from backend.app.routers.tenders import get_tender

router = APIRouter(prefix="/vendors", tags=["Vendor Filings & Verification"])

@router.get("", response_model=List[VendorAuditDossier])
def list_vendor_filings(status: Optional[str] = None, search: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM vendor_filings WHERE 1=1"
    params = []
    
    if status and status.upper() != "ALL":
        query += " AND overall_status = ?"
        params.append(status.upper())
        
    if search:
        query += " AND (vendor_name LIKE ? OR tender_ref_number LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])
        
    query += " ORDER BY created_at DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    dossiers = []
    for r in rows:
        checks_data = json.loads(r["checks_json"])
        checks = [ComplianceCheckItem(**c) for c in checks_data]
        
        dossiers.append(VendorAuditDossier(
            filing_id=r["filing_id"],
            vendor_name=r["vendor_name"],
            tender_id=r["tender_id"],
            tender_title=r["tender_title"],
            tender_ref_number=r["tender_ref_number"],
            submission_timestamp=r["submission_timestamp"],
            overall_status=ComplianceStatus(r["overall_status"]),
            overall_compliance_score=r["overall_compliance_score"],
            total_checks=r["total_checks"],
            compliant_count=r["compliant_count"],
            non_compliant_count=r["non_compliant_count"],
            requires_review_count=r["requires_review_count"],
            checks=checks,
            audit_hash=r["audit_hash"],
            zero_retention_mode=bool(r["zero_retention_mode"]),
            processing_duration_sec=r["processing_duration_sec"],
            manual_audit_benchmark_mins=45.0,
            time_saved_percent=r["time_saved_percent"]
        ))
    return dossiers

@router.get("/{filing_id}", response_model=VendorAuditDossier)
def get_vendor_filing(filing_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vendor_filings WHERE filing_id = ?", (filing_id,))
    r = cursor.fetchone()
    conn.close()
    
    if not r:
        raise HTTPException(status_code=404, detail="Vendor audit filing not found")
        
    checks_data = json.loads(r["checks_json"])
    checks = [ComplianceCheckItem(**c) for c in checks_data]
    
    return VendorAuditDossier(
        filing_id=r["filing_id"],
        vendor_name=r["vendor_name"],
        tender_id=r["tender_id"],
        tender_title=r["tender_title"],
        tender_ref_number=r["tender_ref_number"],
        submission_timestamp=r["submission_timestamp"],
        overall_status=ComplianceStatus(r["overall_status"]),
        overall_compliance_score=r["overall_compliance_score"],
        total_checks=r["total_checks"],
        compliant_count=r["compliant_count"],
        non_compliant_count=r["non_compliant_count"],
        requires_review_count=r["requires_review_count"],
        checks=checks,
        audit_hash=r["audit_hash"],
        zero_retention_mode=bool(r["zero_retention_mode"]),
        processing_duration_sec=r["processing_duration_sec"],
        manual_audit_benchmark_mins=45.0,
        time_saved_percent=r["time_saved_percent"]
    )

@router.get("/{filing_id}/dossier/html", response_class=HTMLResponse)
def get_filing_html_report(filing_id: str):
    dossier = get_vendor_filing(filing_id)
    html_content = report_service.generate_html_dossier(dossier)
    return HTMLResponse(content=html_content)

@router.post("/upload", response_model=VendorAuditDossier)
async def upload_and_audit_vendor(
    vendor_name: str = Form(...),
    tender_id: str = Form("TNDR-GEM-89104"),
    zero_retention: bool = Form(True),
    files: List[UploadFile] = File(...)
):
    """
    Accepts raw statutory vendor documents (PDF/images), executes multi-modal OCR,
    extracts visual evidence bounding boxes, runs cross-referencing compliance rules,
    and returns a complete explainable audit dossier.
    """
    tender = get_tender(tender_id)
    processed_docs: List[DocumentExtractionResult] = []

    for file in files:
        content_bytes = await file.read()
        if not content_bytes:
            continue
            
        doc_result = ocr_engine.process_document(
            content_bytes=content_bytes,
            filename=file.filename
        )
        processed_docs.append(doc_result)

    if not processed_docs:
        raise HTTPException(status_code=400, detail="No readable documents uploaded")

    filing_id = f"FILING-{uuid.uuid4().hex[:8].upper()}"
    dossier = compliance_engine.evaluate_filing(
        filing_id=filing_id,
        vendor_name=vendor_name,
        tender=tender,
        documents=processed_docs,
        zero_retention_mode=zero_retention
    )

    # Persist in DB
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO vendor_filings (
        filing_id, vendor_name, tender_id, tender_title, tender_ref_number,
        submission_timestamp, overall_status, overall_compliance_score,
        total_checks, compliant_count, non_compliant_count, requires_review_count,
        checks_json, documents_json, audit_hash, zero_retention_mode,
        processing_duration_sec, time_saved_percent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        dossier.filing_id,
        dossier.vendor_name,
        dossier.tender_id,
        dossier.tender_title,
        dossier.tender_ref_number,
        dossier.submission_timestamp,
        dossier.overall_status.value,
        dossier.overall_compliance_score,
        dossier.total_checks,
        dossier.compliant_count,
        dossier.non_compliant_count,
        dossier.requires_review_count,
        json.dumps([c.model_dump() for c in dossier.checks]),
        json.dumps([doc.model_dump() for doc in processed_docs]),
        dossier.audit_hash,
        1 if dossier.zero_retention_mode else 0,
        dossier.processing_duration_sec,
        dossier.time_saved_percent
    ))
    conn.commit()
    conn.close()

    return dossier
