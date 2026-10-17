'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { uploadVendorDocuments, fetchTenders } from '@/lib/api';
import { TenderRequirementConfig } from '@/lib/types';
import {
  UploadCloud,
  Lock,
  ArrowRight,
  FileText,
  AlertCircle,
  Sparkles,
  Zap
} from 'lucide-react';

export default function VerifyPage() {
  const router = useRouter();
  const [tenders, setTenders] = useState<TenderRequirementConfig[]>([]);
  const [selectedTenderId, setSelectedTenderId] = useState<string>('TNDR-GEM-89104');
  const [vendorName, setVendorName] = useState<string>('');
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
      .catch(() => {});
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...fileList]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Quick Synthetic Demo Filings
  const loadDemoScenario = (scenario: 'COMPLIANT' | 'EXPIRED_MAF' | 'PAN_MISMATCH' | 'REQUIRES_REVIEW') => {
    if (scenario === 'COMPLIANT') {
      router.push('/vendor/FILING-ALPHATECH-001');
    } else if (scenario === 'EXPIRED_MAF') {
      router.push('/vendor/FILING-APEX-002');
    } else if (scenario === 'PAN_MISMATCH') {
      router.push('/vendor/FILING-BHARAT-003');
    } else {
      router.push('/vendor/FILING-SARASWATI-004');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim()) {
      setErrorMessage('Please provide the Vendor Organization Name.');
      return;
    }
    if (files.length === 0) {
      setErrorMessage('Please select at least one statutory document (PDF or image).');
      return;
    }

    try {
      setUploading(true);
      setErrorMessage('');

      const formData = new FormData();
      formData.append('vendor_name', vendorName);
      formData.append('tender_id', selectedTenderId);
      formData.append('zero_retention', String(zeroRetention));

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Multi-Modal OCR & Statutory Cross-Referencing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Verify Vendor Compliance Filing
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Upload vendor PDFs or scanned certificates (GST REG-06, Income Tax PAN, Udyam MSME, OEM MAF, Startup India). TenderGuard AI extracts structured entities, evaluates dynamic procurement checklists, and produces explainable visual evidence traces.
          </p>
        </div>

        {/* Quick Demo Pre-loaded Test Filings */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm sm:text-base">Instant Benchmark Demo Scenarios</h3>
            </div>
            <span className="text-xs text-blue-200">1-Click Evaluation</span>
          </div>
          <p className="text-xs text-blue-100">
            Select any pre-configured synthetic procurement filing to inspect real-time explainability traces:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
            <button
              onClick={() => loadDemoScenario('COMPLIANT')}
              className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-left transition-all group"
            >
              <div className="text-xs font-bold text-emerald-300 group-hover:text-emerald-200">
                1. Compliant Vendor
              </div>
              <div className="text-sm font-semibold text-white mt-0.5 truncate">AlphaTech Solutions</div>
              <div className="text-[11px] text-slate-300 mt-1">100% Match across all 5 docs</div>
            </button>

            <button
              onClick={() => loadDemoScenario('EXPIRED_MAF')}
              className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-left transition-all group"
            >
              <div className="text-xs font-bold text-rose-300 group-hover:text-rose-200">
                2. Expired OEM MAF
              </div>
              <div className="text-sm font-semibold text-white mt-0.5 truncate">Apex Buildcon & Supplies</div>
              <div className="text-[11px] text-slate-300 mt-1">Authorization lapsed date</div>
            </button>

            <button
              onClick={() => loadDemoScenario('PAN_MISMATCH')}
              className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-left transition-all group"
            >
              <div className="text-xs font-bold text-rose-300 group-hover:text-rose-200">
                3. PAN-GSTIN Mismatch
              </div>
              <div className="text-sm font-semibold text-white mt-0.5 truncate">Bharat Logistics</div>
              <div className="text-[11px] text-slate-300 mt-1">Embedded PAN conflict</div>
            </button>

            <button
              onClick={() => loadDemoScenario('REQUIRES_REVIEW')}
              className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-left transition-all group"
            >
              <div className="text-xs font-bold text-amber-300 group-hover:text-amber-200">
                4. Requires Review
              </div>
              <div className="text-sm font-semibold text-white mt-0.5 truncate">Saraswati Diagnostics</div>
              <div className="text-[11px] text-slate-300 mt-1">Name variation edge-case</div>
            </button>
          </div>
        </div>

        {/* Live Upload Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Custom Document Verification Filing
          </h2>

          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-lg text-xs text-rose-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Vendor Business / Organization Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Apex Systems India Pvt Ltd"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Target Procurement Tender
              </label>
              <select
                value={selectedTenderId}
                onChange={(e) => setSelectedTenderId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
              >
                {tenders.map((t) => (
                  <option key={t.tender_id} value={t.tender_id}>
                    {t.tender_ref_number}: {t.tender_title.substring(0, 48)}...
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
              Statutory Procurement Documents (PDF, PNG, JPG) <span className="text-rose-500">*</span>
            </label>
            <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 text-center bg-slate-50 hover:bg-blue-50/30 transition-all cursor-pointer">
              <input
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-10 h-10 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-800">
                Click to browse or drag and drop filing documents here
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Supports GST Form REG-06, PAN Card, Udyam Registration, OEM MAF Letter, Startup India DPIIT
              </p>
            </div>
          </div>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-slate-600 uppercase block">
                Selected Documents ({files.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-slate-100 rounded-lg border border-slate-200 text-xs"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{file.name}</span>
                      <span className="text-slate-400">({Math.round(file.size / 1024)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Zero-Retention Security Toggle */}
          <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 flex items-start space-x-3">
            <Lock className="w-5 h-5 text-purple-700 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-purple-950">Zero-Retention Data Privacy Guarantee</span>
                <input
                  type="checkbox"
                  checked={zeroRetention}
                  onChange={(e) => setZeroRetention(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded border-purple-300 focus:ring-purple-500"
                />
              </div>
              <p className="text-xs text-purple-800/80 mt-1 leading-relaxed">
                Adheres to Government zero-retention compliance standards. All raw documents are processed ephemerally in RAM, personal Aadhaar/bank numbers are automatically masked, and an immutable cryptographic SHA-256 audit digest is recorded.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              disabled={uploading}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Running OCR & Compliance Cross-Referencing...</span>
                </>
              ) : (
                <>
                  <span>Audit Filing & Generate Explainability Trace</span>
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
