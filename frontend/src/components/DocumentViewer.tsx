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
    <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-full">
      {/* Top Controls Toolbar */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping"></div>
          <div>
            <h4 className="text-sm font-semibold tracking-tight text-white flex items-center space-x-2">
              <span>Visual Evidence Trace</span>
              {evidence && (
                <span className="text-[11px] font-mono bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded border border-blue-400/30">
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
          <div className="bg-slate-800 rounded-lg p-1 flex items-center space-x-1 border border-slate-700">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-300 px-1">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Toggle Highlight */}
          <button
            onClick={() => setShowHighlight(!showHighlight)}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium border flex items-center space-x-1.5 transition-colors ${
              showHighlight
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showHighlight ? 'Boxes On' : 'Boxes Off'}</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Evidence Trace Metadata Banner */}
      {evidence && (
        <div className="bg-blue-50/70 border-b border-blue-100 px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-blue-900 gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>
              <strong>Target Field:</strong> {evidence.field_name} ={' '}
              <span className="font-mono bg-blue-100/70 px-1.5 py-0.5 rounded text-blue-950 font-semibold">
                {String(evidence.extracted_value)}
              </span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-slate-600">
              Confidence: <strong>{Math.round(evidence.confidence * 100)}%</strong>
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-500 font-mono text-[11px]">
              BBox: [{evidence.bounding_box.ymin.toFixed(2)}, {evidence.bounding_box.xmin.toFixed(2)}, {evidence.bounding_box.ymax.toFixed(2)}, {evidence.bounding_box.xmax.toFixed(2)}]
            </span>
          </div>
        </div>
      )}

      {/* Document View Canvas */}
      <div className="relative flex-1 bg-slate-100 overflow-auto p-4 flex items-center justify-center min-h-[460px]">
        {activeDocUrl ? (
          <div
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            className="transition-transform duration-150 ease-out max-w-full"
          >
            <img
              src={activeDocUrl}
              alt={evidence?.source_doc_name || 'Document Verification Preview'}
              className="max-w-[750px] w-full rounded-md shadow-lg border border-slate-300 bg-white"
            />
          </div>
        ) : (
          <div className="text-center text-slate-400 py-12">
            <Eye className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium">No document preview available for this entry.</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 text-slate-500 text-[11px] flex items-center justify-between">
        <span>Zero-Retention Verification: Bounding boxes generated ephemerally from source OCR.</span>
        <span className="font-mono text-slate-400">TenderGuard Explainability Protocol v1.0</span>
      </div>
    </div>
  );
}
