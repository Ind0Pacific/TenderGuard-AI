import json
import base64
from typing import List, Dict, Any, Optional
from backend.app.models.schemas import (
    DocumentType,
    BoundingBox,
    VisualEvidence,
    DocumentExtractionResult,
    TenderRequirementConfig,
    ComplianceStatus
)
from backend.app.services.compliance_engine import compliance_engine
from backend.app.models.database import get_db_connection

def generate_svg_document(doc_type: DocumentType, title: str, fields: Dict[str, Any], highlight_box: Optional[BoundingBox] = None) -> str:
    """Generates an SVG representation of an authentic government filing for visual evidence tracing."""
    width, height = 800, 1050
    
    # Theme colors based on document type
    if doc_type == DocumentType.GST_CERTIFICATE:
        header_color = "#1e3a8a" # Navy Blue
        badge_text = "Government of India - Form GST REG-06"
        sub_text = "Registration Certificate under Goods and Services Tax Act"
    elif doc_type == DocumentType.PAN_CARD:
        header_color = "#047857" # Emerald Green
        badge_text = "INCOME TAX DEPARTMENT - GOVT. OF INDIA"
        sub_text = "Permanent Account Number Card (PAN)"
    elif doc_type == DocumentType.UDYAM_MSME:
        header_color = "#b45309" # Amber / Gold
        badge_text = "MINISTRY OF MICRO, SMALL & MEDIUM ENTERPRISES"
        sub_text = "UDYAM REGISTRATION CERTIFICATE"
    elif doc_type == DocumentType.STARTUP_INDIA:
        header_color = "#7c3aed" # Purple
        badge_text = "DEPARTMENT FOR PROMOTION OF INDUSTRY AND INTERNAL TRADE"
        sub_text = "Certificate of Recognition (Startup India)"
    else: # OEM_MAF
        header_color = "#0f172a" # Slate / Corporate
        badge_text = "MANUFACTURER'S AUTHORIZATION FORM (MAF)"
        sub_text = "Official Bid-Specific Authorization Letter"

    field_rows_svg = []
    y_pos = 280
    for key, val in fields.items():
        if isinstance(val, (str, int, float)):
            label = key.replace("_", " ").title()
            field_rows_svg.append(f"""
            <text x="70" y="{y_pos}" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#334155">{label}:</text>
            <text x="280" y="{y_pos}" font-family="Courier, monospace" font-size="15" fill="#0f172a">{val}</text>
            <line x1="70" y1="{y_pos + 12}" x2="730" y2="{y_pos + 12}" stroke="#e2e8f0" stroke-width="1" />
            """)
            y_pos += 45

    # Visual Evidence Bounding Box Highlight
    bbox_svg = ""
    if highlight_box:
        box_x = highlight_box.xmin * width
        box_y = highlight_box.ymin * height
        box_w = (highlight_box.xmax - highlight_box.xmin) * width
        box_h = (highlight_box.ymax - highlight_box.ymin) * height
        bbox_svg = f"""
        <!-- Visual Evidence Trace Highlight -->
        <rect x="{box_x}" y="{box_y}" width="{box_w}" height="{box_h}" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" stroke-width="2.5" rx="4" stroke-dasharray="6,4">
            <animate attributeName="stroke-opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
        </rect>
        <rect x="{box_x}" y="{box_y - 24}" width="140" height="22" fill="#ef4444" rx="3" />
        <text x="{box_x + 8}" y="{box_y - 8}" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">AI EVIDENCE TRACE</text>
        """

    svg = f"""
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="100%" height="100%">
        <!-- Document Background -->
        <rect width="{width}" height="{height}" fill="#f8fafc" />
        <rect x="25" y="25" width="750" height="1000" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" />
        
        <!-- Header Banner -->
        <rect x="25" y="25" width="750" height="120" rx="8" fill="{header_color}" />
        <circle cx="90" cy="85" r="35" fill="rgba(255,255,255,0.15)" />
        <text x="90" y="93" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle">🏛️</text>
        
        <text x="145" y="72" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff">{badge_text}</text>
        <text x="145" y="96" font-family="Arial, sans-serif" font-size="13" fill="#cbd5e1">{sub_text}</text>
        <text x="145" y="118" font-family="Arial, sans-serif" font-size="12" fill="#93c5fd">Document Verification Audit File: {title}</text>
        
        <!-- Watermark -->
        <text x="400" y="550" font-family="Arial, sans-serif" font-size="52" font-weight="bold" fill="rgba(203, 213, 225, 0.25)" text-anchor="middle" transform="rotate(-30 400 550)">OFFICIAL PROCUREMENT COPY</text>
        
        <!-- Sub-header Details -->
        <rect x="50" y="170" width="700" height="50" rx="4" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1" />
        <text x="70" y="200" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#475569">STATUS: VERIFIED STATUTORY FILING</text>
        <text x="520" y="200" font-family="Arial, sans-serif" font-size="12" fill="#64748b">TenderGuard Trace ID: TG-AI-2026</text>
        
        <!-- Dynamic Fields -->
        {''.join(field_rows_svg)}
        
        {bbox_svg}
        
        <!-- Footer / Digital Stamp -->
        <rect x="50" y="900" width="700" height="85" rx="4" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" />
        <text x="70" y="928" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#0f172a">DIGITALLY GENERATED VERIFICATION COPY</text>
        <text x="70" y="948" font-family="Arial, sans-serif" font-size="10" fill="#64748b">Verified by TenderGuard AI Explainability Framework for Government Procurement Compliance.</text>
        <text x="70" y="966" font-family="Courier, monospace" font-size="10" fill="#94a3b8">SHA-256 Digest: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</text>
    </svg>
    """
    return "data:image/svg+xml;base64," + base64.b64encode(svg.strip().encode("utf-8")).decode("utf-8")

def get_default_tender() -> TenderRequirementConfig:
    return TenderRequirementConfig(
        tender_id="TNDR-GEM-89104",
        tender_title="Supply, Installation & Maintenance of Enterprise Cloud & Compute Infrastructure",
        tender_ref_number="GEM-2026-B-89104",
        procuring_authority="National Informatics Centre (NIC) & Ministry of Electronics and IT",
        bid_submission_deadline="2026-11-30",
        required_document_types=[
            DocumentType.GST_CERTIFICATE,
            DocumentType.PAN_CARD,
            DocumentType.UDYAM_MSME,
            DocumentType.OEM_MAF
        ],
        require_oem_maf=True,
        require_msme_exemption=True,
        min_msme_category="MICRO",
        require_pan_gstin_exact_match=True,
        require_valid_startup_recognition=False,
        min_annual_turnover_lakhs=150.0
    )

def create_synthetic_filings(tender: TenderRequirementConfig):
    """Generates synthetic procurement filings covering Compliant, Non-compliant, and Review cases."""
    
    # ------------------------------------------------------------------
    # Case 1: Fully Compliant Vendor (AlphaTech Solutions Pvt Ltd)
    # ------------------------------------------------------------------
    gst_fields_1 = {
        "gstin": "07AABCA1234A1Z5",
        "legal_name": "AlphaTech Solutions Pvt Ltd",
        "trade_name": "AlphaTech Digital",
        "date_of_registration": "12/04/2021",
        "validity_status": "ACTIVE",
        "state_code": "07 (Delhi)"
    }
    pan_fields_1 = {
        "pan_number": "AABCA1234A",
        "entity_name": "AlphaTech Solutions Pvt Ltd",
        "entity_type": "Company / Corporation",
        "date_of_incorporation": "15/03/2019"
    }
    udyam_fields_1 = {
        "udyam_registration_number": "UDYAM-DL-01-0029381",
        "enterprise_name": "AlphaTech Solutions Pvt Ltd",
        "enterprise_category": "MICRO",
        "major_activity": "SERVICES & IT"
    }
    maf_fields_1 = {
        "tender_reference_number": "GEM-2026-B-89104",
        "oem_principal_name": "Cisco Systems India Pvt Ltd",
        "authorized_bidder_name": "AlphaTech Solutions Pvt Ltd",
        "maf_validity_date": "31/12/2026"
    }

    doc_1_gst = DocumentExtractionResult(
        doc_id="doc-alpha-gst",
        doc_type=DocumentType.GST_CERTIFICATE,
        filename="AlphaTech_GST_REG06.pdf",
        sha256_hash="e1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2",
        fields=gst_fields_1,
        evidence_traces=[
            VisualEvidence(
                field_name="GSTIN",
                extracted_value="07AABCA1234A1Z5",
                confidence=0.99,
                page_number=1,
                bounding_box=BoundingBox(ymin=0.22, xmin=0.35, ymax=0.28, xmax=0.72),
                source_doc_name="AlphaTech_GST_REG06.pdf",
                doc_type=DocumentType.GST_CERTIFICATE,
                context_snippet="Registration Number (GSTIN): 07AABCA1234A1Z5",
                crop_image_url=generate_svg_document(DocumentType.GST_CERTIFICATE, "AlphaTech GST REG-06", gst_fields_1, BoundingBox(ymin=0.22, xmin=0.35, ymax=0.28, xmax=0.72))
            ),
            VisualEvidence(
                field_name="Legal Name",
                extracted_value="AlphaTech Solutions Pvt Ltd",
                confidence=0.98,
                page_number=1,
                bounding_box=BoundingBox(ymin=0.30, xmin=0.35, ymax=0.36, xmax=0.88),
                source_doc_name="AlphaTech_GST_REG06.pdf",
                doc_type=DocumentType.GST_CERTIFICATE,
                context_snippet="Legal Name: AlphaTech Solutions Pvt Ltd",
                crop_image_url=generate_svg_document(DocumentType.GST_CERTIFICATE, "AlphaTech GST REG-06", gst_fields_1, BoundingBox(ymin=0.30, xmin=0.35, ymax=0.36, xmax=0.88))
            )
        ],
        confidence_score=0.985,
        processing_time_ms=310.0,
        is_redacted=True,
        status="PROCESSED"
    )

    doc_1_pan = DocumentExtractionResult(
        doc_id="doc-alpha-pan",
        doc_type=DocumentType.PAN_CARD,
        filename="AlphaTech_Corporate_PAN.pdf",
        sha256_hash="f2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3",
        fields=pan_fields_1,
        evidence_traces=[
            VisualEvidence(
                field_name="PAN Number",
                extracted_value="AABCA1234A",
                confidence=0.99,
                page_number=1,
                bounding_box=BoundingBox(ymin=0.62, xmin=0.18, ymax=0.74, xmax=0.68),
                source_doc_name="AlphaTech_Corporate_PAN.pdf",
                doc_type=DocumentType.PAN_CARD,
                context_snippet="Permanent Account Number: AABCA1234A (Company)",
                crop_image_url=generate_svg_document(DocumentType.PAN_CARD, "AlphaTech PAN Card", pan_fields_1, BoundingBox(ymin=0.62, xmin=0.18, ymax=0.74, xmax=0.68))
            )
        ],
        confidence_score=0.99,
        processing_time_ms=280.0,
        is_redacted=True,
        status="PROCESSED"
    )

    doc_1_udyam = DocumentExtractionResult(
        doc_id="doc-alpha-udyam",
        doc_type=DocumentType.UDYAM_MSME,
        filename="AlphaTech_Udyam_Certificate.pdf",
        sha256_hash="a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4",
        fields=udyam_fields_1,
        evidence_traces=[
            VisualEvidence(
                field_name="Enterprise Classification",
                extracted_value="MICRO",
                confidence=0.97,
                page_number=1,
                bounding_box=BoundingBox(ymin=0.38, xmin=0.42, ymax=0.45, xmax=0.68),
                source_doc_name="AlphaTech_Udyam_Certificate.pdf",
                doc_type=DocumentType.UDYAM_MSME,
                context_snippet="Classification: MICRO Enterprise under MSME Act",
                crop_image_url=generate_svg_document(DocumentType.UDYAM_MSME, "AlphaTech Udyam Cert", udyam_fields_1, BoundingBox(ymin=0.38, xmin=0.42, ymax=0.45, xmax=0.68))
            )
        ],
        confidence_score=0.97,
        processing_time_ms=290.0,
        is_redacted=True,
        status="PROCESSED"
    )

    doc_1_maf = DocumentExtractionResult(
        doc_id="doc-alpha-maf",
        doc_type=DocumentType.OEM_MAF,
        filename="Cisco_OEM_MAF_Authorization.pdf",
        sha256_hash="b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5",
        fields=maf_fields_1,
        evidence_traces=[
            VisualEvidence(
                field_name="Tender Reference In MAF",
                extracted_value="GEM-2026-B-89104",
                confidence=0.96,
                page_number=1,
                bounding_box=BoundingBox(ymin=0.32, xmin=0.20, ymax=0.38, xmax=0.82),
                source_doc_name="Cisco_OEM_MAF_Authorization.pdf",
                doc_type=DocumentType.OEM_MAF,
                context_snippet="Authorized for Tender Ref: GEM-2026-B-89104",
                crop_image_url=generate_svg_document(DocumentType.OEM_MAF, "Cisco OEM Authorization", maf_fields_1, BoundingBox(ymin=0.32, xmin=0.20, ymax=0.38, xmax=0.82))
            ),
            VisualEvidence(
                field_name="MAF Validity Date",
                extracted_value="31/12/2026",
                confidence=0.98,
                page_number=1,
                bounding_box=BoundingBox(ymin=0.68, xmin=0.20, ymax=0.75, xmax=0.65),
                source_doc_name="Cisco_OEM_MAF_Authorization.pdf",
                doc_type=DocumentType.OEM_MAF,
                context_snippet="Authorization valid up to: 31/12/2026",
                crop_image_url=generate_svg_document(DocumentType.OEM_MAF, "Cisco OEM Authorization", maf_fields_1, BoundingBox(ymin=0.68, xmin=0.20, ymax=0.75, xmax=0.65))
            )
        ],
        confidence_score=0.97,
        processing_time_ms=305.0,
        is_redacted=True,
        status="PROCESSED"
    )

    dossier_1 = compliance_engine.evaluate_filing(
        filing_id="FILING-ALPHATECH-001",
        vendor_name="AlphaTech Solutions Pvt Ltd",
        tender=tender,
        documents=[doc_1_gst, doc_1_pan, doc_1_udyam, doc_1_maf],
        zero_retention_mode=True
    )

    # ------------------------------------------------------------------
    # Case 2: Non-Compliant (Apex Buildcon & Supplies - Expired OEM MAF)
    # ------------------------------------------------------------------
    gst_fields_2 = {
        "gstin": "27AABCB5678C1Z2",
        "legal_name": "Apex Buildcon & Supplies",
        "trade_name": "Apex Hardware",
        "date_of_registration": "04/09/2018",
        "validity_status": "ACTIVE",
        "state_code": "27 (Maharashtra)"
    }
    pan_fields_2 = {
        "pan_number": "AABCB5678C",
        "entity_name": "Apex Buildcon & Supplies",
        "entity_type": "Partnership Firm / LLP",
        "date_of_incorporation": "12/08/2018"
    }
    udyam_fields_2 = {
        "udyam_registration_number": "UDYAM-MH-02-0044123",
        "enterprise_name": "Apex Buildcon & Supplies",
        "enterprise_category": "SMALL",
        "major_activity": "SERVICES"
    }
    maf_fields_2 = {
        "tender_reference_number": "GEM-2026-B-89104",
        "oem_principal_name": "Schneider Electric India",
        "authorized_bidder_name": "Apex Buildcon & Supplies",
        "maf_validity_date": "15/01/2026" # Expired!
    }

    doc_2_gst = DocumentExtractionResult(
        doc_id="doc-apex-gst",
        doc_type=DocumentType.GST_CERTIFICATE,
        filename="Apex_GST_REG06.pdf",
        sha256_hash="c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
        fields=gst_fields_2,
        evidence_traces=[
            VisualEvidence(
                field_name="GSTIN",
                extracted_value="27AABCB5678C1Z2",
                confidence=0.98,
                page_number=1,
                bounding_box=BoundingBox(ymin=0.22, xmin=0.35, ymax=0.28, xmax=0.72),
                source_doc_name="Apex_GST_REG06.pdf",
                doc_type=DocumentType.GST_CERTIFICATE,
                context_snippet="Registration Number: 27AABCB5678C1Z2",
                crop_image_url=generate_svg_document(DocumentType.GST_CERTIFICATE, "Apex GST REG-06", gst_fields_2, BoundingBox(ymin=0.22, xmin=0.35, ymax=0.28, xmax=0.72))
            )
        ],
        confidence_score=0.98,
        processing_time_ms=290.0,
        is_redacted=True,
        status="PROCESSED"
    )

    doc_2_pan = DocumentExtractionResult(
        doc_id="doc-apex-pan",
        doc_type=DocumentType.PAN_CARD,
        filename="Apex_PAN.pdf",
        sha256_hash="d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7",
        fields=pan_fields_2,
        evidence_traces=[
            VisualEvidence(
                field_name="PAN Number",
                extracted_value="AABCB5678C",
                confidence=0.98,
                page_number=1,
                bounding_box=BoundingBox(ymin=0.62, xmin=0.18, ymax=0.74, xmax=0.68),
                source_doc_name="Apex_PAN.pdf",
                doc_type=DocumentType.PAN_CARD,
                context_snippet="PAN: AABCB5678C",
                crop_image_url=generate_svg_document(DocumentType.PAN_CARD, "Apex PAN Card", pan_fields_2, BoundingBox(ymin=0.62, xmin=0.18, ymax=0.74, xmax=0.68))
            )
        ],
        confidence_score=0.98,
        processing_time_ms=270.0,
        is_redacted=True,
        status="PROCESSED"
    )

    doc_2_maf = DocumentExtractionResult(
        doc_id="doc-apex-maf",
        doc_type=DocumentType.OEM_MAF,
        filename="Schneider_Authorization_2025.pdf",
        sha256_hash="e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8",
        fields=maf_fields_2,
        evidence_traces=[
            VisualEvidence(
                field_name="MAF Validity Date",
                extracted_value="15/01/2026",
                confidence=0.96,
                page_number=1,
                bounding_box=BoundingBox(ymin=0.68, xmin=0.20, ymax=0.75, xmax=0.65),
                source_doc_name="Schneider_Authorization_2025.pdf",
                doc_type=DocumentType.OEM_MAF,
                context_snippet="Authorization valid up to: 15/01/2026 (EXPIRED)",
                crop_image_url=generate_svg_document(DocumentType.OEM_MAF, "Schneider OEM Authorization", maf_fields_2, BoundingBox(ymin=0.68, xmin=0.20, ymax=0.75, xmax=0.65))
            )
        ],
        confidence_score=0.96,
        processing_time_ms=315.0,
        is_redacted=True,
        status="PROCESSED"
    )

    dossier_2 = compliance_engine.evaluate_filing(
        filing_id="FILING-APEX-002",
        vendor_name="Apex Buildcon & Supplies",
        tender=tender,
        documents=[doc_2_gst, doc_2_pan, doc_2_maf],
        zero_retention_mode=True
    )

    # ------------------------------------------------------------------
    # Case 3: Severe Non-Compliant (Bharat Logistics - PAN-GSTIN Mismatch)
    # ------------------------------------------------------------------
    gst_fields_3 = {
        "gstin": "29AAACD9999K1Z4",
        "legal_name": "Bharat Logistics & Traders",
        "trade_name": "Bharat Logistics",
        "date_of_registration": "11/02/2020",
        "validity_status": "ACTIVE",
        "state_code": "29 (Karnataka)"
    }
    pan_fields_3 = {
        "pan_number": "BBBCD8888K", # MISMATCH! Embedded is AAACD9999K
        "entity_name": "Bharat Trading Co",
        "entity_type": "Company / Corporation",
        "date_of_incorporation": "10/01/2017"
    }

    doc_3_gst = DocumentExtractionResult(
        doc_id="doc-bharat-gst",
        doc_type=DocumentType.GST_CERTIFICATE,
        filename="Bharat_GST_Karnataka.pdf",
        sha256_hash="f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9",
        fields=gst_fields_3,
        evidence_traces=[
            VisualEvidence(
                field_name="GSTIN",
                extracted_value="29AAACD9999K1Z4",
                confidence=0.97,
                page_number=1,
                bounding_box=BoundingBox(ymin=0.22, xmin=0.35, ymax=0.28, xmax=0.72),
                source_doc_name="Bharat_GST_Karnataka.pdf",
                doc_type=DocumentType.GST_CERTIFICATE,
                context_snippet="GSTIN: 29AAACD9999K1Z4 (Embedded PAN: AAACD9999K)",
                crop_image_url=generate_svg_document(DocumentType.GST_CERTIFICATE, "Bharat GST Certificate", gst_fields_3, BoundingBox(ymin=0.22, xmin=0.35, ymax=0.28, xmax=0.72))
            )
        ],
        confidence_score=0.97,
        processing_time_ms=295.0,
        is_redacted=True,
        status="PROCESSED"
    )

    doc_3_pan = DocumentExtractionResult(
        doc_id="doc-bharat-pan",
        doc_type=DocumentType.PAN_CARD,
        filename="Bharat_PAN_Card.pdf",
        sha256_hash="a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
        fields=pan_fields_3,
        evidence_traces=[
            VisualEvidence(
                field_name="PAN Number",
                extracted_value="BBBCD8888K",
                confidence=0.99,
                page_number=1,
                bounding_box=BoundingBox(ymin=0.62, xmin=0.18, ymax=0.74, xmax=0.68),
                source_doc_name="Bharat_PAN_Card.pdf",
                doc_type=DocumentType.PAN_CARD,
                context_snippet="PAN: BBBCD8888K",
                crop_image_url=generate_svg_document(DocumentType.PAN_CARD, "Bharat PAN Card", pan_fields_3, BoundingBox(ymin=0.62, xmin=0.18, ymax=0.74, xmax=0.68))
            )
        ],
        confidence_score=0.99,
        processing_time_ms=280.0,
        is_redacted=True,
        status="PROCESSED"
    )

    dossier_3 = compliance_engine.evaluate_filing(
        filing_id="FILING-BHARAT-003",
        vendor_name="Bharat Logistics & Traders",
        tender=tender,
        documents=[doc_3_gst, doc_3_pan],
        zero_retention_mode=True
    )

    # ------------------------------------------------------------------
    # Case 4: Requires Review (Saraswati Diagnostics - Name Variation & Ref Variant)
    # ------------------------------------------------------------------
    gst_fields_4 = {
        "gstin": "06AABCS7777D1Z9",
        "legal_name": "Saraswati Diagnostics Private Limited",
        "trade_name": "Saraswati Diagnostics",
        "date_of_registration": "09/03/2021",
        "validity_status": "ACTIVE",
        "state_code": "06 (Haryana)"
    }
    pan_fields_4 = {
        "pan_number": "AABCS7777D",
        "entity_name": "Saraswati Diagnostic Systems Pvt Ltd", # Slight variation!
        "entity_type": "Company / Corporation",
        "date_of_incorporation": "15/02/2021"
    }
    maf_fields_4 = {
        "tender_reference_number": "GEM-2026-B-89104-SUP", # Suffix variation
        "oem_principal_name": "Hewlett Packard Enterprise (HPE)",
        "authorized_bidder_name": "Saraswati Diagnostics Private Limited",
        "maf_validity_date": "31/12/2026"
    }

    doc_4_gst = DocumentExtractionResult(
        doc_id="doc-saraswati-gst",
        doc_type=DocumentType.GST_CERTIFICATE,
        filename="Saraswati_GST_REG06.pdf",
        sha256_hash="b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1",
        fields=gst_fields_4,
        evidence_traces=[
            VisualEvidence(
                field_name="GSTIN",
                extracted_value="06AABCS7777D1Z9",
                confidence=0.98,
                page_number=1,
                bounding_box=BoundingBox(ymin=0.22, xmin=0.35, ymax=0.28, xmax=0.72),
                source_doc_name="Saraswati_GST_REG06.pdf",
                doc_type=DocumentType.GST_CERTIFICATE,
                context_snippet="GSTIN: 06AABCS7777D1Z9",
                crop_image_url=generate_svg_document(DocumentType.GST_CERTIFICATE, "Saraswati GST REG-06", gst_fields_4, BoundingBox(ymin=0.22, xmin=0.35, ymax=0.28, xmax=0.72))
            ),
            VisualEvidence(
                field_name="Legal Name",
                extracted_value="Saraswati Diagnostics Private Limited",
                confidence=0.96,
                page_number=1,
                bounding_box=BoundingBox(ymin=0.30, xmin=0.35, ymax=0.36, xmax=0.88),
                source_doc_name="Saraswati_GST_REG06.pdf",
                doc_type=DocumentType.GST_CERTIFICATE,
                context_snippet="Legal Name: Saraswati Diagnostics Private Limited",
                crop_image_url=generate_svg_document(DocumentType.GST_CERTIFICATE, "Saraswati GST REG-06", gst_fields_4, BoundingBox(ymin=0.30, xmin=0.35, ymax=0.36, xmax=0.88))
            )
        ],
        confidence_score=0.97,
        processing_time_ms=305.0,
        is_redacted=True,
        status="PROCESSED"
    )

    doc_4_pan = DocumentExtractionResult(
        doc_id="doc-saraswati-pan",
        doc_type=DocumentType.PAN_CARD,
        filename="Saraswati_PAN.pdf",
        sha256_hash="c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2",
        fields=pan_fields_4,
        evidence_traces=[
            VisualEvidence(
                field_name="Holder/Entity Name",
                extracted_value="Saraswati Diagnostic Systems Pvt Ltd",
                confidence=0.92,
                page_number=1,
                bounding_box=BoundingBox(ymin=0.38, xmin=0.18, ymax=0.48, xmax=0.82),
                source_doc_name="Saraswati_PAN.pdf",
                doc_type=DocumentType.PAN_CARD,
                context_snippet="Entity Name: Saraswati Diagnostic Systems Pvt Ltd",
                crop_image_url=generate_svg_document(DocumentType.PAN_CARD, "Saraswati PAN Card", pan_fields_4, BoundingBox(ymin=0.38, xmin=0.18, ymax=0.48, xmax=0.82))
            ),
            VisualEvidence(
                field_name="PAN Number",
                extracted_value="AABCS7777D",
                confidence=0.98,
                page_number=1,
                bounding_box=BoundingBox(ymin=0.62, xmin=0.18, ymax=0.74, xmax=0.68),
                source_doc_name="Saraswati_PAN.pdf",
                doc_type=DocumentType.PAN_CARD,
                context_snippet="PAN: AABCS7777D",
                crop_image_url=generate_svg_document(DocumentType.PAN_CARD, "Saraswati PAN Card", pan_fields_4, BoundingBox(ymin=0.62, xmin=0.18, ymax=0.74, xmax=0.68))
            )
        ],
        confidence_score=0.95,
        processing_time_ms=290.0,
        is_redacted=True,
        status="PROCESSED"
    )

    doc_4_maf = DocumentExtractionResult(
        doc_id="doc-saraswati-maf",
        doc_type=DocumentType.OEM_MAF,
        filename="HPE_Authorization_Letter.pdf",
        sha256_hash="d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3",
        fields=maf_fields_4,
        evidence_traces=[
            VisualEvidence(
                field_name="Tender Reference In MAF",
                extracted_value="GEM-2026-B-89104-SUP",
                confidence=0.89,
                page_number=1,
                bounding_box=BoundingBox(ymin=0.32, xmin=0.20, ymax=0.38, xmax=0.82),
                source_doc_name="HPE_Authorization_Letter.pdf",
                doc_type=DocumentType.OEM_MAF,
                context_snippet="Authorization for Tender Ref: GEM-2026-B-89104-SUP",
                crop_image_url=generate_svg_document(DocumentType.OEM_MAF, "HPE OEM Authorization", maf_fields_4, BoundingBox(ymin=0.32, xmin=0.20, ymax=0.38, xmax=0.82))
            )
        ],
        confidence_score=0.91,
        processing_time_ms=320.0,
        is_redacted=True,
        status="PROCESSED"
    )

    udyam_fields_4 = {
        "udyam_registration_number": "UDYAM-HR-03-0051284",
        "enterprise_name": "Saraswati Diagnostics Private Limited",
        "enterprise_category": "SMALL",
        "major_activity": "MANUFACTURING / SERVICES"
    }

    doc_4_udyam = DocumentExtractionResult(
        doc_id="doc-saraswati-udyam",
        doc_type=DocumentType.UDYAM_MSME,
        filename="Saraswati_Udyam_Reg.pdf",
        sha256_hash="e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4",
        fields=udyam_fields_4,
        evidence_traces=[
            VisualEvidence(
                field_name="Enterprise Classification",
                extracted_value="SMALL",
                confidence=0.96,
                page_number=1,
                bounding_box=BoundingBox(ymin=0.38, xmin=0.42, ymax=0.45, xmax=0.68),
                source_doc_name="Saraswati_Udyam_Reg.pdf",
                doc_type=DocumentType.UDYAM_MSME,
                context_snippet="Enterprise Type: SMALL Enterprise",
                crop_image_url=generate_svg_document(DocumentType.UDYAM_MSME, "Saraswati Udyam Reg", udyam_fields_4, BoundingBox(ymin=0.38, xmin=0.42, ymax=0.45, xmax=0.68))
            )
        ],
        confidence_score=0.96,
        processing_time_ms=300.0,
        is_redacted=True,
        status="PROCESSED"
    )

    dossier_4 = compliance_engine.evaluate_filing(
        filing_id="FILING-SARASWATI-004",
        vendor_name="Saraswati Diagnostics & Systems",
        tender=tender,
        documents=[doc_4_gst, doc_4_pan, doc_4_udyam, doc_4_maf],
        zero_retention_mode=True
    )

    # Save all seed records to SQLite DB
    conn = get_db_connection()
    cursor = conn.cursor()

    # Insert Tender
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

    # Insert Dossiers
    for d, docs in [
        (dossier_1, [doc_1_gst, doc_1_pan, doc_1_udyam, doc_1_maf]),
        (dossier_2, [doc_2_gst, doc_2_pan, doc_2_maf]),
        (dossier_3, [doc_3_gst, doc_3_pan]),
        (dossier_4, [doc_4_gst, doc_4_pan, doc_4_udyam, doc_4_maf])
    ]:
        cursor.execute("""
        INSERT OR REPLACE INTO vendor_filings (
            filing_id, vendor_name, tender_id, tender_title, tender_ref_number,
            submission_timestamp, overall_status, overall_compliance_score,
            total_checks, compliant_count, non_compliant_count, requires_review_count,
            checks_json, documents_json, audit_hash, zero_retention_mode,
            processing_duration_sec, time_saved_percent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            d.filing_id,
            d.vendor_name,
            d.tender_id,
            d.tender_title,
            d.tender_ref_number,
            d.submission_timestamp,
            d.overall_status.value,
            d.overall_compliance_score,
            d.total_checks,
            d.compliant_count,
            d.non_compliant_count,
            d.requires_review_count,
            json.dumps([c.model_dump() for c in d.checks]),
            json.dumps([doc.model_dump() for doc in docs]),
            d.audit_hash,
            1 if d.zero_retention_mode else 0,
            d.processing_duration_sec,
            d.time_saved_percent
        ))

    conn.commit()
    conn.close()

if __name__ == "__main__":
    t = get_default_tender()
    create_synthetic_filings(t)
    print("Synthetic filings generated and stored.")
