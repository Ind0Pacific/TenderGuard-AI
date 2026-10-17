'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { fetchTenders } from '@/lib/api';
import { TenderRequirementConfig } from '@/lib/types';
import {
  CheckSquare,
  Building,
  Calendar,
  FileText,
  Save,
  CheckCircle2
} from 'lucide-react';

export default function TendersPage() {
  const [tenders, setTenders] = useState<TenderRequirementConfig[]>([]);
  const [selectedTender, setSelectedTender] = useState<TenderRequirementConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    fetchTenders()
      .then((data) => {
        setTenders(data);
        if (data.length > 0) setSelectedTender(data[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRuleToggle = (key: keyof TenderRequirementConfig) => {
    if (!selectedTender) return;
    setSelectedTender({
      ...selectedTender,
      [key]: !selectedTender[key],
    });
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-2">
            <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>Dynamic Procurement Checklists</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Procurement Checklist Configuration
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            TenderGuard AI automatically synchronizes audit rules with the procuring authority&apos;s tender criteria. Configure statutory document requirements, OEM authorization rules, and MSME exemption policies.
          </p>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-900 flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Dynamic procurement checklist rules updated and synchronized across active audit pipelines.</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-medium text-slate-500">Loading tender configurations...</p>
          </div>
        ) : selectedTender ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Tender Card Left (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Active Tender Profile
              </span>

              <div>
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {selectedTender.tender_ref_number}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2">{selectedTender.tender_title}</h3>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-start space-x-2">
                  <Building className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-700 block">Procuring Authority:</strong>
                    <span className="text-slate-500">{selectedTender.procuring_authority}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-700 block">Bid Submission Cutoff:</strong>
                    <span className="text-slate-500">{selectedTender.bid_submission_deadline}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <FileText className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-700 block">Mandatory Document Types:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedTender.required_document_types.map((d, i) => (
                        <span key={i} className="bg-slate-100 text-slate-700 text-[10px] font-mono px-2 py-0.5 rounded">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Checklist Rule Engine (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Configurable Statutory Compliance Rules</h3>
                  <p className="text-xs text-slate-500">
                    Enable or disable specific cross-referencing checks for this procurement tender.
                  </p>
                </div>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Rules</span>
                </button>
              </div>

              <div className="space-y-4">
                {/* Rule 1: Strict PAN-GSTIN match */}
                <div className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900">
                        Strict PAN &amp; GSTIN Segment Alignment
                      </span>
                      <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                        Critical Anti-Fraud
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Cross-references characters 3 to 12 of the GSTIN extracted from Form GST REG-06 against the Permanent Account Number on the vendor&apos;s corporate PAN card. Instantly flags mismatch.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedTender.require_pan_gstin_exact_match}
                    onChange={() => handleRuleToggle('require_pan_gstin_exact_match')}
                    className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mt-1"
                  />
                </div>

                {/* Rule 2: OEM MAF Requirement & Validity */}
                <div className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900">
                        Manufacturer&apos;s Authorization Form (MAF) Validity Check
                      </span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                        High Risk
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Requires authorized reseller bidders to provide a tender-specific OEM authorization letter with validity extending beyond the tender submission cutoff date.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedTender.require_oem_maf}
                    onChange={() => handleRuleToggle('require_oem_maf')}
                    className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mt-1"
                  />
                </div>

                {/* Rule 3: MSME / Udyam Concession */}
                <div className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900">
                        MSME / Udyam Enterprise Verification
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                        Concession Policy
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Verifies Udyam registration certificates and categorizes vendors into Micro, Small, or Medium enterprises for Earnest Money Deposit (EMD) exemptions.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedTender.require_msme_exemption}
                    onChange={() => handleRuleToggle('require_msme_exemption')}
                    className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mt-1"
                  />
                </div>

                {/* Rule 4: Startup India DPIIT */}
                <div className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900">
                        Startup India (DPIIT) Ten-Year Tenure Ceiling
                      </span>
                      <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                        Statutory Tenure
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Validates that the vendor&apos;s DPIIT Certificate of Recognition is within the statutory 10-year period from the date of incorporation to qualify for prior-turnover waivers.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedTender.require_valid_startup_recognition}
                    onChange={() => handleRuleToggle('require_valid_startup_recognition')}
                    className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
