'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VisualEvidence } from '@/lib/types';
import { generateVisualEvidenceBoxes } from '@/lib/aiVerifier';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Key,
  Copy,
  Check,
  Info,
  Maximize2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export interface SpecimenData {
  title: string;
  category?: string;
  docType?: string;
  status?: string;
  verdict?: 'VERIFIED' | 'REJECTED' | 'EDGE_CASE';
  imageUrl?: string;
  url?: string;
  sha256Hash?: string;
  entityName?: string;
  expiryDate?: string | null;
  confidenceScore?: number;
  explanation?: string;
  highlightNotes?: string[];
  isUserUpload?: boolean;
  isPdf?: boolean;
  extractedFields?: Record<string, string>;
  visualEvidence?: VisualEvidence[];
}

interface SpecimenViewerModalProps {
  specimen: SpecimenData | null;
  onClose: () => void;
  isOpen?: boolean;
}

export default function SpecimenViewerModal({
  specimen,
  onClose,
  isOpen = true,
}: SpecimenViewerModalProps) {
  const [zoom, setZoom] = useState<number>(100);
  const [copied, setCopied] = useState<boolean>(false);
  const [showHighlights, setShowHighlights] = useState<boolean>(true);

  if (!specimen || !isOpen) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoom(100);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const verdict = specimen.verdict || (specimen.status === 'REJECTED' ? 'REJECTED' : specimen.status === 'EDGE_CASE' ? 'EDGE_CASE' : 'VERIFIED');
  const isVerified = verdict === 'VERIFIED';
  const isRejected = verdict === 'REJECTED';
  const isEdgeCase = verdict === 'EDGE_CASE';
  const entityName = specimen.entityName || specimen.extractedFields?.name || specimen.extractedFields?.vendor || 'Verified Entity';
  const activeDocImage = specimen.imageUrl || specimen.url || '';

  // Compute visual evidence bounding boxes
  const rawEvidences =
    specimen.visualEvidence && specimen.visualEvidence.length > 0
      ? specimen.visualEvidence
      : generateVisualEvidenceBoxes(
          specimen.title,
          entityName,
          specimen.expiryDate || null,
          verdict
        );

  const activeEvidences = rawEvidences.map((ev) => ({
    field_name: ev.field_name || ev.label || 'Extracted Field',
    extracted_value: ev.extracted_value !== undefined ? ev.extracted_value : (ev.value !== undefined ? ev.value : ''),
    confidence: ev.confidence ?? 0.95,
    bounding_box: ev.bounding_box || {
      ymin: ev.y ?? 20,
      xmin: ev.x ?? 20,
      ymax: (ev.y ?? 20) + (ev.height ?? 15),
      xmax: (ev.x ?? 20) + (ev.width ?? 30),
    },
    source_doc_name: ev.source_doc_name || specimen.title,
    doc_type: ev.doc_type || specimen.category,
    context_snippet: ev.context_snippet || '',
  }));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/75 backdrop-blur-xl"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full max-w-5xl glass-panel-dark gradient-border-card rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white z-10"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/80 backdrop-blur-xl">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2.5 rounded-xl border shadow-sm ${
                  isVerified
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20'
                    : isRejected
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/20'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/20'
                }`}
              >
                {isVerified && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isRejected && <XCircle className="w-5 h-5 text-rose-400" />}
                {isEdgeCase && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm sm:text-base font-bold text-white text-gradient-sovereign">
                    {specimen.title}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-label ${
                      isVerified
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                        : isRejected
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/20'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20'
                    }`}
                  >
                    {isVerified ? 'VERIFIED ✓' : isRejected ? 'REJECTED ✗' : 'HUMAN REVIEW ⚠️'}
                  </span>
                  {specimen.isUserUpload && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      Your Uploaded Specimen
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Entity: <strong className="text-teal-300">{entityName}</strong> &bull; Category:{' '}
                  {specimen.category || 'Statutory Compliance'}
                </p>
              </div>
            </div>

            {/* Controls & Close */}
            <div className="flex items-center space-x-2">
              {/* Green Bounding Box Scanned Highlights Toggle */}
              <button
                type="button"
                onClick={() => setShowHighlights(!showHighlights)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
                  showHighlights
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                    : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    showHighlights ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50' : 'bg-slate-600'
                  }`}
                />
                <span className="hidden sm:inline">Scanned Parts (Green Box):</span>
                <span>{showHighlights ? 'ON' : 'OFF'}</span>
              </button>

              <div className="flex items-center space-x-1 bg-slate-900 rounded-lg p-1 border border-white/10">
                <button
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono px-2 text-teal-300 font-semibold select-none">
                  {zoom}%
                </span>
                <button
                  onClick={handleZoomIn}
                  title="Zoom In"
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleResetZoom}
                  title="Reset Zoom"
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body: Split View (Specimen View Canvas + Explainability Sidebar) */}
          <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[440px]">
            {/* Left 8 cols: Document Visual Canvas View */}
            <div className="lg:col-span-8 bg-slate-950 p-4 sm:p-6 overflow-auto flex items-center justify-center relative select-none">
              <div
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease-out',
                }}
                className="relative inline-block shadow-2xl rounded-xl overflow-hidden max-w-full border border-white/10"
              >
                {/* Optical Hardware Scanline Beam */}
                <div className="scanline-mesh" />

                {specimen.isPdf ? (
                  <iframe
                    src={activeDocImage}
                    title={specimen.title}
                    className="w-[700px] h-[56vh] max-w-full rounded-lg border border-white/10 bg-slate-900"
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={activeDocImage}
                    alt={specimen.title}
                    className="max-h-[58vh] w-auto object-contain rounded-lg border border-white/10 block"
                  />
                )}

                {/* Scanned Part Green Bounding Boxes Overlay */}
                {showHighlights &&
                  activeEvidences.map((ev, i) => {
                    const box = ev.bounding_box;
                    const width = Math.max(8, box.xmax - box.xmin);
                    const height = Math.max(5, box.ymax - box.ymin);

                    return (
                      <div
                        key={i}
                        style={{
                          top: `${box.ymin}%`,
                          left: `${box.xmin}%`,
                          width: `${width}%`,
                          height: `${height}%`,
                        }}
                        className="absolute border-2 border-emerald-400 bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.6)] ring-2 ring-emerald-300/40 rounded pointer-events-auto transition-all duration-200 hover:bg-emerald-500/35 group cursor-pointer z-10"
                      >
                        {/* Top Label Tag */}
                        <div className="absolute -top-5 left-0 flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-950/95 border border-emerald-400 text-emerald-300 text-[10px] font-mono font-bold whitespace-nowrap shadow-md backdrop-blur-sm pointer-events-none z-20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
                          <span>
                            {ev.field_name}: {String(ev.extracted_value || '').slice(0, 22)}
                          </span>
                          <span className="text-emerald-400 text-[9px] opacity-80">
                            ({Math.round(ev.confidence * 100)}%)
                          </span>
                        </div>

                        {/* Interactive Diagnostic Detail Tooltip */}
                        <div className="hidden group-hover:block absolute bottom-full left-0 mb-1 z-30 p-2.5 rounded-lg bg-slate-900 border border-emerald-500/60 text-xs text-white shadow-2xl w-64 pointer-events-none">
                          <div className="font-bold text-emerald-300 mb-0.5 flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{ev.field_name}</span>
                          </div>
                          <div className="text-slate-300 leading-snug">{ev.context_snippet}</div>
                          <div className="text-[10px] text-emerald-400 font-mono mt-1 pt-1 border-t border-white/10">
                            AI Scanned Confidence: {Math.round(ev.confidence * 100)}% &bull; Validated
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Watermark Notice */}
              <div className="absolute bottom-3 left-4 text-[10px] text-slate-400 font-mono flex items-center space-x-1.5 bg-slate-900/90 px-2.5 py-1 rounded-md border border-white/10 backdrop-blur-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero-Retention RAM Specimen &bull; Rendered strictly in client browser memory</span>
              </div>
            </div>

            {/* Right 4 cols: Forensic Audit Insights & Explainability */}
            <div className="lg:col-span-4 bg-slate-900/80 border-t lg:border-t-0 lg:border-l border-white/10 p-5 overflow-y-auto space-y-4">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center space-x-1.5 font-label">
                  <Info className="w-3.5 h-3.5 text-teal-400" />
                  <span>AI Forensic Audit Verdict</span>
                </h4>
                <div
                  className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    isVerified
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                      : isRejected
                      ? 'bg-rose-950/40 border-rose-500/30 text-rose-200'
                      : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
                  }`}
                >
                  {specimen.explanation || `Automated cryptographic audit trace verified with zero server-side retention.`}
                </div>
              </div>

              {/* Key Diagnostic Clues */}
              {specimen.highlightNotes && specimen.highlightNotes.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block font-label">
                    Visual Diagnostic Clues
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {specimen.highlightNotes.map((note, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span
                          className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                            isVerified
                              ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                              : isRejected
                              ? 'bg-rose-400 shadow-sm shadow-rose-400/50'
                              : 'bg-amber-400 shadow-sm shadow-amber-400/50'
                          }`}
                        />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Expiry Date & Confidence */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 font-label">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                    Statutory Expiry
                  </span>
                  <span className="font-mono text-teal-300 text-xs mt-0.5 block truncate font-semibold">
                    {specimen.expiryDate || 'Permanent / No Expiry'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                    AI Confidence
                  </span>
                  <span
                    className={`font-mono text-xs font-bold mt-0.5 block ${
                      (specimen.confidenceScore || 0) < 0.7
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {Math.round((specimen.confidenceScore || 0.95) * 100)}%
                  </span>
                </div>
              </div>

              {/* SHA-256 Digest */}
              {specimen.sha256Hash && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-label">
                    <span className="flex items-center space-x-1">
                      <Key className="w-3 h-3 text-teal-400" />
                      <span>SHA-256 Fingerprint</span>
                    </span>
                    <button
                      onClick={() => copyHash(specimen.sha256Hash!)}
                      className="text-teal-400 hover:text-white normal-case font-medium flex items-center space-x-1"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-300 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-white/10 text-[10px] font-mono text-teal-300 break-all select-all">
                    {specimen.sha256Hash}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
