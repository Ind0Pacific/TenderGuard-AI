'use client';

import React from 'react';
import { ComplianceCheckItem, VisualEvidence } from '@/lib/types';
import ComplianceBadge from './ComplianceBadge';
import { AlertCircle, Search, UserCheck } from 'lucide-react';

interface EvidenceCardProps {
  check: ComplianceCheckItem;
  onSelectEvidence?: (evidence: VisualEvidence) => void;
  selectedEvidence?: VisualEvidence | null;
}

export default function EvidenceCard({
  check,
  onSelectEvidence,
  selectedEvidence,
}: EvidenceCardProps) {
  const severityColors = {
    CRITICAL: 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/20',
    HIGH: 'bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-sm shadow-orange-500/20',
    MEDIUM: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20',
    LOW: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/20',
  };

  return (
    <div className="glass-panel-dark gradient-border-card rounded-2xl p-5 shadow-xl hover:border-teal-500/40 transition-all flex flex-col justify-between text-white">
      <div>
        {/* Top Header: Category, Severity, and Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-label">
              {check.category}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${severityColors[check.severity]}`}
            >
              {check.severity}
            </span>
          </div>
          <ComplianceBadge status={check.status} size="sm" />
        </div>

        {/* Rule Title */}
        <h4 className="text-base font-bold text-white mb-2 leading-snug">{check.rule_name}</h4>

        {/* Plain-English Explainability Justification */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">{check.explanation}</p>

        {/* Remediation Hint if Non-Compliant */}
        {check.remediation_hint && (
          <div className="bg-rose-950/40 border-l-4 border-rose-500 p-3 rounded-r-xl text-xs text-rose-200 mb-4 flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-rose-300">Remediation:</strong> {check.remediation_hint}
            </div>
          </div>
        )}

        {/* Human Reviewer Override Stamp if present */}
        {check.reviewer_override && (
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 text-xs text-emerald-200 mb-4 flex items-start space-x-2.5 shadow-sm">
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-emerald-300">
                Officer Override by {check.reviewer_override.reviewer_name} ({check.reviewer_override.reviewer_role})
              </div>
              <div className="text-emerald-200/90 mt-1">&quot;{check.reviewer_override.comments}&quot;</div>
              <div className="text-emerald-400/70 text-[10px] mt-0.5">{check.reviewer_override.timestamp}</div>
            </div>
          </div>
        )}
      </div>

      {/* Visual Evidence Trace Triggers */}
      {check.evidences && check.evidences.length > 0 ? (
        <div className="mt-2 pt-3 border-t border-white/10">
          <span className="text-[11px] font-semibold text-slate-400 block mb-2 uppercase tracking-wider font-label">
            Visual Evidence Traces ({check.evidences.length})
          </span>
          <div className="flex flex-wrap gap-2">
            {check.evidences.map((ev, idx) => {
              const isSelected = selectedEvidence?.field_name === ev.field_name && selectedEvidence?.source_doc_name === ev.source_doc_name;
              return (
                <button
                  key={idx}
                  onClick={() => onSelectEvidence && onSelectEvidence(ev)}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-teal-500/25 text-teal-200 border-teal-400 shadow-sm shadow-teal-500/20'
                      : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border-white/10 hover:border-teal-500/30'
                  }`}
                >
                  <Search className="w-3 h-3 shrink-0 text-teal-400" />
                  <span className="truncate max-w-[130px] font-semibold">{ev.field_name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-teal-500/30 text-teal-200' : 'bg-slate-800 text-slate-400'}`}>
                    {Math.round(ev.confidence * 100)}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-2 pt-3 border-t border-white/10 text-xs text-slate-500 italic">
          No document visual evidence attached (Missing document failure).
        </div>
      )}
    </div>
  );
}
