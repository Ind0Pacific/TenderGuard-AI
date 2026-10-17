import json
from fastapi import APIRouter, HTTPException
from typing import List
from backend.app.models.schemas import TenderRequirementConfig, DocumentType
from backend.app.models.database import get_db_connection

router = APIRouter(prefix="/tenders", tags=["Tenders & Dynamic Checklists"])

@router.get("", response_model=List[TenderRequirementConfig])
def list_tenders():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tenders ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    
    tenders = []
    for r in rows:
        tenders.append(TenderRequirementConfig(
            tender_id=r["tender_id"],
            tender_title=r["tender_title"],
            tender_ref_number=r["tender_ref_number"],
            procuring_authority=r["procuring_authority"],
            bid_submission_deadline=r["bid_submission_deadline"],
            required_document_types=[DocumentType(d) for d in json.loads(r["required_document_types"])],
            require_oem_maf=bool(r["require_oem_maf"]),
            require_msme_exemption=bool(r["require_msme_exemption"]),
            min_msme_category=r["min_msme_category"],
            require_pan_gstin_exact_match=bool(r["require_pan_gstin_exact_match"]),
            require_valid_startup_recognition=bool(r["require_valid_startup_recognition"]),
            min_annual_turnover_lakhs=r["min_annual_turnover_lakhs"]
        ))
    return tenders

@router.get("/{tender_id}", response_model=TenderRequirementConfig)
def get_tender(tender_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tenders WHERE tender_id = ?", (tender_id,))
    r = cursor.fetchone()
    conn.close()
    
    if not r:
        raise HTTPException(status_code=404, detail="Tender not found")
        
    return TenderRequirementConfig(
        tender_id=r["tender_id"],
        tender_title=r["tender_title"],
        tender_ref_number=r["tender_ref_number"],
        procuring_authority=r["procuring_authority"],
        bid_submission_deadline=r["bid_submission_deadline"],
        required_document_types=[DocumentType(d) for d in json.loads(r["required_document_types"])],
        require_oem_maf=bool(r["require_oem_maf"]),
        require_msme_exemption=bool(r["require_msme_exemption"]),
        min_msme_category=r["min_msme_category"],
        require_pan_gstin_exact_match=bool(r["require_pan_gstin_exact_match"]),
        require_valid_startup_recognition=bool(r["require_valid_startup_recognition"]),
        min_annual_turnover_lakhs=r["min_annual_turnover_lakhs"]
    )

@router.post("", response_model=TenderRequirementConfig)
def create_or_update_tender(tender: TenderRequirementConfig):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO tenders (
        tender_id, tender_title, tender_ref_number, procuring_authority,
        bid_submission_deadline, required_document_types, require_oem_maf,
        require_msme_exemption, min_msme_category, require_pan_gstin_exact_match,
        require_valid_startup_recognition, min_annual_turnover_lakhs
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        tender.tender_id,
        tender.tender_title,
        tender.tender_ref_number,
        tender.procuring_authority,
        tender.bid_submission_deadline,
        json.dumps([d.value for d in tender.required_document_types]),
        1 if tender.require_oem_maf else 0,
        1 if tender.require_msme_exemption else 0,
        tender.min_msme_category,
        1 if tender.require_pan_gstin_exact_match else 0,
        1 if tender.require_valid_startup_recognition else 0,
        tender.min_annual_turnover_lakhs
    ))
    conn.commit()
    conn.close()
    return tender
