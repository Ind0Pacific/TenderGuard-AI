'use client';

import React, { useState } from 'react';
import { VisualEvidence } from '@/lib/types';
import { ZoomIn, ZoomOut, RotateCcw, Eye, ShieldCheck, X } from 'lucide-react';

interface DocumentViewerProps {
  evidence: VisualEvidence | null;
  documentUrl?: string;
  onClose?: () => void;
}

export default function DocumentViewer({
  evidence,
  documentUrl,
  onClose,
}: DocumentViewerProps) {
  const [zoom, setZoom] = useState<number>(100);
  const [showHighlight, setShowHighlight] = useState<boolean>(true);

  if (!evidence && !documentUrl) return null;

  // Use the crop_image_url from the evidence if available, else provided documentUrl
  const activeDocUrl = evidence?.crop_image_url || documentUrl;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoom(100);

  return (
    <div className="glass-panel-dark gradient-border-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col h-full text-white">
      {/* Top Controls Toolbar */}
      <div className="bg-slate-950/90 text-white px-4 py-3 flex items-center justify-between border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse shadow-sm shadow-teal-400/50"></div>
          <div>
            <h4 className="text-sm font-semibold tracking-tight text-white flex items-center space-x-2">
              <span>Visual Evidence Trace</span>
              {evidence && (
                <span className="text-[11px] font-mono bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded border border-teal-500/30">
                  Page {evidence.page_number}
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-400 truncate max-w-sm">
              Source: {evidence?.source_doc_name || 'Statutory Filing Document'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Zoom Controls */}
          <div className="bg-slate-900 rounded-xl p-1 flex items-center space-x-1 border border-white/10">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-teal-300 font-semibold px-1 select-none">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Toggle Highlight */}
          <button
            onClick={() => setShowHighlight(!showHighlight)}
            className={`px-3 py-1.5 text-xs rounded-xl font-medium border flex items-center space-x-1.5 transition-all ${
              showHighlight
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                showHighlight ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
              }`}
            />
            <span>{showHighlight ? 'Boxes On' : 'Boxes Off'}</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Evidence Trace Metadata Banner */}
      {evidence && (
        <div className="bg-slate-900/90 border-b border-white/10 px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-white gap-2 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-slate-400">Target Field:</strong> <span className="text-teal-300 font-semibold">{evidence.field_name}</span> ={' '}
              <span className="font-mono bg-teal-500/20 border border-teal-500/30 px-2 py-0.5 rounded text-teal-200 font-semibold">
                {String(evidence.extracted_value)}
              </span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-slate-300">
              Confidence: <strong className="text-emerald-400 font-mono">{Math.round(evidence.confidence * 100)}%</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 font-mono text-[11px]">
              BBox: [{evidence.bounding_box ? `${evidence.bounding_box.ymin.toFixed(1)}, ${evidence.bounding_box.xmin.toFixed(1)}, ${evidence.bounding_box.ymax.toFixed(1)}, ${evidence.bounding_box.xmax.toFixed(1)}` : 'N/A'}]
            </span>
          </div>
        </div>
      )}

      {/* Document View Canvas */}
      <div className="relative flex-1 bg-slate-950 overflow-auto p-4 flex items-center justify-center min-h-[460px]">
        {/* Hardware optical scanline beam */}
        <div className="scanline-mesh pointer-events-none" />

        {activeDocUrl ? (
          <div
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
            className="transition-transform duration-150 ease-out max-w-full relative shadow-2xl rounded-xl overflow-hidden border border-white/10"
          >
            <img
              src={activeDocUrl}
              alt={evidence?.source_doc_name || 'Document Verification Preview'}
              className="max-w-[750px] w-full rounded-lg bg-slate-900 block"
            />

            {/* Neon Green Bounding Box Overlay if coordinates exist */}
            {showHighlight && evidence?.bounding_box && (
              <div
                style={{
                  top: `${evidence.bounding_box.ymin}%`,
                  left: `${evidence.bounding_box.xmin}%`,
                  width: `${Math.max(8, evidence.bounding_box.xmax - evidence.bounding_box.xmin)}%`,
                  height: `${Math.max(5, evidence.bounding_box.ymax - evidence.bounding_box.ymin)}%`,
                }}
                className="absolute border-2 border-emerald-400 bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.6)] ring-2 ring-emerald-300/40 rounded pointer-events-none z-20"
              >
                <div className="absolute -top-5 left-0 px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-400 text-emerald-300 text-[10px] font-mono font-bold whitespace-nowrap shadow-md">
                  {evidence.field_name}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-slate-500 py-12">
            <Eye className="w-12 h-12 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-medium">No document preview available for this entry.</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-slate-950 px-4 py-2 border-t border-white/10 text-slate-400 text-[11px] flex items-center justify-between">
        <span className="flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Zero-Retention Verification: Bounding boxes generated ephemerally from source OCR.</span>
        </span>
        <span className="font-mono text-teal-400/80">TenderGuard Explainability Protocol v1.0</span>
      </div>
    </div>
  );
}
