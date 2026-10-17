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
    CRITICAL: 'bg-rose-100 text-rose-800 border-rose-200',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
    MEDIUM: 'bg-amber-100 text-amber-800 border-amber-200',
    LOW: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between">
      <div>
        {/* Top Header: Category, Severity, and Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
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
        <h4 className="text-base font-bold text-slate-900 mb-2">{check.rule_name}</h4>

        {/* Plain-English Explainability Justification */}
        <p className="text-sm text-slate-600 leading-relaxed mb-4">{check.explanation}</p>

        {/* Remediation Hint if Non-Compliant */}
        {check.remediation_hint && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-2.5 rounded-r-md text-xs text-rose-900 mb-4 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Remediation:</strong> {check.remediation_hint}
            </div>
          </div>
        )}

        {/* Human Reviewer Override Stamp if present */}
        {check.reviewer_override && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-950 mb-4 flex items-start space-x-2">
            <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-emerald-900">
                Officer Override by {check.reviewer_override.reviewer_name} ({check.reviewer_override.reviewer_role})
              </div>
              <div className="text-emerald-800 mt-1">&quot;{check.reviewer_override.comments}&quot;</div>
              <div className="text-emerald-700/70 text-[10px] mt-0.5">{check.reviewer_override.timestamp}</div>
            </div>
          </div>
        )}
      </div>

      {/* Visual Evidence Trace Triggers */}
      {check.evidences && check.evidences.length > 0 ? (
        <div className="mt-2 pt-3 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 block mb-2 uppercase tracking-wider">
            Visual Evidence Traces ({check.evidences.length})
          </span>
          <div className="flex flex-wrap gap-2">
            {check.evidences.map((ev, idx) => {
              const isSelected = selectedEvidence?.field_name === ev.field_name && selectedEvidence?.source_doc_name === ev.source_doc_name;
              return (
                <button
                  key={idx}
                  onClick={() => onSelectEvidence && onSelectEvidence(ev)}
                  className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border-slate-200'
                  }`}
                >
                  <Search className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate max-w-[130px]">{ev.field_name}</span>
                  <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-600'}`}>
                    {Math.round(ev.confidence * 100)}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-2 pt-3 border-t border-slate-100 text-xs text-slate-400 italic">
          No document visual evidence attached (Missing document failure).
        </div>
      )}
    </div>
  );
}
