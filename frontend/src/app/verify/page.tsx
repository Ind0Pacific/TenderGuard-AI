'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { fetchTenders, uploadVendorDocuments } from '@/lib/api';
import { TenderRequirementConfig } from '@/lib/types';
import {
  UploadCloud,
  FileText,
  Lock,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Zap,
} from 'lucide-react';

export default function VerifyPage() {
  const router = useRouter();

  const [tenders, setTenders] = useState<TenderRequirementConfig[]>([]);
  const [vendorName, setVendorName] = useState<string>('');
  const [selectedTenderId, setSelectedTenderId] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [zeroRetention, setZeroRetention] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    fetchTenders()
      .then((data) => {
        setTenders(data);
        if (data.length > 0) setSelectedTenderId(data[0].tender_id);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const loadDemoScenario = (scenario: 'COMPLIANT' | 'EXPIRED_MAF' | 'PAN_MISMATCH' | 'REQUIRES_REVIEW') => {
    const demoMap = {
      COMPLIANT: {
        vendor: 'AlphaTech Solutions Pvt Ltd',
        filingId: 'FIL-2026-001',
      },
      EXPIRED_MAF: {
        vendor: 'Apex Buildcon & Supplies Ltd',
        filingId: 'FIL-2026-002',
      },
      PAN_MISMATCH: {
        vendor: 'Bharat Logistics & Infra Corp',
        filingId: 'FIL-2026-003',
      },
      REQUIRES_REVIEW: {
        vendor: 'Saraswati Heavy Industrial Diagnostics',
        filingId: 'FIL-2026-004',
      },
    };

    const target = demoMap[scenario];
    router.push(`/vendor/${target.filingId}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim()) {
      setErrorMessage('Please enter vendor business name.');
      return;
    }
    if (files.length === 0) {
      setErrorMessage('Please upload at least one procurement certificate or PDF document.');
      return;
    }

    setUploading(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('vendor_name', vendorName);
      formData.append('tender_id', selectedTenderId);
      formData.append('zero_retention_enabled', String(zeroRetention));

      files.forEach((file) => {
        formData.append('files', file);
      });

      const dossier = await uploadVendorDocuments(formData);
      router.push(`/vendor/${dossier.filing_id}`);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Error uploading and processing documents';
      setErrorMessage(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh-surface flex flex-col text-on-surface font-manrope relative overflow-hidden">
      {/* Ambient Aurora Light Spheres */}
      <div className="absolute top-10 right-0 w-[550px] h-[550px] bg-gradient-to-bl from-teal-500/15 via-emerald-400/10 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[500px] left-0 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/15 via-secondary/10 to-transparent blur-[130px] rounded-full pointer-events-none -z-10" />

      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        {/* Header */}
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/15 text-teal-300 text-xs font-semibold mb-2 border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Multi-Modal OCR &amp; Statutory Cross-Referencing</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gradient-sovereign tracking-tight">
            Verify Vendor Compliance Filing
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Upload vendor PDFs or scanned certificates (GST REG-06, Income Tax PAN, Udyam MSME, OEM MAF, Startup India). TenderGuard AI extracts structured entities, evaluates dynamic procurement checklists, and produces explainable visual evidence traces.
          </p>
        </div>

        {/* Quick Demo Pre-loaded Test Filings */}
        <div className="glass-panel-dark gradient-border-card rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm sm:text-base text-white">Instant Benchmark Demo Scenarios</h3>
            </div>
            <span className="text-xs text-teal-300 font-mono">1-Click Evaluation</span>
          </div>
          <p className="text-xs text-slate-300">
            Select any pre-configured synthetic procurement filing to inspect real-time explainability traces:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <button
              onClick={() => loadDemoScenario('COMPLIANT')}
              className="p-3.5 bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-emerald-500/40 rounded-xl text-left transition-all group shadow-sm"
            >
              <div className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
                1. Compliant Vendor
              </div>
              <div className="text-sm font-semibold text-white mt-0.5 truncate">AlphaTech Solutions</div>
              <div className="text-[11px] text-slate-400 mt-1">100% Match across all 5 docs</div>
            </button>

            <button
              onClick={() => loadDemoScenario('EXPIRED_MAF')}
              className="p-3.5 bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-rose-500/40 rounded-xl text-left transition-all group shadow-sm"
            >
              <div className="text-xs font-bold text-rose-400 group-hover:text-rose-300">
                2. Expired OEM MAF
              </div>
              <div className="text-sm font-semibold text-white mt-0.5 truncate">Apex Buildcon &amp; Supplies</div>
              <div className="text-[11px] text-slate-400 mt-1">Authorization lapsed date</div>
            </button>

            <button
              onClick={() => loadDemoScenario('PAN_MISMATCH')}
              className="p-3.5 bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-rose-500/40 rounded-xl text-left transition-all group shadow-sm"
            >
              <div className="text-xs font-bold text-rose-400 group-hover:text-rose-300">
                3. PAN-GSTIN Mismatch
              </div>
              <div className="text-sm font-semibold text-white mt-0.5 truncate">Bharat Logistics</div>
              <div className="text-[11px] text-slate-400 mt-1">Embedded PAN conflict</div>
            </button>

            <button
              onClick={() => loadDemoScenario('REQUIRES_REVIEW')}
              className="p-3.5 bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-amber-500/40 rounded-xl text-left transition-all group shadow-sm"
            >
              <div className="text-xs font-bold text-amber-400 group-hover:text-amber-300">
                4. Requires Review
              </div>
              <div className="text-sm font-semibold text-white mt-0.5 truncate">Saraswati Diagnostics</div>
              <div className="text-[11px] text-slate-400 mt-1">Name variation edge-case</div>
            </button>
          </div>
        </div>

        {/* Live Upload Form */}
        <form onSubmit={handleSubmit} className="glass-panel gradient-border-card rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 text-white">
          <h2 className="text-lg font-bold text-white border-b border-white/10 pb-3">
            Custom Document Verification Filing
          </h2>

          {errorMessage && (
            <div className="bg-rose-950/40 border border-rose-500/40 p-3.5 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider font-label mb-1.5">
                Vendor Business / Organization Name <span className="text-teal-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Apex Systems India Pvt Ltd"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider font-label mb-1.5">
                Target Procurement Tender
              </label>
              <select
                value={selectedTenderId}
                onChange={(e) => setSelectedTenderId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white font-medium focus:outline-none focus:border-teal-400 transition-all"
              >
                {tenders.map((t) => (
                  <option key={t.tender_id} value={t.tender_id} className="bg-slate-900 text-white">
                    {t.tender_ref_number}: {t.tender_title.substring(0, 48)}...
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider font-label mb-1.5">
              Statutory Procurement Documents (PDF, PNG, JPG) <span className="text-teal-400">*</span>
            </label>
            <div className="relative border-2 border-dashed border-teal-500/40 hover:border-teal-400 rounded-2xl p-8 text-center bg-slate-950/60 hover:bg-slate-950/90 transition-all cursor-pointer group">
              <input
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-10 h-10 text-teal-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-semibold text-white">
                Click to browse or drag and drop filing documents here
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Supports GST Form REG-06, PAN Card, Udyam Registration, OEM MAF Letter, Startup India DPIIT
              </p>
            </div>
          </div>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-label block">
                Selected Documents ({files.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className="w-4 h-4 text-teal-400 shrink-0" />
                      <span className="font-medium text-white truncate">{file.name}</span>
                      <span className="text-slate-500 font-mono">({Math.round(file.size / 1024)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-slate-400 hover:text-rose-400 p-1 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Zero-Retention Security Toggle */}
          <div className="glass-panel-dark border border-teal-500/30 rounded-2xl p-4 flex items-start space-x-3">
            <Lock className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">Zero-Retention Data Privacy Guarantee</span>
                <input
                  type="checkbox"
                  checked={zeroRetention}
                  onChange={(e) => setZeroRetention(e.target.checked)}
                  className="w-4 h-4 accent-teal-400 rounded cursor-pointer"
                />
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Adheres to Government zero-retention compliance standards. All raw documents are processed ephemerally in RAM, personal Aadhaar/bank numbers are automatically masked, and an immutable cryptographic SHA-256 audit digest is recorded.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              disabled={uploading}
              className="btn-gradient-primary inline-flex items-center space-x-2 px-6 py-3 text-white rounded-xl font-bold text-sm shadow-lg transition-all disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Running OCR &amp; Compliance Cross-Referencing...</span>
                </>
              ) : (
                <>
                  <span>Audit Filing &amp; Generate Explainability Trace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
