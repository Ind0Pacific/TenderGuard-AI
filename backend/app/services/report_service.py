import os
from datetime import datetime
from backend.app.models.schemas import VendorAuditDossier
from backend.app.config import settings

class ReportService:
    """
    Generates official procurement audit dossiers and executive compliance summaries.
    """

    @staticmethod
    def generate_html_dossier(dossier: VendorAuditDossier) -> str:
        """Renders an executive, printable compliance audit certificate in HTML."""
        status_colors = {
            "COMPLIANT": ("#059669", "#ecfdf5", "COMPLIANT / VERIFIED"),
            "NON_COMPLIANT": ("#dc2626", "#fef2f2", "NON-COMPLIANT / FLAGGED"),
            "REQUIRES_REVIEW": ("#d97706", "#fffbeb", "REQUIRES OFFICER REVIEW")
        }
        accent_color, bg_light, status_label = status_colors.get(dossier.overall_status.value, ("#2563eb", "#eff6ff", "AUDITED"))

        check_rows = []
        for c in dossier.checks:
            c_accent, c_bg, _ = status_colors.get(c.status.value, ("#4b5563", "#f3f4f6", c.status.value))
            
            evidence_snippets = []
            for ev in c.evidences:
                evidence_snippets.append(f"""
                <div style="margin-top: 6px; padding: 6px 10px; background: #f8fafc; border-left: 3px solid #3b82f6; font-size: 12px; font-family: monospace;">
                    <strong>[Page {ev.page_number} - {ev.field_name}]:</strong> {ev.context_snippet} 
                    <span style="color: #64748b;">(Confidence: {int(ev.confidence*100)}% | Box: [{round(ev.bounding_box.ymin,2)}, {round(ev.bounding_box.xmin,2)}, {round(ev.bounding_box.ymax,2)}, {round(ev.bounding_box.xmax,2)}])</span>
                </div>
                """)

            check_rows.append(f"""
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 12px; font-weight: 600; font-size: 13px; color: #1e293b;">{c.rule_name}</td>
                <td style="padding: 12px; font-size: 12px; color: #64748b;">{c.category}</td>
                <td style="padding: 12px;">
                    <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; background: {c_bg}; color: {c_accent}; border: 1px solid {c_accent};">
                        {c.status.value}
                    </span>
                </td>
                <td style="padding: 12px; font-size: 12px; color: #334155; max-width: 320px;">
                    <div>{c.explanation}</div>
                    {''.join(evidence_snippets)}
                    {f'<div style="margin-top: 4px; color: #b91c1c; font-size: 11px;">⚠️ <em>{c.remediation_hint}</em></div>' if c.remediation_hint else ''}
                </td>
            </tr>
            """)

        html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>TenderGuard AI - Compliance Dossier ({dossier.filing_id})</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f1f5f9; padding: 30px; margin: 0; color: #0f172a; }}
        .sheet {{ background: #ffffff; max-width: 900px; margin: 0 auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 40px; border: 1px solid #cbd5e1; }}
        .header {{ display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 20px; }}
        .badge {{ display: inline-block; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 800; background: {bg_light}; color: {accent_color}; border: 2px solid {accent_color}; }}
        .grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; background: #f8fafc; padding: 18px; border-radius: 6px; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
        th {{ background: #0f172a; color: #ffffff; text-align: left; padding: 10px 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }}
        .footer {{ margin-top: 35px; border-top: 1px dashed #94a3b8; padding-top: 15px; font-size: 11px; color: #64748b; line-height: 1.6; }}
        @media print {{ body {{ background: #fff; padding: 0; }} .sheet {{ box-shadow: none; border: none; padding: 0; }} }}
    </style>
</head>
<body>
    <div class="sheet">
        <div class="header">
            <div>
                <h1 style="margin: 0; font-size: 22px; color: #0f172a; letter-spacing: -0.5px;">TENDERGUARD AI COMPLIANCE DOSSIER</h1>
                <div style="font-size: 13px; color: #475569; margin-top: 4px;">An Explainable AI Framework for Vendor Compliance Verification in Government Procurement</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Dossier Identifier: <strong>{dossier.filing_id}</strong> | Timestamp: {dossier.submission_timestamp}</div>
            </div>
            <div>
                <span class="badge">{status_label}</span>
            </div>
        </div>

        <div class="grid">
            <div>
                <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Vendor Organization</div>
                <div style="font-size: 15px; font-weight: bold; color: #0f172a; margin-top: 3px;">{dossier.vendor_name}</div>
            </div>
            <div>
                <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Tender Reference & Title</div>
                <div style="font-size: 14px; font-weight: bold; color: #0f172a; margin-top: 3px;">{dossier.tender_ref_number}</div>
                <div style="font-size: 12px; color: #475569;">{dossier.tender_title}</div>
            </div>
            <div>
                <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Audit Efficiency Score</div>
                <div style="font-size: 15px; font-weight: bold; color: #059669; margin-top: 3px;">{dossier.overall_compliance_score}% ({dossier.compliant_count}/{dossier.total_checks} Rules Satisfied)</div>
            </div>
            <div>
                <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Processing Duration & Savings</div>
                <div style="font-size: 14px; font-weight: bold; color: #2563eb; margin-top: 3px;">{dossier.processing_duration_sec}s automated vs 45 mins manual ({dossier.time_saved_percent}% time saved)</div>
            </div>
        </div>

        <h3 style="font-size: 15px; color: #0f172a; margin-bottom: 8px;">Detailed Explainability & Verification Trail</h3>
        <table>
            <thead>
                <tr>
                    <th>Statutory Rule</th>
                    <th>Category</th>
                    <th>Verdict</th>
                    <th>Explanation & Visual Evidence Trace</th>
                </tr>
            </thead>
            <tbody>
                {''.join(check_rows)}
            </tbody>
        </table>

        <div class="footer">
            <strong>Zero-Retention Cryptographic Security Proof:</strong><br>
            Master SHA-256 Digest: <code>{dossier.audit_hash}</code><br>
            Privacy Guarantee: Zero-retention ephemeral processing compliant with Government Procurement Data Confidentiality Directives. All raw document PII (Aadhaar, personal phone, bank details) redacted prior to evaluation.
        </div>
    </div>
</body>
</html>"""
        return html

report_service = ReportService()
