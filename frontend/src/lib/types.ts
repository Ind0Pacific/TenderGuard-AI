export type ComplianceStatus = 'COMPLIANT' | 'NON_COMPLIANT' | 'REQUIRES_REVIEW';
export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface VisualEvidence {
  field_name: string;
  extracted_value: string | number | boolean | null;
  confidence: number;
  page_number: number;
  bounding_box: BoundingBox;
  source_doc_name: string;
  doc_type: string;
  context_snippet?: string;
  crop_image_url?: string;
}

export interface ComplianceCheckItem {
  rule_id: string;
  rule_name: string;
  category: string;
  status: ComplianceStatus;
  severity: SeverityLevel;
  explanation: string;
  remediation_hint?: string;
  evidences: VisualEvidence[];
  reviewer_override?: {
    reviewer_name: string;
    reviewer_role: string;
    comments: string;
    timestamp: string;
    previous_status: string;
  };
}

export interface VendorAuditDossier {
  filing_id: string;
  vendor_name: string;
  tender_id: string;
  tender_title: string;
  tender_ref_number: string;
  submission_timestamp: string;
  overall_status: ComplianceStatus;
  overall_compliance_score: number;
  total_checks: number;
  compliant_count: number;
  non_compliant_count: number;
  requires_review_count: number;
  checks: ComplianceCheckItem[];
  audit_hash: string;
  zero_retention_mode: boolean;
  processing_duration_sec: number;
  manual_audit_benchmark_mins: number;
  time_saved_percent: number;
}

export interface TenderRequirementConfig {
  tender_id: string;
  tender_title: string;
  tender_ref_number: string;
  procuring_authority: string;
  bid_submission_deadline: string;
  required_document_types: string[];
  require_oem_maf: boolean;
  require_msme_exemption: boolean;
  min_msme_category?: string;
  require_pan_gstin_exact_match: boolean;
  require_valid_startup_recognition: boolean;
  min_annual_turnover_lakhs: number;
}

export interface ReviewQueueItem {
  filing_id: string;
  vendor_name: string;
  tender_ref_number: string;
  submission_timestamp: string;
  rule: ComplianceCheckItem;
}

export interface BenchmarkMetrics {
  summary: {
    target_domain: string;
    framework_name: string;
    total_evaluated_filings: number;
    overall_extraction_accuracy_pct: number;
    manual_audit_time_mins: number;
    automated_audit_time_sec: number;
    audit_time_reduction_pct: number;
    false_positive_reduction_pct: number;
    zero_retention_compliance_rate_pct: number;
  };
  accuracy_by_document_type: Array<{
    doc_type: string;
    accuracy_pct: number;
    samples_tested: number;
    primary_entities: string[];
  }>;
  latency_distribution_ms: {
    p50_ms: number;
    p90_ms: number;
    p99_ms: number;
  };
  privacy_compliance: {
    sha256_audit_receipts_generated: number;
    aadhaar_pii_masked_pct: number;
    raw_storage_retention_policy: string;
  };
}
