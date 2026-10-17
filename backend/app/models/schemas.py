from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field
from datetime import datetime

class DocumentType(str, Enum):
    GST_CERTIFICATE = "GST_CERTIFICATE"
    PAN_CARD = "PAN_CARD"
    UDYAM_MSME = "UDYAM_MSME"
    STARTUP_INDIA = "STARTUP_INDIA"
    OEM_MAF = "OEM_MAF"
    NON_BLACKLISTING = "NON_BLACKLISTING"
    FINANCIAL_TURNOVER = "FINANCIAL_TURNOVER"

class ComplianceStatus(str, Enum):
    COMPLIANT = "COMPLIANT"
    NON_COMPLIANT = "NON_COMPLIANT"
    REQUIRES_REVIEW = "REQUIRES_REVIEW"

class SeverityLevel(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class BoundingBox(BaseModel):
    ymin: float = Field(..., description="Top coordinate (0.0 to 1.0)")
    xmin: float = Field(..., description="Left coordinate (0.0 to 1.0)")
    ymax: float = Field(..., description="Bottom coordinate (0.0 to 1.0)")
    xmax: float = Field(..., description="Right coordinate (0.0 to 1.0)")

class VisualEvidence(BaseModel):
    field_name: str
    extracted_value: Any
    confidence: float
    page_number: int = 1
    bounding_box: BoundingBox
    source_doc_name: str
    doc_type: DocumentType
    context_snippet: Optional[str] = None
    crop_image_url: Optional[str] = None

class DocumentExtractionResult(BaseModel):
    doc_id: str
    doc_type: DocumentType
    filename: str
    sha256_hash: str
    fields: Dict[str, Any]
    evidence_traces: List[VisualEvidence]
    confidence_score: float
    processing_time_ms: float
    is_redacted: bool = False
    status: str = "PROCESSED"

class ComplianceCheckItem(BaseModel):
    rule_id: str
    rule_name: str
    category: str
    status: ComplianceStatus
    severity: SeverityLevel
    explanation: str
    remediation_hint: Optional[str] = None
    evidences: List[VisualEvidence] = []
    reviewer_override: Optional[Dict[str, Any]] = None

class TenderRequirementConfig(BaseModel):
    tender_id: str
    tender_title: str
    tender_ref_number: str
    procuring_authority: str
    bid_submission_deadline: str
    required_document_types: List[DocumentType]
    require_oem_maf: bool = True
    require_msme_exemption: bool = False
    min_msme_category: Optional[str] = None # Micro, Small, Medium
    require_pan_gstin_exact_match: bool = True
    require_valid_startup_recognition: bool = False
    min_annual_turnover_lakhs: float = 0.0

class VendorFilingSubmission(BaseModel):
    vendor_name: str
    tender_id: str
    contact_email: Optional[str] = None
    zero_retention_enabled: bool = True
    documents: List[DocumentExtractionResult] = []

class VendorAuditDossier(BaseModel):
    filing_id: str
    vendor_name: str
    tender_id: str
    tender_title: str
    tender_ref_number: str
    submission_timestamp: str
    overall_status: ComplianceStatus
    overall_compliance_score: float
    total_checks: int
    compliant_count: int
    non_compliant_count: int
    requires_review_count: int
    checks: List[ComplianceCheckItem]
    audit_hash: str
    zero_retention_mode: bool
    processing_duration_sec: float
    manual_audit_benchmark_mins: float = 45.0
    time_saved_percent: float

class HumanReviewAction(BaseModel):
    filing_id: str
    rule_id: str
    new_status: ComplianceStatus
    reviewer_name: str
    reviewer_role: str = "Senior Procurement Auditor"
    review_comments: str
    override_timestamp: Optional[str] = None

class BenchmarkMetric(BaseModel):
    total_audited_filings: int
    overall_extraction_accuracy: float
    avg_ai_processing_time_sec: float
    avg_manual_audit_time_mins: float
    overall_time_reduction_pct: float
    false_positive_reduction_pct: float
    zero_retention_compliance_rate: float
