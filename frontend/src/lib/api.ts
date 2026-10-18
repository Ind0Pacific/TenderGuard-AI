import {
  VendorAuditDossier,
  TenderRequirementConfig,
  ReviewQueueItem,
  BenchmarkMetrics,
  ComplianceStatus
} from './types';

function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return 'http://127.0.0.1:8000/api';
}

async function safeFetch(path: string, options?: RequestInit): Promise<Response> {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}${path}`, options);
    if (res.ok) return res;
    // If not ok and we have a secondary fallback
    if (baseUrl !== '/api' && typeof window !== 'undefined') {
      const fallbackRes = await fetch(`/api${path}`, options);
      if (fallbackRes.ok) return fallbackRes;
    }
    return res;
  } catch (err) {
    if (baseUrl !== '/api' && typeof window !== 'undefined') {
      const fallbackRes = await fetch(`/api${path}`, options);
      if (fallbackRes.ok) return fallbackRes;
    }
    throw err;
  }
}

export async function fetchTenders(): Promise<TenderRequirementConfig[]> {
  const res = await safeFetch('/tenders', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch tenders');
  return res.json();
}

export async function fetchTender(id: string): Promise<TenderRequirementConfig> {
  const res = await safeFetch(`/tenders/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch tender ${id}`);
  return res.json();
}

export async function fetchVendorFilings(status?: string, search?: string): Promise<VendorAuditDossier[]> {
  const params = new URLSearchParams();
  if (status && status !== 'ALL') params.append('status', status);
  if (search) params.append('search', search);

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await safeFetch(`/vendors${query}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch vendor filings');
  return res.json();
}

export async function fetchVendorFiling(filingId: string): Promise<VendorAuditDossier> {
  const res = await safeFetch(`/vendors/${filingId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch filing ${filingId}`);
  return res.json();
}

export async function uploadVendorDocuments(formData: FormData): Promise<VendorAuditDossier> {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/vendors/upload`, {
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
  const res = await safeFetch('/review/queue', { cache: 'no-store' });
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
  const res = await safeFetch('/review/override', {
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
  const res = await safeFetch('/metrics/benchmark', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch benchmark metrics');
  return res.json();
}

export function getDossierPrintUrl(filingId: string): string {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/vendors/${filingId}/dossier/html`;
}
