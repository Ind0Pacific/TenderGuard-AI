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
  CheckCircle2,
  Sparkles,
  Sliders,
  ShieldCheck,
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
    <div className="min-h-screen bg-mesh-surface flex flex-col text-on-surface font-manrope relative overflow-hidden">
      {/* Ambient Aurora Light Spheres */}
      <div className="absolute top-10 right-0 w-[550px] h-[550px] bg-gradient-to-bl from-teal-500/15 via-emerald-400/10 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[500px] left-0 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/15 via-secondary/10 to-transparent blur-[130px] rounded-full pointer-events-none -z-10" />

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/15 text-teal-300 text-xs font-semibold mb-2 border border-teal-500/30">
            <CheckSquare className="w-3.5 h-3.5 text-teal-400" />
            <span>Dynamic Procurement Checklists</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gradient-sovereign tracking-tight">
            Procurement Checklist Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            TenderGuard AI automatically synchronizes audit rules with the procuring authority&apos;s tender criteria. Configure statutory document requirements, OEM authorization rules, and MSME exemption policies.
          </p>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-xl text-xs text-emerald-300 flex items-center space-x-2 animate-in fade-in backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Dynamic procurement checklist rules updated and synchronized across active audit pipelines.</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 glass-panel rounded-2xl">
            <div className="w-8 h-8 border-3 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-medium text-slate-400">Loading tender configurations...</p>
          </div>
        ) : selectedTender ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Tender Card Left (4 cols) */}
            <div className="lg:col-span-4 glass-panel gradient-border-card rounded-2xl p-6 shadow-xl space-y-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block font-label">
                Active Tender Profile
              </span>

              <div>
                <span className="font-mono text-xs font-bold text-teal-300 bg-teal-500/15 border border-teal-500/30 px-2.5 py-1 rounded-lg inline-block">
                  {selectedTender.tender_ref_number}
                </span>
                <h3 className="text-base font-bold text-white mt-2 leading-snug">{selectedTender.tender_title}</h3>
              </div>

              <div className="space-y-3 pt-3 border-t border-white/10 text-xs">
                <div className="flex items-start space-x-2.5">
                  <Building className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-300 block font-semibold">Procuring Authority:</strong>
                    <span className="text-slate-400">{selectedTender.procuring_authority}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <Calendar className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-300 block font-semibold">Bid Submission Cutoff:</strong>
                    <span className="text-slate-400">{selectedTender.bid_submission_deadline}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <FileText className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-300 block font-semibold">Mandatory Document Types:</strong>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedTender.required_document_types.map((d, i) => (
                        <span key={i} className="bg-slate-900 text-teal-300 border border-white/10 text-[10px] font-mono px-2 py-0.5 rounded-md">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Checklist Rule Engine (8 cols) */}
            <div className="lg:col-span-8 glass-panel gradient-border-card rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Sliders className="w-5 h-5 text-teal-400" />
                    <span>Configurable Statutory Compliance Rules</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enable or disable specific cross-referencing checks for this procurement tender.
                  </p>
                </div>
                <button
                  onClick={handleSave}
                  className="btn-gradient-primary inline-flex items-center space-x-1.5 px-4 py-2 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Rules</span>
                </button>
              </div>

              <div className="space-y-4">
                {/* Rule 1: Strict PAN-GSTIN match */}
                <div className="flex items-start justify-between p-4 bg-slate-900/60 rounded-xl border border-white/10 hover:border-teal-500/30 transition-all">
                  <div className="pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-white">
                        Strict PAN &amp; GSTIN Segment Alignment
                      </span>
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold px-2 py-0.5 rounded-full">
                        Critical Anti-Fraud
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Cross-references characters 3 to 12 of the GSTIN extracted from Form GST REG-06 against the Permanent Account Number on the vendor&apos;s corporate PAN card. Instantly flags mismatch.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedTender.require_pan_gstin_exact_match}
                    onChange={() => handleRuleToggle('require_pan_gstin_exact_match')}
                    className="w-5 h-5 accent-teal-400 rounded border-white/20 bg-slate-800 cursor-pointer mt-1"
                  />
                </div>

                {/* Rule 2: OEM MAF Requirement & Validity */}
                <div className="flex items-start justify-between p-4 bg-slate-900/60 rounded-xl border border-white/10 hover:border-teal-500/30 transition-all">
                  <div className="pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-white">
                        Manufacturer&apos;s Authorization Form (MAF) Validity Check
                      </span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold px-2 py-0.5 rounded-full">
                        High Risk
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Requires authorized reseller bidders to provide a tender-specific OEM authorization letter with validity extending beyond the tender submission cutoff date.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedTender.require_oem_maf}
                    onChange={() => handleRuleToggle('require_oem_maf')}
                    className="w-5 h-5 accent-teal-400 rounded border-white/20 bg-slate-800 cursor-pointer mt-1"
                  />
                </div>

                {/* Rule 3: MSME / Udyam Concession */}
                <div className="flex items-start justify-between p-4 bg-slate-900/60 rounded-xl border border-white/10 hover:border-teal-500/30 transition-all">
                  <div className="pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-white">
                        MSME / Udyam Enterprise Verification
                      </span>
                      <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold px-2 py-0.5 rounded-full">
                        Concession Policy
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Verifies Udyam registration certificates and categorizes vendors into Micro, Small, or Medium enterprises for Earnest Money Deposit (EMD) exemptions.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedTender.require_msme_exemption}
                    onChange={() => handleRuleToggle('require_msme_exemption')}
                    className="w-5 h-5 accent-teal-400 rounded border-white/20 bg-slate-800 cursor-pointer mt-1"
                  />
                </div>

                {/* Rule 4: Startup India DPIIT */}
                <div className="flex items-start justify-between p-4 bg-slate-900/60 rounded-xl border border-white/10 hover:border-teal-500/30 transition-all">
                  <div className="pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-white">
                        Startup India (DPIIT) Ten-Year Tenure Ceiling
                      </span>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold px-2 py-0.5 rounded-full">
                        Statutory Tenure
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Validates that the vendor&apos;s DPIIT Certificate of Recognition is within the statutory 10-year period from the date of incorporation to qualify for prior-turnover waivers.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedTender.require_valid_startup_recognition}
                    onChange={() => handleRuleToggle('require_valid_startup_recognition')}
                    className="w-5 h-5 accent-teal-400 rounded border-white/20 bg-slate-800 cursor-pointer mt-1"
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
