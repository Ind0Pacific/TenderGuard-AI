import {
  VendorAuditDossier,
  TenderRequirementConfig,
  ReviewQueueItem,
  BenchmarkMetrics,
  ComplianceStatus
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export async function fetchTenders(): Promise<TenderRequirementConfig[]> {
  const res = await fetch(`${API_BASE_URL}/tenders`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch tenders');
  return res.json();
}

export async function fetchTender(id: string): Promise<TenderRequirementConfig> {
  const res = await fetch(`${API_BASE_URL}/tenders/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch tender ${id}`);
  return res.json();
}

export async function fetchVendorFilings(status?: string, search?: string): Promise<VendorAuditDossier[]> {
  const params = new URLSearchParams();
  if (status && status !== 'ALL') params.append('status', status);
  if (search) params.append('search', search);

  const res = await fetch(`${API_BASE_URL}/vendors?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch vendor filings');
  return res.json();
}

export async function fetchVendorFiling(filingId: string): Promise<VendorAuditDossier> {
  const res = await fetch(`${API_BASE_URL}/vendors/${filingId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch filing ${filingId}`);
  return res.json();
}

export async function uploadVendorDocuments(formData: FormData): Promise<VendorAuditDossier> {
  const res = await fetch(`${API_BASE_URL}/vendors/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to upload and audit documents');
  }
  return res.json();
}

export async function fetchReviewQueue(): Promise<ReviewQueueItem[]> {
  const res = await fetch(`${API_BASE_URL}/review/queue`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch review queue');
  return res.json();
}

export async function submitReviewOverride(payload: {
  filing_id: string;
  rule_id: string;
  new_status: ComplianceStatus;
  reviewer_name: string;
  reviewer_role: string;
  review_comments: string;
}): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE_URL}/review/override`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to submit review override');
  }
  return res.json();
}

export async function fetchBenchmarkMetrics(): Promise<BenchmarkMetrics> {
  const res = await fetch(`${API_BASE_URL}/metrics/benchmark`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch benchmark metrics');
  return res.json();
}

export function getDossierPrintUrl(filingId: string): string {
  return `${API_BASE_URL}/vendors/${filingId}/dossier/html`;
}
