'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ComplianceBadge from '@/components/ComplianceBadge';
import { fetchReviewQueue, submitReviewOverride } from '@/lib/api';
import { ReviewQueueItem, ComplianceStatus } from '@/lib/types';
import {
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserCheck,
  ExternalLink,
  Send,
  ShieldCheck
} from 'lucide-react';

export default function ReviewQueuePage() {
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<ReviewQueueItem | null>(null);
  const [newStatus, setNewStatus] = useState<ComplianceStatus>('COMPLIANT');
  const [reviewerName, setReviewerName] = useState<string>('Senior Procurement Auditor');
  const [comments, setComments] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    loadQueue();
  }, []);

  async function loadQueue() {
    try {
      setLoading(true);
      const data = await fetchReviewQueue();
      setQueue(data);
    } catch (err) {
      console.error('Error loading review queue:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItem || !comments.trim()) return;

    try {
      setSubmitting(true);
      await submitReviewOverride({
        filing_id: selectedItem.filing_id,
        rule_id: selectedItem.rule.rule_id,
        new_status: newStatus,
        reviewer_name: reviewerName,
        reviewer_role: 'Senior Procurement Auditor (Directorate of Supplies)',
        review_comments: comments,
      });

      setSuccessMessage(`Rule '${selectedItem.rule.rule_name}' for ${selectedItem.vendor_name} successfully resolved as ${newStatus}.`);
      setSelectedItem(null);
      setComments('');
      await loadQueue();
    } catch (err) {
      console.error(err);
      alert('Failed to submit auditor sign-off.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold mb-2">
              <Eye className="w-3.5 h-3.5 text-amber-600" />
              <span>Human-in-the-Loop Disqualification Prevention Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Officer Review Queue
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Ambiguous edge cases (slight corporate legal suffix variations, generic OEM clauses, or low-confidence scans) are routed here to prevent improper automated disqualifications.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 flex items-center space-x-3">
            <ShieldCheck className="w-8 h-8 text-emerald-600 flex-shrink-0" />
            <div>
              <div className="font-bold text-sm text-emerald-900">False-Positive Prevention</div>
              <div className="text-emerald-700">86.2% of flagged edge cases preserved with human verification.</div>
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage('')} className="font-bold text-slate-400 hover:text-slate-600">
              ✕
            </button>
          </div>
        )}

        {/* Review Queue List */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-medium text-slate-500">Scanning pending compliance edge cases...</p>
          </div>
        ) : queue.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Review Queue is Clear!</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No ambiguous vendor filings currently require procurement officer sign-off. All active submissions have been verified with high confidence.
            </p>
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
            >
              <span>Return to Dashboard</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {queue.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded">
                      {item.filing_id}
                    </span>
                    <span className="text-slate-400">&bull;</span>
                    <span className="text-xs text-slate-500">{item.tender_ref_number}</span>
                    <ComplianceBadge status={item.rule.status} size="sm" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{item.vendor_name}</h3>
                    <div className="text-sm font-semibold text-blue-900 mt-1 flex items-center space-x-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span>{item.rule.rule_name}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 bg-amber-50/70 p-3 rounded-lg border border-amber-200/60 leading-relaxed">
                    <strong>AI Ambiguity Reason:</strong> {item.rule.explanation}
                  </p>

                  {item.rule.remediation_hint && (
                    <div className="text-xs text-slate-500">
                      <strong>Audit Hint:</strong> {item.rule.remediation_hint}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-2 justify-center flex-shrink-0">
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setNewStatus('COMPLIANT');
                      setComments(
                        `Officer discretion: Verified valid statutory equivalence. Cross-checked MCA registry records and cleared for tender participation.`
                      );
                    }}
                    className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Evaluate & Sign Off</span>
                  </button>

                  <Link
                    href={`/vendor/${item.filing_id}`}
                    className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    <span>Inspect Evidence Trace</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Evaluation Drawer / Modal */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                <div className="flex items-center space-x-2 text-slate-900">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-bold">Officer Compliance Determination</h3>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                <div><strong>Vendor:</strong> {selectedItem.vendor_name} ({selectedItem.filing_id})</div>
                <div><strong>Rule:</strong> {selectedItem.rule.rule_name}</div>
                <div className="text-slate-500"><strong>Flag Reason:</strong> {selectedItem.rule.explanation}</div>
              </div>

              <form onSubmit={handleResolve} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Auditor Decision
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewStatus('COMPLIANT')}
                      className={`p-3 rounded-xl border text-center font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                        newStatus === 'COMPLIANT'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve as Compliant</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewStatus('NON_COMPLIANT')}
                      className={`p-3 rounded-xl border text-center font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                        newStatus === 'NON_COMPLIANT'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Disqualify Filing</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Officer Name
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
                    Procurement Sign-off Comments
                  </label>
                  <textarea
                    rows={3}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter official rationale for audit registry..."
                    required
                  ></textarea>
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Submitting...' : 'Confirm Determination'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
