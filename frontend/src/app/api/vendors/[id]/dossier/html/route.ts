import { NextResponse } from 'next/server';
import { initialVendorFilings } from '@/lib/mockData';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const dossier = initialVendorFilings.find((f) => f.filing_id === params.id);
  if (!dossier) {
    return new NextResponse('Filing not found', { status: 404 });
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>TenderGuard AI - Compliance Dossier (${dossier.filing_id})</title>
  <style>
    body { font-family: -apple-system, sans-serif; background: #f8fafc; padding: 30px; margin: 0; color: #0f172a; }
    .sheet { background: #fff; max-width: 850px; margin: 0 auto; padding: 40px; border: 1px solid #cbd5e1; border-radius: 8px; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 20px; display: flex; justify-content: space-between; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #0f172a; color: #fff; padding: 10px; text-align: left; font-size: 12px; }
    td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div>
        <h1 style="margin: 0; font-size: 20px;">TENDERGUARD AI COMPLIANCE DOSSIER</h1>
        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Filing ID: ${dossier.filing_id} | Timestamp: ${dossier.submission_timestamp}</div>
      </div>
      <div>
        <span style="padding: 6px 12px; border-radius: 4px; font-weight: bold; background: #ecfdf5; color: #059669; border: 1px solid #059669;">
          ${dossier.overall_status}
        </span>
      </div>
    </div>
    <div style="margin: 20px 0; padding: 15px; background: #f1f5f9; border-radius: 6px;">
      <div><strong>Vendor:</strong> ${dossier.vendor_name}</div>
      <div style="margin-top: 4px;"><strong>Tender Ref:</strong> ${dossier.tender_ref_number} (${dossier.tender_title})</div>
      <div style="margin-top: 4px;"><strong>Compliance Score:</strong> ${dossier.overall_compliance_score}% (${dossier.compliant_count}/${dossier.total_checks} Rules Passed)</div>
    </div>
    <h3>Statutory Verification Breakdown</h3>
    <table>
      <thead>
        <tr><th>Rule Name</th><th>Status</th><th>Explanation</th></tr>
      </thead>
      <tbody>
        ${dossier.checks.map((c) => `<tr><td><strong>${c.rule_name}</strong></td><td>${c.status}</td><td>${c.explanation}</td></tr>`).join('')}
      </tbody>
    </table>
    <div style="margin-top: 30px; font-size: 11px; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 15px;">
      <strong>Zero-Retention Cryptographic SHA-256 Digest:</strong><br>
      <code>${dossier.audit_hash}</code>
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
