'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ComplianceBadge from '@/components/ComplianceBadge';
import { fetchReviewQueue, submitReviewOverride } from '@/lib/api';
import { ReviewQueueItem } from '@/lib/types';
import {
  Eye,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  Send,
  ExternalLink,
  ShieldCheck,
  XCircle,
  Sparkles,
} from 'lucide-react';

export default function ReviewPage() {
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<ReviewQueueItem | null>(null);
  const [newStatus, setNewStatus] = useState<'COMPLIANT' | 'NON_COMPLIANT'>('COMPLIANT');
  const [reviewerName, setReviewerName] = useState<string>('Officer R. Sharma');
  const [comments, setComments] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = () => {
    setLoading(true);
    fetchReviewQueue()
      .then((data) => setQueue(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSubmitting(true);
    try {
      await submitReviewOverride({
        filing_id: selectedItem.filing_id,
        rule_id: selectedItem.rule.rule_id,
        new_status: newStatus,
        reviewer_name: reviewerName,
        reviewer_role: 'Procurement Officer',
        review_comments: comments,
      });

      setSuccessMessage(
        `Filing ${selectedItem.filing_id} successfully marked as ${newStatus} by ${reviewerName}. Audit trail updated.`
      );
      setSelectedItem(null);
      setComments('');
      loadQueue();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh-surface flex flex-col text-on-surface font-manrope relative overflow-hidden">
      {/* Ambient Aurora Light Spheres */}
      <div className="absolute top-10 right-0 w-[550px] h-[550px] bg-gradient-to-bl from-teal-500/15 via-emerald-400/10 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[500px] left-0 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/15 via-secondary/10 to-transparent blur-[130px] rounded-full pointer-events-none -z-10" />

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-500/30">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Human-in-the-Loop Disqualification Prevention Portal</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gradient-sovereign tracking-tight">
              Officer Review Queue
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Ambiguous edge cases (slight corporate legal suffix variations, generic OEM clauses, or low-confidence scans) are routed here to prevent improper automated disqualifications.
            </p>
          </div>

          <div className="glass-panel-dark border border-emerald-500/30 rounded-2xl p-4 text-xs flex items-center space-x-3 shadow-lg">
            <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-sm text-emerald-300">False-Positive Prevention</div>
              <div className="text-slate-300">86.2% of flagged edge cases preserved with human verification.</div>
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-xl text-xs text-emerald-300 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage('')} className="font-bold text-slate-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Review Queue List */}
        {loading ? (
          <div className="text-center py-16 glass-panel rounded-2xl">
            <div className="w-8 h-8 border-3 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-medium text-slate-400">Scanning pending compliance edge cases...</p>
          </div>
        ) : queue.length === 0 ? (
          <div className="text-center py-16 glass-panel gradient-border-card rounded-2xl shadow-xl space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">Review Queue is Clear!</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              No ambiguous vendor filings currently require procurement officer sign-off. All active submissions have been verified with high confidence.
            </p>
            <Link
              href="/"
              className="btn-gradient-primary inline-flex items-center space-x-1.5 px-5 py-2.5 text-white rounded-xl text-xs font-semibold shadow-md"
            >
              <span>Return to Audit Hub</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {queue.map((item, idx) => (
              <div
                key={idx}
                className="glass-panel gradient-border-card rounded-2xl p-6 shadow-xl hover:border-teal-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-teal-300 bg-slate-900 border border-white/10 px-2.5 py-0.5 rounded-lg">
                      {item.filing_id}
                    </span>
                    <span className="text-slate-600">&bull;</span>
                    <span className="text-xs text-slate-400">{item.tender_ref_number}</span>
                    <ComplianceBadge status={item.rule.status} size="sm" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{item.vendor_name}</h3>
                    <div className="text-sm font-semibold text-teal-300 mt-1 flex items-center space-x-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>{item.rule.rule_name}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-900/80 p-3.5 rounded-xl border border-white/10 leading-relaxed">
                    <strong className="text-amber-400">AI Ambiguity Reason:</strong> {item.rule.explanation}
                  </p>

                  {item.rule.remediation_hint && (
                    <div className="text-xs text-slate-400">
                      <strong className="text-teal-300">Audit Hint:</strong> {item.rule.remediation_hint}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 justify-center shrink-0">
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setNewStatus('COMPLIANT');
                      setComments(
                        `Officer discretion: Verified valid statutory equivalence. Cross-checked MCA registry records and cleared for tender participation.`
                      );
                    }}
                    className="btn-gradient-primary inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Evaluate &amp; Sign Off</span>
                  </button>

                  <Link
                    href={`/vendor/${item.filing_id}`}
                    className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-teal-300 border border-white/10 hover:border-teal-500/30 rounded-xl text-xs font-medium transition-all"
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
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="glass-panel-dark gradient-border-card rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-white/10 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-white">
              <div className="flex items-center justify-between border-b pb-3 border-white/10">
                <div className="flex items-center space-x-2 text-white">
                  <UserCheck className="w-5 h-5 text-teal-400" />
                  <h3 className="text-lg font-bold">Officer Compliance Determination</h3>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-slate-400 hover:text-white text-sm font-bold p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-white/10 text-xs space-y-1">
                <div><strong className="text-slate-400">Vendor:</strong> <span className="text-teal-300 font-semibold">{selectedItem.vendor_name}</span> ({selectedItem.filing_id})</div>
                <div><strong className="text-slate-400">Rule:</strong> <span className="text-white">{selectedItem.rule.rule_name}</span></div>
                <div className="text-slate-300"><strong className="text-amber-400">Flag Reason:</strong> {selectedItem.rule.explanation}</div>
              </div>

              <form onSubmit={handleResolve} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider font-label mb-2">
                    Auditor Decision
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewStatus('COMPLIANT')}
                      className={`p-3 rounded-xl border text-center font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                        newStatus === 'COMPLIANT'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-900 text-slate-400 border-white/10 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Approve as Compliant</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewStatus('NON_COMPLIANT')}
                      className={`p-3 rounded-xl border text-center font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                        newStatus === 'NON_COMPLIANT'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500 shadow-md shadow-rose-500/20'
                          : 'bg-slate-900 text-slate-400 border-white/10 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>Disqualify Filing</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider font-label mb-1">
                    Officer Name
                  </label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white font-medium focus:outline-none focus:border-teal-400 transition-all text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider font-label mb-1">
                    Procurement Sign-off Comments
                  </label>
                  <textarea
                    rows={3}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white font-medium focus:outline-none focus:border-teal-400 transition-all text-xs"
                    placeholder="Enter official rationale for audit registry..."
                    required
                  ></textarea>
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-medium border border-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-gradient-primary inline-flex items-center space-x-1.5 px-5 py-2.5 text-white rounded-xl text-xs font-bold transition-all shadow-md"
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
