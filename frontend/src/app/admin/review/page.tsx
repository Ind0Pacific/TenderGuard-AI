'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import TestDocGenerator from '@/components/TestDocGenerator';
import SpecimenViewerModal, { SpecimenData } from '@/components/SpecimenViewerModal';
import {
  generateCaseCSpecimenDataUrl,
  generateGenericSpecimenDataUrl,
} from '@/lib/specimenGenerators';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Key,
  Copy,
  Check,
  Video,
  UserCheck,
  RefreshCw,
  Search,
  Building,
  Filter,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Calendar,
  Lock,
  Info,
  Eye,
} from 'lucide-react';

interface EdgeCaseItem {
  vendorId: string;
  phoneNumber: string;
  companyName: string;
  category: string;
  applicationStatus: string;
  createdAt: string;
  totalLogs: number;
  edgeCaseLogs: Array<{
    id: string;
    docType: string;
    sha256Hash: string;
    status: string;
    expiryDate: string | null;
    confidenceScore: number;
    aiRemarks: string;
    verifiedAt: string;
  }>;
  allLogs: Array<{
    id: string;
    docType: string;
    status: string;
    confidenceScore: number;
    sha256Hash: string;
  }>;
}

export default function HumanReviewQueuePage() {
  const [queue, setQueue] = useState<EdgeCaseItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [officerName, setOfficerName] = useState<string>('Officer S. K. Sharma (GeM Audit Cell)');
  const [officerNotes, setOfficerNotes] = useState<Record<string, string>>({});
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [activeSpecimen, setActiveSpecimen] = useState<SpecimenData | null>(null);

  useEffect(() => {
    fetchReviewQueue();
  }, []);

  async function fetchReviewQueue() {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      if (data.success && data.queue) {
        setQueue(data.queue);
      }
    } catch (err) {
      console.error('Error fetching review queue:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // Pre-load Demo Case C if queue is empty
  const loadDemoCaseC = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/demo/load-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseType: 'CASE_C' }),
      });
      if (res.ok) {
        await fetchReviewQueue();
        setSuccessBanner('Case C: Shakti Heavy Logistics & Civil pre-loaded into the Human Review Queue.');
        setTimeout(() => setSuccessBanner(null), 4000);
      }
    } catch (err) {
      console.error('Error pre-loading Case C:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOfficerAction = async (
    vendorId: string,
    auditLogId: string,
    action: 'OVERRIDE_APPROVE' | 'CONFIRM_REJECT' | 'REQUEST_VIDEO_KYC'
  ) => {
    const key = `${vendorId}-${auditLogId}`;
    setProcessingAction(key);

    try {
      const res = await fetch('/api/admin/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId,
          auditLogId,
          action,
          officerName,
          officerRemarks:
            officerNotes[auditLogId] ||
            (action === 'OVERRIDE_APPROVE'
              ? 'Physical document seal inspected. Validity confirmed legitimate.'
              : 'Confirmed non-compliant certificate.'),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process officer action');
      }

      setSuccessBanner(
        action === 'OVERRIDE_APPROVE'
          ? `Document Override APPROVED. Vendor cleared.`
          : action === 'CONFIRM_REJECT'
          ? `Rejection CONFIRMED. Application flagged non-compliant.`
          : `Video KYC Scheduled. Notification dispatched to vendor.`
      );

      setTimeout(() => setSuccessBanner(null), 4000);
      await fetchReviewQueue();
    } catch (err: any) {
      alert(`Action error: ${err.message}`);
    } finally {
      setProcessingAction(null);
    }
  };

  const copyToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const openSpecimenInspection = (item: EdgeCaseItem, log: EdgeCaseItem['edgeCaseLogs'][0]) => {
    const isMachinery = log.docType.includes('MACHINERY') || log.docType.includes('SAFETY');
    const imageUrl = isMachinery
      ? generateCaseCSpecimenDataUrl()
      : generateGenericSpecimenDataUrl(log.docType, item.companyName);

    setActiveSpecimen({
      title: `Ambiguous Filing Specimen: ${log.docType}`,
      category: item.category,
      verdict: 'EDGE_CASE',
      imageUrl,
      sha256Hash: log.sha256Hash,
      entityName: item.companyName,
      expiryDate: log.expiryDate || 'Ambiguous (2026/2028 Smudged)',
      confidenceScore: log.confidenceScore,
      explanation: log.aiRemarks,
      highlightNotes: [
        'Volatile in-memory specimen: 4-degree smartphone camera tilt with simulated coffee cup stain.',
        'Expiry date field obscured by radial brown coffee ring and ink bleed.',
        'Zero disk retention guarantee: Rendered strictly in client browser memory.',
        'Officer determination required to override or schedule Live Video KYC.',
      ],
    });
  };

  const filteredQueue = queue.filter(
    (item) =>
      item.companyName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.phoneNumber.includes(searchFilter) ||
      item.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Human-In-The-Loop Escalation Cell</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Statutory Compliance Review Queue
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                When dirty scans, ink smudges, or ambiguous corporate suffixes cause AI confidence to drop
                below statutory thresholds, filings are routed here for manual officer determination.
              </p>
            </div>

            {/* Officer Identification Badge */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex items-center space-x-3 text-xs">
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Auditor Sign-Off Identity
                </span>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none focus:border-b border-blue-500 w-full text-xs"
                />
              </div>
            </div>
          </div>

          {/* Success Banner */}
          <AnimatePresence>
            {successBanner && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successBanner}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filter Bar & Quick Demo Case C Loader */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search by company name, category, or phone..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchReviewQueue}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Queue</span>
            </button>

            <button
              onClick={loadDemoCaseC}
              className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Pre-load Case C (Shakti Heavy)</span>
            </button>
          </div>
        </div>

        {/* Queue Content */}
        {isLoading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Loading escalated procurement filings...</p>
          </div>
        ) : filteredQueue.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Escalation Queue Clear</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No vendor filings currently require human compliance officer review. All submissions have
                either been auto-verified or confirmed rejected.
              </p>
            </div>
            <button
              onClick={loadDemoCaseC}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Simulate Case C (Coffee-Stained Machinery Cert)</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredQueue.map((item) => (
              <div
                key={item.vendorId}
                className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-6 relative overflow-hidden"
              >
                {/* Vendor Metadata Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-base font-bold text-white">{item.companyName}</h2>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                          {item.applicationStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Category: <strong className="text-slate-300">{item.category}</strong> &bull; Phone:{' '}
                        <span className="font-mono">{item.phoneNumber}</span> &bull; Submitted:{' '}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    className="inline-flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    <span>Inspect Vendor Checklist</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Ambiguous Edge Case Document Findings */}
                <div className="space-y-4">
                  {item.edgeCaseLogs.map((log) => {
                    const isProcessingThis = processingAction === `${item.vendorId}-${log.id}`;
                    const currentNote = officerNotes[log.id] || '';

                    return (
                      <div
                        key={log.id}
                        className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                              Flagged Document: {log.docType}
                            </span>
                            <span className="text-slate-600">&bull;</span>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                              Confidence: {Math.round(log.confidenceScore * 100)}%
                            </span>

                            <button
                              type="button"
                              onClick={() => openSpecimenInspection(item, log)}
                              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-semibold transition-all shadow-sm ml-1"
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-300" />
                              <span>Inspect Document Scan 👁️</span>
                            </button>
                          </div>

                          <div className="flex items-center space-x-2 text-xs">
                            <span className="text-slate-400">Cryptographic Digest:</span>
                            <code className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-blue-300 font-mono text-[11px]">
                              {log.sha256Hash.slice(0, 12)}...{log.sha256Hash.slice(-6)}
                            </code>
                            <button
                              onClick={() => copyToClipboard(log.sha256Hash)}
                              className="p-1 text-slate-400 hover:text-white"
                            >
                              {copiedHash === log.sha256Hash ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* AI Vision Explainability Trace */}
                        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs space-y-1.5">
                          <div className="flex items-center space-x-1.5 font-bold text-amber-300">
                            <Info className="w-4 h-4 text-amber-400" />
                            <span>AI Vision Ambiguity Explanation & Dirty Scan Trace:</span>
                          </div>
                          <p className="text-slate-300 leading-relaxed pl-5">{log.aiRemarks}</p>
                        </div>

                        {/* Officer Notes & Determination Inputs */}
                        <div className="space-y-2">
                          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Compliance Officer Audit Finding Remarks (Recorded in Ledger)
                          </label>
                          <textarea
                            rows={2}
                            value={currentNote}
                            onChange={(e) =>
                              setOfficerNotes((prev) => ({ ...prev, [log.id]: e.target.value }))
                            }
                            placeholder="e.g., Reviewed physical stamped duplicate; confirmed expiration is 2028. Legitimate CPWD equipment."
                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                          <button
                            type="button"
                            disabled={isProcessingThis}
                            onClick={() =>
                              handleOfficerAction(item.vendorId, log.id, 'REQUEST_VIDEO_KYC')
                            }
                            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                          >
                            <Video className="w-3.5 h-3.5 text-blue-400" />
                            <span>Request Live Video KYC</span>
                          </button>

                          <button
                            type="button"
                            disabled={isProcessingThis}
                            onClick={() =>
                              handleOfficerAction(item.vendorId, log.id, 'CONFIRM_REJECT')
                            }
                            className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            <span>Confirm Rejection ❌</span>
                          </button>

                          <button
                            type="button"
                            disabled={isProcessingThis}
                            onClick={() =>
                              handleOfficerAction(item.vendorId, log.id, 'OVERRIDE_APPROVE')
                            }
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/25 flex items-center space-x-1.5 transition-all disabled:opacity-50"
                          >
                            {isProcessingThis ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            <span>Override & Approve ✅</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Synthetic Test Document Generator Drawer */}
      <TestDocGenerator />

      {/* Forensic Document Specimen Inspection Modal */}
      <SpecimenViewerModal
        specimen={activeSpecimen}
        onClose={() => setActiveSpecimen(null)}
      />
    </div>
  );
}
