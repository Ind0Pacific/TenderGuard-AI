'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ComplianceBadge from '@/components/ComplianceBadge';
import EvidenceCard from '@/components/EvidenceCard';
import DocumentViewer from '@/components/DocumentViewer';
import { fetchVendorFiling, submitReviewOverride, getDossierPrintUrl } from '@/lib/api';
import {
  VendorAuditDossier,
  VisualEvidence,
  ComplianceStatus,
  ComplianceCheckItem,
} from '@/lib/types';
import {
  ArrowLeft,
  FileText,
  Printer,
  UserCheck,
  Shield,
  Lock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  Sparkles,
} from 'lucide-react';

export default function VendorDossierPage() {
  const params = useParams();
  const id = params?.id as string;

  const [dossier, setDossier] = useState<VendorAuditDossier | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEvidence, setSelectedEvidence] = useState<VisualEvidence | null>(null);

  // Human-in-the-loop override state
  const [showOverrideModal, setShowOverrideModal] = useState<boolean>(false);
  const [overrideRuleId, setOverrideRuleId] = useState<string>('');
  const [overrideStatus, setOverrideStatus] = useState<ComplianceStatus>('COMPLIANT');
  const [reviewerName, setReviewerName] = useState<string>('Officer R. Sharma');
  const [reviewComments, setReviewComments] = useState<string>('');
  const [submittingOverride, setSubmittingOverride] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchVendorFiling(id)
      .then((data: VendorAuditDossier) => {
        setDossier(data);
        // Default select first available evidence if present
        for (const check of data.checks) {
          if (check.evidences && check.evidences.length > 0) {
            setSelectedEvidence(check.evidences[0]);
            break;
          }
        }
      })
      .catch((err: unknown) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dossier || !overrideRuleId) return;

    setSubmittingOverride(true);
    try {
      await submitReviewOverride({
        filing_id: dossier.filing_id,
        rule_id: overrideRuleId,
        new_status: overrideStatus,
        reviewer_name: reviewerName,
        reviewer_role: 'Senior Compliance Officer',
        review_comments: reviewComments,
      });
      const updated = await fetchVendorFiling(dossier.filing_id);
      setDossier(updated);
      setShowOverrideModal(false);
      setReviewComments('');
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setSubmittingOverride(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh-surface flex flex-col text-on-surface font-manrope relative overflow-hidden">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3 glass-panel px-6 py-5 rounded-2xl">
            <div className="w-10 h-10 border-3 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold text-gradient-sovereign">Reconstructing Explainable Compliance Trace...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="min-h-screen bg-mesh-surface flex flex-col text-on-surface font-manrope relative overflow-hidden">
        <Navbar />
        <div className="flex-1 max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
          <FileText className="w-16 h-16 text-slate-600 mx-auto" />
          <h2 className="text-xl font-bold text-white">Filing Dossier Not Found</h2>
          <p className="text-sm text-slate-400">The requested vendor filing ID does not exist in the audit registry.</p>
          <Link
            href="/"
            className="btn-gradient-primary inline-flex items-center space-x-2 px-5 py-2.5 text-white rounded-xl text-sm font-semibold shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Audit Hub</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh-surface flex flex-col text-on-surface font-manrope relative overflow-hidden">
      {/* Ambient Aurora Light Spheres */}
      <div className="absolute top-10 right-0 w-[550px] h-[550px] bg-gradient-to-bl from-teal-500/15 via-emerald-400/10 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[500px] left-0 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/15 via-secondary/10 to-transparent blur-[130px] rounded-full pointer-events-none -z-10" />

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 relative z-10">
        {/* Navigation Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="p-2.5 bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-white/10 text-teal-400 hover:text-white transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-semibold text-teal-300 bg-slate-900 border border-white/10 px-2.5 py-0.5 rounded-lg">
                  {dossier.filing_id}
                </span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-xs text-slate-400">{dossier.submission_timestamp}</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold text-gradient-sovereign mt-1">
                {dossier.vendor_name}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                const firstReview = dossier.checks.find((c: ComplianceCheckItem) => c.status === 'REQUIRES_REVIEW') || dossier.checks[0];
                setOverrideRuleId(firstReview.rule_id);
                setShowOverrideModal(true);
              }}
              className="btn-gradient-primary inline-flex items-center space-x-2 px-4 py-2.5 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition-all"
            >
              <UserCheck className="w-4 h-4 text-emerald-300" />
              <span>Officer Sign-off / Override</span>
            </button>

            <a
              href={getDossierPrintUrl(dossier.filing_id)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-900/80 hover:bg-slate-800 text-teal-300 hover:text-white border border-white/10 hover:border-teal-500/40 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all"
            >
              <Printer className="w-4 h-4 text-teal-400" />
              <span>Print Official Dossier</span>
            </a>
          </div>
        </div>

        {/* Executive Summary Card */}
        <div className="glass-panel gradient-border-card rounded-2xl p-6 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
            {/* Status & Score */}
            <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-white/10 pb-4 lg:pb-0 lg:pr-6 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block font-label">
                Overall Compliance Verdict
              </span>
              <ComplianceBadge status={dossier.overall_status} size="lg" />
              <div className="pt-2 flex items-baseline space-x-2">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-400 font-mono">
                  {dossier.overall_compliance_score}%
                </span>
                <span className="text-xs text-slate-400 font-medium">Compliance Score</span>
              </div>
            </div>

            {/* Tender & Authority */}
            <div className="lg:col-span-2 space-y-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block font-label">
                Procurement Requirement Scope
              </span>
              <h3 className="text-base font-bold text-white">
                {dossier.tender_ref_number}: {dossier.tender_title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Cross-referenced against statutory checklist: GSTIN-PAN alignment, OEM MAF validity, and MSME classification.
              </p>
              <div className="pt-2 flex items-center space-x-4 text-xs">
                <span className="flex items-center space-x-1.5 text-emerald-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>{dossier.compliant_count} Passed</span>
                </span>
                <span className="flex items-center space-x-1.5 text-rose-300">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>{dossier.non_compliant_count} Failed</span>
                </span>
                <span className="flex items-center space-x-1.5 text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>{dossier.requires_review_count} Review Flag</span>
                </span>
              </div>
            </div>

            {/* Zero Retention Proof */}
            <div className="lg:col-span-1 bg-slate-950/80 rounded-xl p-4 border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center space-x-1 text-teal-300">
                  <Lock className="w-3.5 h-3.5 text-teal-400" />
                  <span>Zero-Retention Certified</span>
                </span>
                <span className="text-emerald-400 font-mono text-[11px] font-bold">100% PII Masked</span>
              </div>
              <div className="font-mono text-[10px] text-teal-300 break-all bg-slate-900 p-2 rounded-lg border border-white/5">
                SHA-256: {dossier.audit_hash}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>AI Automated Time:</span>
                <strong className="text-teal-300 font-mono">{dossier.processing_duration_sec}s ({dossier.time_saved_percent}% saved)</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Side-by-Side Explainability Grid: Rules List on Left, Document Viewer on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: All Compliance Rules & Evidence Cards (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Statutory Rule Checks</span>
                <span className="text-xs bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold px-2 py-0.5 rounded-full">
                  {dossier.checks.length}
                </span>
              </h2>
              <span className="text-xs text-slate-400">Click any evidence chip to inspect document</span>
            </div>

            <div className="space-y-4">
              {dossier.checks.map((check: ComplianceCheckItem) => (
                <EvidenceCard
                  key={check.rule_id}
                  check={check}
                  selectedEvidence={selectedEvidence}
                  onSelectEvidence={(ev) => setSelectedEvidence(ev)}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Interactive Document Canvas & Bounding Box Viewer (6 cols sticky) */}
          <div className="lg:col-span-6 sticky top-24 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Shield className="w-4 h-4 text-teal-400" />
                <span>Visual Evidence Inspection Canvas</span>
              </h2>
              {selectedEvidence && (
                <span className="text-xs text-teal-300 font-medium truncate max-w-[200px] font-mono">
                  {selectedEvidence.source_doc_name}
                </span>
              )}
            </div>

            <div className="min-h-[550px] max-h-[820px] h-[78vh]">
              <DocumentViewer evidence={selectedEvidence} />
            </div>
          </div>
        </div>
      </main>

      {/* Human-in-the-Loop Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="glass-panel-dark gradient-border-card rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-white/10 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-white">
            <div className="flex items-center justify-between border-b pb-3 border-white/10">
              <div className="flex items-center space-x-2 text-white">
                <UserCheck className="w-5 h-5 text-teal-400" />
                <h3 className="text-lg font-bold">Procurement Officer Audit Override</h3>
              </div>
              <button
                onClick={() => setShowOverrideModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOverrideSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider font-label mb-1">
                  Select Target Rule Check
                </label>
                <select
                  value={overrideRuleId}
                  onChange={(e) => setOverrideRuleId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white font-medium focus:outline-none focus:border-teal-400 text-xs"
                >
                  {dossier.checks.map((c: ComplianceCheckItem) => (
                    <option key={c.rule_id} value={c.rule_id} className="bg-slate-900 text-white">
                      [{c.status}] {c.rule_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider font-label mb-1">
                  New Compliance Verdict
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['COMPLIANT', 'REQUIRES_REVIEW', 'NON_COMPLIANT'] as ComplianceStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setOverrideStatus(st)}
                      className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                        overrideStatus === st
                          ? 'bg-teal-500/25 text-teal-200 border-teal-400 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-white/10 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider font-label mb-1">
                  Auditor Name &amp; Designation
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white font-medium focus:outline-none focus:border-teal-400 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider font-label mb-1">
                  Official Justification &amp; Audit Comments
                </label>
                <textarea
                  rows={3}
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Detail the rationale for overriding this AI compliance flag (e.g. verified original MCA certificate, confirmed OEM validity letter with principal)..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white font-medium focus:outline-none focus:border-teal-400 text-xs"
                  required
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl font-medium text-xs border border-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOverride}
                  className="btn-gradient-primary inline-flex items-center space-x-1.5 px-5 py-2.5 text-white rounded-xl font-semibold text-xs transition-all shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingOverride ? 'Saving...' : 'Sign & Apply Override'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
