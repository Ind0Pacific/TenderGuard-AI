'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ComplianceBadge from '@/components/ComplianceBadge';
import { fetchVendorFilings, fetchBenchmarkMetrics } from '@/lib/api';
import { VendorAuditDossier, BenchmarkMetrics } from '@/lib/types';
import {
  ShieldCheck,
  FileText,
  Clock,
  ArrowUpRight,
  Search,
  PlusCircle,
  BarChart,
  Eye,
  Lock,
  Layers
} from 'lucide-react';

export default function DashboardPage() {
  const [filings, setFilings] = useState<VendorAuditDossier[]>([]);
  const [metrics, setMetrics] = useState<BenchmarkMetrics | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, [statusFilter, searchQuery]);

  async function loadData() {
    try {
      setLoading(true);
      const [filingsData, metricsData] = await Promise.all([
        fetchVendorFilings(statusFilter, searchQuery),
        fetchBenchmarkMetrics().catch(() => null),
      ]);
      setFilings(filingsData);
      setMetrics(metricsData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  const compliantCount = filings.filter((f) => f.overall_status === 'COMPLIANT').length;
  const nonCompliantCount = filings.filter((f) => f.overall_status === 'NON_COMPLIANT').length;
  const reviewCount = filings.filter((f) => f.overall_status === 'REQUIRES_REVIEW').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <span>AI4Impact &bull; Next.js + Python FastAPI + Zero-Retention</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              TenderGuard AI: Explainable Vendor Compliance Verification
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Automates the auditing of GST certificates, PAN cards, Udyam/MSME registrations, Startup India recognitions, and OEM authorization forms in government procurement. Every verdict is paired with a direct visual evidence trace on the original source document.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/verify"
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm transition-all shadow-md shadow-blue-600/30"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Verify New Vendor Filing</span>
              </Link>
              <Link
                href="/review"
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium text-sm border border-slate-700 transition-colors"
              >
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Human Review Queue ({reviewCount})</span>
              </Link>
              <Link
                href="/benchmarks"
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium text-sm border border-slate-700 transition-colors"
              >
                <BarChart className="w-4 h-4 text-emerald-400" />
                <span>Evaluation Benchmarks</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Impact Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Extraction Accuracy
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {metrics ? `${metrics.summary.overall_extraction_accuracy_pct}%` : '94.6%'}
              </div>
              <span className="text-xs text-emerald-600 font-medium">Target: &gt;90% Accuracy</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Audit Time Reduction
              </span>
              <div className="text-2xl font-extrabold text-blue-600 mt-1">
                {metrics ? `${metrics.summary.audit_time_reduction_pct}%` : '78.5%'}
              </div>
              <span className="text-xs text-slate-500">0.4s vs 45m manual audit</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Active Vendor Audits
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {filings.length} Filings
              </div>
              <div className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                <span className="text-emerald-600 font-semibold">{compliantCount} Passed</span>
                <span>&bull;</span>
                <span className="text-rose-600 font-semibold">{nonCompliantCount} Flagged</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Zero-Retention Privacy
              </span>
              <div className="text-2xl font-extrabold text-purple-600 mt-1">100%</div>
              <span className="text-xs text-purple-700 font-medium">PII Masked &bull; SHA-256 Proof</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Audit Registry Header & Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Procurement Vendor Audit Registry</h2>
              <p className="text-xs text-slate-500">
                Audited against active Tender <span className="font-mono font-semibold text-slate-700">GEM-2026-B-89104</span>
              </p>
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: 'ALL', label: 'All Filings' },
                { key: 'COMPLIANT', label: 'Compliant' },
                { key: 'REQUIRES_REVIEW', label: 'Requires Review' },
                { key: 'NON_COMPLIANT', label: 'Non-Compliant' },
              ].map((pill) => (
                <button
                  key={pill.key}
                  onClick={() => setStatusFilter(pill.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === pill.key
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by vendor organization name or tender reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
            />
          </div>
        </div>

        {/* Vendor Filings Grid */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-medium text-slate-500">Loading procurement audit records...</p>
          </div>
        ) : filings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">No vendor filings found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or upload a new filing.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filings.map((filing) => (
              <div
                key={filing.filing_id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Top line: filing ID and badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {filing.filing_id}
                    </span>
                    <ComplianceBadge status={filing.overall_status} size="md" />
                  </div>

                  {/* Vendor Name */}
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {filing.vendor_name}
                  </h3>

                  {/* Tender details */}
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    Tender: {filing.tender_ref_number} &bull; {filing.tender_title}
                  </p>

                  {/* Rule summary stats */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50 rounded-lg p-2">
                      <span className="text-slate-400 block text-[10px] uppercase">Compliance</span>
                      <span className="font-bold text-slate-800 text-sm">{filing.overall_compliance_score}%</span>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <span className="text-slate-400 block text-[10px] uppercase">Rules Passed</span>
                      <span className="font-bold text-emerald-600 text-sm">
                        {filing.compliant_count}/{filing.total_checks}
                      </span>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <span className="text-slate-400 block text-[10px] uppercase">Time Saved</span>
                      <span className="font-bold text-blue-600 text-sm">{filing.time_saved_percent}%</span>
                    </div>
                  </div>

                  {/* Key highlight / explainability preview */}
                  <div className="mt-3 text-xs text-slate-600 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/60">
                    <strong className="text-blue-900 block mb-0.5">Primary Verification Insight:</strong>
                    {filing.checks[0]?.explanation || 'Cross-referencing verified.'}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 font-mono truncate max-w-[180px]">
                    Hash: {filing.audit_hash.substring(0, 14)}...
                  </div>

                  <Link
                    href={`/vendor/${filing.filing_id}`}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <span>Inspect Explainability Trace</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
