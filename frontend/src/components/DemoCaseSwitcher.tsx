'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SpecimenViewerModal, { SpecimenData } from './SpecimenViewerModal';
import {
  generateCaseASpecimenDataUrl,
  generateCaseBSpecimenDataUrl,
  generateCaseCSpecimenDataUrl,
} from '@/lib/specimenGenerators';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  HardHat,
  Cpu,
  RefreshCw,
  ArrowRight,
  Eye,
  FileCheck2,
} from 'lucide-react';

interface DemoCaseSwitcherProps {
  onCaseLoaded?: () => void;
  currentCompanyName?: string | null;
}

export default function DemoCaseSwitcher({
  onCaseLoaded,
  currentCompanyName,
}: DemoCaseSwitcherProps) {
  const [loadingCase, setLoadingCase] = useState<string | null>(null);
  const [activeSpecimen, setActiveSpecimen] = useState<SpecimenData | null>(null);

  const loadCase = async (caseType: 'CASE_A' | 'CASE_B' | 'CASE_C') => {
    try {
      setLoadingCase(caseType);
      const res = await fetch('/api/demo/load-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseType }),
      });

      if (!res.ok) {
        throw new Error('Failed to load demo scenario');
      }

      if (onCaseLoaded) {
        onCaseLoaded();
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error('Error switching demo case:', err);
    } finally {
      setLoadingCase(null);
    }
  };

  const previewReferenceSpecimen = (caseType: 'CASE_A' | 'CASE_B' | 'CASE_C', e: React.MouseEvent) => {
    e.stopPropagation();

    if (caseType === 'CASE_A') {
      setActiveSpecimen({
        title: 'Case A: Clean Valid Contractor License (Reference Specimen)',
        category: 'Construction',
        verdict: 'VERIFIED',
        imageUrl: generateCaseASpecimenDataUrl(),
        entityName: 'Apex InfraBuilders Pvt Ltd',
        expiryDate: '2028-12-31',
        confidenceScore: 0.98,
        sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        explanation:
          'Model statutory filing specimen: Crisp font rendering, unexpired validity (31-Dec-2028), official gold seal, and CPCB Stage-IV environmental fitness certification.',
        highlightNotes: [
          'Unexpired future validity date (2028-12-31) prominently displayed in green box.',
          'Official Directorate of Industrial Safety circular gold seal verified.',
          'Statutory entity name "Apex InfraBuilders Pvt Ltd" matches PAN & GST records.',
        ],
      });
    } else if (caseType === 'CASE_B') {
      setActiveSpecimen({
        title: 'Case B: Expired Electronics BIS Certificate (Reference Specimen)',
        category: 'Electronics',
        verdict: 'REJECTED',
        imageUrl: generateCaseBSpecimenDataUrl(),
        entityName: 'VoltEdge Electronics Corp',
        expiryDate: '2024-03-15',
        confidenceScore: 0.94,
        sha256Hash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
        explanation:
          'Non-compliant filing specimen: The Bureau of Indian Standards (BIS CRS) registration expired on 2024-03-15 (over 8 months ago), and the manufacturing unit cites an unapproved foreign sub-assembly facility.',
        highlightNotes: [
          'Statutory expiration date (2024-03-15) is in the past (> 8 months lapsed).',
          'Bold red "REJECTED - LAPSED RENEWAL" cancellation stamp present.',
          'Discrepancy: Manufacturing unit name does not match applicant company.',
        ],
      });
    } else if (caseType === 'CASE_C') {
      setActiveSpecimen({
        title: 'Case C: Dirty & Coffee-Stained License (Reference Specimen)',
        category: 'Construction / Heavy',
        verdict: 'EDGE_CASE',
        imageUrl: generateCaseCSpecimenDataUrl(),
        entityName: 'Shakti Heavy Logistics & Civil',
        expiryDate: '2026-12-31',
        confidenceScore: 0.64,
        sha256Hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
        explanation:
          'Ambiguous scan specimen: Physical paper captured with a 3.8-degree camera tilt, coffee cup drip stains across the renewal box, and an ink smudge obscuring whether the validity year is 2026 or 2028. Triggered 64% confidence and escalation to Human Compliance Officer.',
        highlightNotes: [
          'Simulated 3.8° rotation tilt and shadow vignette around corners.',
          'Prominent translucent coffee ring directly over the statutory renewal date box.',
          'Dark ink smudge creates OCR ambiguity between "2026" and "2028".',
        ],
      });
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-blue-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-3.5">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <span>Interactive Evaluation Switcher & Reference Specimen Vault</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium normal-case">
                  One-Click Scenarios
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Click any case to load its live checklist, or click <strong>"Inspect Reference Specimen"</strong> to see why it passed, failed, or was flagged:
              </p>
            </div>
          </div>

          <Link
            href="/admin/review"
            className="self-start md:self-center inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold shadow-sm transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Open Human Escalation Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3 Case Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Case A: Apex InfraBuilders */}
          <div
            className={`p-3.5 rounded-xl border transition-all relative flex flex-col justify-between ${
              currentCompanyName?.includes('Apex')
                ? 'bg-emerald-950/30 border-emerald-500/60 ring-1 ring-emerald-500/30'
                : 'bg-slate-950/70 border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>CASE A: APPROVED ✅</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
                  <HardHat className="w-3 h-3 text-amber-400" />
                  <span>Civil/PWD</span>
                </span>
              </div>

              <h4 className="text-xs font-bold text-white truncate">Apex InfraBuilders Pvt Ltd</h4>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                All 6 documents valid with future 2028 expiry. Auto-approved for government tender.
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={(e) => previewReferenceSpecimen('CASE_A', e)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center space-x-1 transition-colors"
              >
                <Eye className="w-3 h-3 text-emerald-400" />
                <span>Inspect Specimen</span>
              </button>

              <button
                type="button"
                disabled={loadingCase !== null}
                onClick={() => loadCase('CASE_A')}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors"
              >
                {loadingCase === 'CASE_A' ? 'Loading...' : 'Load Case A'}
              </button>
            </div>
          </div>

          {/* Case B: VoltEdge Electronics */}
          <div
            className={`p-3.5 rounded-xl border transition-all relative flex flex-col justify-between ${
              currentCompanyName?.includes('VoltEdge')
                ? 'bg-rose-950/30 border-rose-500/60 ring-1 ring-rose-500/30'
                : 'bg-slate-950/70 border-slate-800 hover:border-rose-500/40 hover:bg-slate-900'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">
                  <XCircle className="w-3 h-3" />
                  <span>CASE B: REJECTED ❌</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
                  <Cpu className="w-3 h-3 text-cyan-400" />
                  <span>Hardware</span>
                </span>
              </div>

              <h4 className="text-xs font-bold text-white truncate">VoltEdge Electronics Corp</h4>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                Steps 1-3 pass. Step 4 fails: BIS Certificate expired 8 months ago & entity mismatch.
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={(e) => previewReferenceSpecimen('CASE_B', e)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center space-x-1 transition-colors"
              >
                <Eye className="w-3 h-3 text-rose-400" />
                <span>Inspect Specimen</span>
              </button>

              <button
                type="button"
                disabled={loadingCase !== null}
                onClick={() => loadCase('CASE_B')}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold transition-colors"
              >
                {loadingCase === 'CASE_B' ? 'Loading...' : 'Load Case B'}
              </button>
            </div>
          </div>

          {/* Case C: Shakti Heavy Logistics & Civil */}
          <div
            className={`p-3.5 rounded-xl border transition-all relative flex flex-col justify-between ${
              currentCompanyName?.includes('Shakti')
                ? 'bg-amber-950/30 border-amber-500/60 ring-1 ring-amber-500/30'
                : 'bg-slate-950/70 border-slate-800 hover:border-amber-500/40 hover:bg-slate-900'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                  <AlertTriangle className="w-3 h-3" />
                  <span>CASE C: HUMAN REVIEW ⚠️</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
                  <HardHat className="w-3 h-3 text-amber-400" />
                  <span>Civil/Heavy</span>
                </span>
              </div>

              <h4 className="text-xs font-bold text-white truncate">Shakti Heavy Logistics & Civil</h4>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                Step 5 Machinery scan is coffee-stained with 64% confidence & smudged renewal date.
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={(e) => previewReferenceSpecimen('CASE_C', e)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center space-x-1 transition-colors"
              >
                <Eye className="w-3 h-3 text-amber-400" />
                <span>Inspect Specimen</span>
              </button>

              <button
                type="button"
                disabled={loadingCase !== null}
                onClick={() => loadCase('CASE_C')}
                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-semibold transition-colors"
              >
                {loadingCase === 'CASE_C' ? 'Loading...' : 'Load Case C'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reference Specimen Viewer Modal */}
      <SpecimenViewerModal
        specimen={activeSpecimen}
        onClose={() => setActiveSpecimen(null)}
      />
    </>
  );
}
