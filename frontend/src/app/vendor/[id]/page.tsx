'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ComplianceBadge from '@/components/ComplianceBadge';
import EvidenceCard from '@/components/EvidenceCard';
import DocumentViewer from '@/components/DocumentViewer';
import { fetchVendorFiling, getDossierPrintUrl, submitReviewOverride } from '@/lib/api';
import { VendorAuditDossier, VisualEvidence, ComplianceStatus } from '@/lib/types';
import {
  ArrowLeft,
  Printer,
  Shield,
  Lock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  UserCheck,
  Send
} from 'lucide-react';

export default function VendorDossierPage() {
  const params = useParams();
  const filingId = params?.id as string;

  const [dossier, setDossier] = useState<VendorAuditDossier | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEvidence, setSelectedEvidence] = useState<VisualEvidence | null>(null);
  
  // Officer Review Modal state
  const [showOverrideModal, setShowOverrideModal] = useState<boolean>(false);
  const [overrideRuleId, setOverrideRuleId] = useState<string>('');
  const [overrideStatus, setOverrideStatus] = useState<ComplianceStatus>('COMPLIANT');
  const [reviewerName, setReviewerName] = useState<string>('Senior Procurement Officer');
  const [reviewComments, setReviewComments] = useState<string>('');
  const [submittingOverride, setSubmittingOverride] = useState<boolean>(false);

  useEffect(() => {
    if (filingId) {
      loadDossier();
    }
  }, [filingId]);

  async function loadDossier() {
    try {
      setLoading(true);
      const data = await fetchVendorFiling(filingId);
      setDossier(data);
      // Default to first visual evidence trace if available
      for (const check of data.checks) {
        if (check.evidences && check.evidences.length > 0) {
          setSelectedEvidence(check.evidences[0]);
          break;
        }
      }
    } catch (err) {
      console.error('Failed to load dossier:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleOverrideSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!overrideRuleId || !reviewComments) return;

    try {
      setSubmittingOverride(true);
      await submitReviewOverride({
        filing_id: filingId,
        rule_id: overrideRuleId,
        new_status: overrideStatus,
        reviewer_name: reviewerName,
        reviewer_role: 'Chief Technical Evaluator (Procurement Directorate)',
        review_comments: reviewComments,
      });
      setShowOverrideModal(false);
      setReviewComments('');
      await loadDossier();
    } catch (err) {
      console.error('Error submitting override:', err);
      alert('Failed to submit review override.');
    } finally {
      setSubmittingOverride(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-medium text-slate-600">Reconstructing Explainable Compliance Trace...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
          <FileText className="w-16 h-16 text-slate-300 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Filing Dossier Not Found</h2>
          <p className="text-sm text-slate-500">The requested vendor filing ID does not exist in the audit registry.</p>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Audit Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="p-2 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-600 transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded">
                  {dossier.filing_id}
                </span>
                <span className="text-slate-400">&bull;</span>
                <span className="text-xs text-slate-500">{dossier.submission_timestamp}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                {dossier.vendor_name}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                const firstReview = dossier.checks.find((c) => c.status === 'REQUIRES_REVIEW') || dossier.checks[0];
                setOverrideRuleId(firstReview.rule_id);
                setShowOverrideModal(true);
              }}
              className="inline-flex items-center space-x-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Officer Sign-off / Override</span>
            </button>

            <a
              href={getDossierPrintUrl(dossier.filing_id)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print Official Dossier</span>
            </a>
          </div>
        </div>

        {/* Executive Summary Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
            {/* Status & Score */}
            <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-slate-100 pb-4 lg:pb-0 lg:pr-6 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Overall Compliance Verdict
              </span>
              <ComplianceBadge status={dossier.overall_status} size="lg" />
              <div className="pt-2 flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-900">{dossier.overall_compliance_score}%</span>
                <span className="text-xs text-slate-500 font-medium">Compliance Score</span>
              </div>
            </div>

            {/* Tender & Authority */}
            <div className="lg:col-span-2 space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Procurement Requirement Scope
              </span>
              <h3 className="text-base font-bold text-slate-900">
                {dossier.tender_ref_number}: {dossier.tender_title}
              </h3>
              <p className="text-xs text-slate-500">
                Cross-referenced against statutory checklist: GSTIN-PAN alignment, OEM MAF validity, and MSME classification.
              </p>
              <div className="pt-2 flex items-center space-x-4 text-xs text-slate-600">
                <span className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>{dossier.compliant_count} Passed</span>
                </span>
                <span className="flex items-center space-x-1">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <span>{dossier.non_compliant_count} Failed</span>
                </span>
                <span className="flex items-center space-x-1">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>{dossier.requires_review_count} Review Flag</span>
                </span>
              </div>
            </div>

            {/* Zero Retention Proof */}
            <div className="lg:col-span-1 bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 font-semibold">
                <span className="flex items-center space-x-1 text-purple-700">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Zero-Retention Certified</span>
                </span>
                <span className="text-emerald-600 font-mono text-[11px] font-bold">100% PII Masked</span>
              </div>
              <div className="font-mono text-[10px] text-slate-500 break-all bg-white p-2 rounded border border-slate-200">
                SHA-256: {dossier.audit_hash}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>AI Automated Time:</span>
                <strong className="text-blue-600">{dossier.processing_duration_sec}s ({dossier.time_saved_percent}% saved)</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Side-by-Side Explainability Grid: Rules List on Left, Document Viewer on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: All Compliance Rules & Evidence Cards (7 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span>Statutory Rule Checks</span>
                <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                  {dossier.checks.length}
                </span>
              </h2>
              <span className="text-xs text-slate-500">Click any evidence chip to inspect document</span>
            </div>

            <div className="space-y-4">
              {dossier.checks.map((check) => (
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
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Visual Evidence Inspection Canvas</span>
              </h2>
              {selectedEvidence && (
                <span className="text-xs text-slate-500 font-medium truncate max-w-[200px]">
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center space-x-2 text-slate-900">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold">Procurement Officer Audit Override</h3>
              </div>
              <button
                onClick={() => setShowOverrideModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOverrideSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Select Target Rule Check
                </label>
                <select
                  value={overrideRuleId}
                  onChange={(e) => setOverrideRuleId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
                >
                  {dossier.checks.map((c) => (
                    <option key={c.rule_id} value={c.rule_id}>
                      [{c.status}] {c.rule_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  New Compliance Verdict
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['COMPLIANT', 'REQUIRES_REVIEW', 'NON_COMPLIANT'] as ComplianceStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setOverrideStatus(st)}
                      className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition-all ${
                        overrideStatus === st
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Auditor Name & Designation
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Official Justification & Audit Comments
                </label>
                <textarea
                  rows={3}
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Detail the rationale for overriding this AI compliance flag (e.g. verified original MCA certificate, confirmed OEM validity letter with principal)..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOverride}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm"
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
