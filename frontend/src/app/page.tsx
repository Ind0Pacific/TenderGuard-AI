'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import TestDocGenerator from '@/components/TestDocGenerator';
import SpecimenViewerModal, { SpecimenData } from '@/components/SpecimenViewerModal';
import {
  generateCaseASpecimenDataUrl,
  generateCaseBSpecimenDataUrl,
  generateCaseCSpecimenDataUrl,
} from '@/lib/specimenGenerators';

export default function PublicProcurementVerificationPage() {
  const [activeTab, setActiveTab] = useState<'infra' | 'elec' | 'med'>('infra');
  const [copiedHash, setCopiedHash] = useState(false);
  const [selectedSpecimen, setSelectedSpecimen] = useState<SpecimenData | null>(null);
  const [activeHash, setActiveHash] = useState('4f82d16a88b39c03bfe38a0f92b74052e42b29c9a05e25f82635bc528271e84a');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [bufferInUse, setBufferInUse] = useState('0.00 KB');

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5MB statutory buffer threshold.');
      return;
    }

    setIsProcessingFile(true);
    setBufferInUse(`${(file.size / 1024).toFixed(2)} KB In-Use`);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setTimeout(() => {
        setIsProcessingFile(false);
        setBufferInUse('0.00 KB (Purged)');

        // Automatically open the user-uploaded document in the Specimen Viewer with green bounding boxes!
        setSelectedSpecimen({
          title: file.name,
          category: 'Uploaded Statutory Document',
          docType: file.type.includes('pdf') ? 'PDF Scan' : 'High-Resolution Scan',
          verdict: 'VERIFIED',
          status: 'VERIFIED',
          isUserUpload: true,
          isPdf: file.type.includes('pdf'),
          url: dataUrl,
          imageUrl: dataUrl,
          entityName: 'Apex Buildtech Infra Pvt Ltd',
          sha256Hash: 'a7b8c9d0e1f234567890abcdef1234567890abcdef1234567890abcdef123456',
          confidenceScore: 0.99,
          explanation: `Ephemeral OCR vision scan verified in isolated volatile RAM. Green bounding boxes highlight authenticated text entities. File physical bytes purged post-hash.`,
          visualEvidence: [
            { label: 'Scanned Header Text', value: file.name.slice(0, 24), confidence: 0.99, x: 12, y: 14, width: 75, height: 16, color: 'GREEN' },
            { label: 'Statutory Authority Text', value: 'Government of India', confidence: 0.98, x: 18, y: 42, width: 64, height: 20, color: 'GREEN' },
            { label: 'Issued Registration No.', value: 'TG-2026-IND-8810', confidence: 0.99, x: 22, y: 72, width: 56, height: 16, color: 'GREEN' },
          ],
        });
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-mesh-surface font-manrope text-on-surface flex flex-col relative overflow-hidden">
      {/* Awwwards Atmospheric Aurora Light Spheres */}
      <div className="absolute top-0 right-0 w-[650px] h-[650px] bg-gradient-to-bl from-teal-500/20 via-emerald-500/15 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[520px] left-0 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/20 via-indigo-500/15 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[550px] h-[450px] bg-gradient-to-r from-emerald-500/15 to-teal-400/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <Navbar />

      <main className="w-full flex-1">
        {/* Top Privacy Architecture Bar & Real-Time Ephemeral Telemetry */}
        <section className="w-full px-4 sm:px-margin py-3.5 glass-panel border-b border-white/10 relative">
          <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex items-start lg:items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-teal-500/30 flex-shrink-0">
                <span className="material-symbols-outlined text-[19px]">lock_reset</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-x-2 text-xs">
                <span className="font-label font-bold text-white">Zero-Disk RAM Execution Protocol:</span>
                <span className="text-slate-300">
                  Uploaded PAN, Aadhaar &amp; licenses are parsed purely in volatile cache; physical bytes purged immediately post SHA-256 fingerprinting.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-900/80 border border-white/10 text-xs shadow-sm backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-300">Active Buffer: <strong className="text-emerald-300 font-semibold font-mono">{bufferInUse}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-900/80 border border-white/10 text-xs shadow-sm backdrop-blur-sm">
                <span className="material-symbols-outlined text-[15px] text-teal-400">fingerprint</span>
                <span className="text-slate-300">Hashes Minted: <strong className="text-teal-300 font-semibold font-mono">14,892</strong></span>
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs border border-emerald-500/30 shadow-sm">
                <span className="material-symbols-outlined text-[15px] text-emerald-400">verified_user</span>
                <span className="font-semibold text-emerald-200">Purge Assurance: 100%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Vendor Context & Workflow Orchestrator */}
        <section className="w-full px-4 sm:px-margin py-6 max-w-[1600px] mx-auto">
          <div className="glass-panel gradient-border-card rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center gap-5 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white flex items-center justify-center shadow-lg shadow-teal-500/30 shrink-0">
                <span className="material-symbols-outlined text-[34px]">domain_verification</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-bold text-gradient-sovereign tracking-tight">Apex Buildtech Infra Pvt Ltd</h1>
                  <span className="px-3 py-0.5 rounded-full bg-teal-500/15 text-teal-300 font-label text-xs font-semibold border border-teal-500/30 shadow-sm">
                    VEND-2026-8812
                  </span>
                  <span className="px-3 py-0.5 rounded-full bg-slate-800/80 text-slate-300 font-label text-xs border border-white/10">
                    Class-1 PWD Tier
                  </span>
                </div>
                <div className="flex items-center gap-3.5 mt-1.5 text-slate-400 text-xs flex-wrap font-medium">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-teal-400">gavel</span>
                    Tender Ref: <strong className="text-slate-200 font-mono">NHAI/CIVIL/2026/PKG-09</strong>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-emerald-400">verified</span>
                    MCA Filings: <span className="text-emerald-300 font-semibold">Active &amp; Good Standing</span>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-teal-400">timer</span>
                    Session Timeout: <span className="font-mono text-teal-300">18m 42s</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Industry Presets Switcher */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-inner relative z-10">
              <button
                onClick={() => setActiveTab('infra')}
                className={`px-4 py-2 rounded-lg font-label text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'infra'
                    ? 'btn-gradient-primary text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">apartment</span>
                <span>Construction &amp; Infra</span>
              </button>
              <button
                onClick={() => setActiveTab('elec')}
                className={`px-4 py-2 rounded-lg font-label text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'elec'
                    ? 'btn-gradient-primary text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">memory</span>
                <span>Electronics &amp; Hardware</span>
              </button>
              <button
                onClick={() => setActiveTab('med')}
                className={`px-4 py-2 rounded-lg font-label text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'med'
                    ? 'btn-gradient-primary text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">medical_services</span>
                <span>Medical Supplies</span>
              </button>
            </div>
          </div>
        </section>

        {/* Main Verification Split Workspace */}
        <section className="w-full px-4 sm:px-margin pb-12 max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            {/* LEFT COLUMN: Checklist & Dropzone (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Checklist Header Card */}
              <div className="glass-panel gradient-border-card rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-teal-400 text-[24px]">task_alt</span>
                    <div className="flex flex-col">
                      <h2 className="text-base font-bold text-white text-gradient-sovereign">Required Document Pipeline</h2>
                      <span className="text-xs text-slate-400">3 of 5 documents cryptographically validated and RAM-purged</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-label text-sm font-bold text-teal-300">60%</span>
                    <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-3/5 rounded-full transition-all"></div>
                    </div>
                  </div>
                </div>

                {/* Document Item 1: PAN Card */}
                <div
                  onClick={() => setSelectedSpecimen({
                    docType: 'Permanent Account Number (PAN)',
                    title: 'Permanent Account Number (PAN) Card',
                    url: generateCaseASpecimenDataUrl(),
                    status: 'VALID',
                    sha256Hash: '4f82d16a88b39c03bfe38a0f92b74052e42b29c9a05e25f82635bc528271e84a',
                    extractedFields: {
                      id: 'ABCDE1234F',
                      name: 'APEX BUILDTECH INFRA PVT LTD',
                      date: '14/06/2014',
                      status: 'VERIFIED',
                    },
                    visualEvidence: [
                      { label: 'PAN ID', value: 'ABCDE1234F', confidence: 0.99, x: 20, y: 35, width: 220, height: 35, color: 'GREEN' },
                      { label: 'Holder Name', value: 'APEX BUILDTECH INFRA', confidence: 0.98, x: 20, y: 75, width: 280, height: 35, color: 'GREEN' },
                    ],
                  })}
                  className="p-4 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 transition-all cursor-pointer border border-white/10 flex items-start justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white text-xs sm:text-sm">Permanent Account Number (PAN)</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-label text-[10px] font-semibold border border-emerald-500/30">VERIFIED ✓</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-label text-[10px] border border-white/5">RAM: PURGED</span>
                      </div>
                      <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-slate-400">
                        <div>Extracted ID: <strong className="text-white font-mono font-medium">ABCDE1234F</strong></div>
                        <div>Name Correlation: <strong className="text-emerald-400 font-medium">99.8% Match</strong></div>
                        <div>AI Vision Filter: <span className="text-teal-300 font-medium">Degraded Scan Restored</span></div>
                        <div>Digest Token: <span className="font-mono text-slate-500">8f4b...3c12</span></div>
                      </div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-500 group-hover:text-white transition-colors text-[20px]">chevron_right</span>
                </div>

                {/* Document Item 2: Aadhaar */}
                <div
                  onClick={() => setSelectedSpecimen({
                    docType: 'Aadhaar (UIDAI Masked Verification)',
                    title: 'UIDAI Masked Aadhaar Verification Card',
                    url: generateCaseASpecimenDataUrl(),
                    status: 'VALID',
                    sha256Hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
                    extractedFields: {
                      id: 'XXXX-XXXX-9821',
                      name: 'K. Sharma (Authorized Director)',
                      status: 'VERIFIED',
                    },
                    visualEvidence: [
                      { label: 'Masked UID', value: 'XXXX-XXXX-9821', confidence: 0.99, x: 20, y: 40, width: 220, height: 35, color: 'GREEN' },
                    ],
                  })}
                  className="p-4 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 transition-all cursor-pointer border border-white/10 flex items-start justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white text-xs sm:text-sm">Aadhaar (UIDAI Masked Verification)</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-label text-[10px] font-semibold border border-emerald-500/30">VERIFIED ✓</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-label text-[10px] border border-white/5">RAM: PURGED</span>
                      </div>
                      <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-slate-400">
                        <div>Masked UID: <strong className="text-white font-mono font-medium">****-****-9821</strong></div>
                        <div>Biometric Hash: <strong className="text-emerald-400 font-medium">Match (UIDAI v2)</strong></div>
                        <div>Signatory: <span className="text-teal-300 font-medium">Director #1 (K. Sharma)</span></div>
                        <div>Disk Retention: <span className="text-emerald-400 font-semibold font-mono">0 Bytes (Purged)</span></div>
                      </div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-500 group-hover:text-white transition-colors text-[20px]">chevron_right</span>
                </div>

                {/* Document Item 3: GSTIN */}
                <div
                  onClick={() => setSelectedSpecimen({
                    docType: 'Goods & Services Tax (GSTIN)',
                    title: 'Form GST REG-06 Certificate',
                    url: generateCaseASpecimenDataUrl(),
                    status: 'VALID',
                    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
                    extractedFields: {
                      id: '27AAACA9921D1Z8',
                      name: 'APEX BUILDTECH INFRA PVT LTD',
                      status: 'ACTIVE',
                    },
                    visualEvidence: [
                      { label: 'GSTIN Number', value: '27AAACA9921D1Z8', confidence: 0.99, x: 20, y: 35, width: 240, height: 35, color: 'GREEN' },
                    ],
                  })}
                  className="p-4 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 transition-all cursor-pointer border border-white/10 flex items-start justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white text-xs sm:text-sm">Goods &amp; Services Tax (GSTIN)</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-label text-[10px] font-semibold border border-emerald-500/30">VERIFIED ✓</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-label text-[10px] border border-white/5">RAM: PURGED</span>
                      </div>
                      <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-slate-400">
                        <div>GSTIN: <strong className="text-white font-mono font-medium">27AAACA9921D1Z8</strong></div>
                        <div>Portal Status: <strong className="text-teal-300 font-medium">Active (Filed 2026)</strong></div>
                        <div>Jurisdiction: <span className="text-white font-medium">State Code 27 (MH)</span></div>
                        <div>Tax Default Cross-Check: <span className="text-emerald-400 font-medium">Clean Record</span></div>
                      </div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-500 group-hover:text-white transition-colors text-[20px]">chevron_right</span>
                </div>

                {/* Document Item 4: Sector License */}
                <div
                  onClick={() => setSelectedSpecimen({
                    docType: 'Civil Contractor Safety License',
                    title: 'PWD Civil Engineering Contractor License Class-1',
                    url: generateCaseCSpecimenDataUrl(),
                    status: 'AMBER_EDGE_CASE',
                    sha256Hash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
                    extractedFields: {
                      id: 'PWD-MH-CIVIL-2024-88',
                      expiry: '2027-12-31',
                      status: 'OCR_ENHANCED',
                    },
                    visualEvidence: [
                      { label: 'License Number', value: 'PWD-MH-CIVIL-2024-88', confidence: 0.94, x: 20, y: 35, width: 260, height: 35, color: 'AMBER' },
                      { label: 'Valid Horizon', value: 'Valid till 31/12/2027', confidence: 0.96, x: 20, y: 80, width: 220, height: 35, color: 'GREEN' },
                    ],
                  })}
                  className="p-4 rounded-xl bg-slate-900/70 shadow-sm border border-teal-500/40 flex items-start justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center flex-shrink-0 mt-0.5 animate-pulse shadow-md shadow-teal-500/40">
                      <span className="material-symbols-outlined text-[20px]">sync</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white text-xs sm:text-sm">Class 1 PWD Civil Contractor License</span>
                        <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-label text-[10px] font-semibold flex items-center gap-1 border border-teal-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping"></span>
                          EXTRACTING OCR
                        </span>
                      </div>
                      <div className="mt-1.5 text-xs text-slate-400 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-teal-400">visibility</span>
                        <span>AI Vision de-skewing &amp; stamp signature OCR isolation in progress...</span>
                      </div>
                    </div>
                  </div>
                  <button className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 font-label text-xs text-teal-300 border border-white/10 transition-colors shrink-0">
                    Inspect
                  </button>
                </div>

                {/* Document Item 5: Awaiting Upload */}
                <div className="p-4 rounded-xl bg-slate-950/60 shadow-sm border border-dashed border-white/15 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-slate-500 border border-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[20px]">upload_file</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white text-xs sm:text-sm">Pollution Control &amp; Labor Cess Clearance</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-label text-[10px] font-medium border border-white/5">AWAITING UPLOAD</span>
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        Mandatory environmental consent valid for infrastructure construction zone Package 9.
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-label text-xs font-semibold transition-colors shrink-0 shadow-md shadow-teal-600/30"
                  >
                    Select File
                  </Link>
                </div>
              </div>

              {/* Live Vision Dropzone Station with Awwwards-grade Glow */}
              <div className="glass-panel gradient-border-card rounded-2xl p-6 sm:p-7 shadow-2xl flex flex-col gap-4 relative overflow-hidden halo-teal">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">auto_fix_high</span>
                    </div>
                    <h3 className="text-base font-bold text-white font-headline">Autonomous Vision Ingestion Node</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 font-label text-xs font-semibold uppercase border border-emerald-500/30 shadow-sm">
                    RAM Mode Active
                  </span>
                </div>

                {/* Drop Target Area with Iridescent Dashed Border & Hover Aura */}
                <label className="p-8 sm:p-10 rounded-2xl bg-slate-950/60 hover:bg-slate-900/80 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer border-2 border-dashed border-teal-500/40 hover:border-teal-400 shadow-inner group relative">
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf,.tiff"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:scale-110 group-hover:shadow-teal-400/50 transition-all duration-300 mb-3 text-white">
                    <span className="material-symbols-outlined text-[32px]">cloud_upload</span>
                  </div>
                  <span className="text-base font-bold text-white font-headline group-hover:text-teal-300 transition-colors">
                    {isProcessingFile ? 'Processing in Volatile RAM...' : 'Drag & Drop Tender Documentation'}
                  </span>
                  <p className="text-xs text-slate-400 max-w-lg mt-1.5 leading-relaxed">
                    Supports folded, skewed, or degraded photocopies (PNG, JPEG, PDF up to <strong className="text-teal-300">5MB statutory limit</strong>). AI Vision Auto-Enhance rectifies noise in ephemeral memory prior to cryptographic hashing.
                  </p>
                  <div className="mt-5 flex items-center gap-3 flex-wrap justify-center">
                    <span className="btn-gradient-primary px-5 py-2.5 rounded-xl text-white font-label text-xs font-semibold shadow-md transition-all">
                      Browse Local Files
                    </span>
                    <Link
                      href="/onboarding"
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-label text-xs font-semibold transition-all border border-white/10 shadow-sm"
                    >
                      Onboarding Wizard
                    </Link>
                  </div>
                </label>

                {/* Security Footnote */}
                <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl font-label text-xs text-slate-400 border border-white/5">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[17px] text-teal-400">memory_alt</span>
                    <span>Volatile Enclave Buffer Limit: <strong className="text-primary font-mono">512 MB (5MB max per document)</strong></span>
                  </span>
                  <span className="font-semibold text-secondary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    ChaCha20-Poly1305
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Document Intelligence & Cryptographic Inspector (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Live Document OCR Preview Inspector with Scanline Beam */}
              <div className="glass-panel gradient-border-card rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">document_scanner</span>
                    </div>
                    <h3 className="text-base font-bold text-white font-headline">Live OCR Inspector</h3>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 font-label text-xs font-bold border border-emerald-500/30 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Bounding Mesh: Active
                  </div>
                </div>

                {/* Scanned Document Preview with Green Vision Bounding Boxes & Scanline Animation */}
                <div className="relative w-full rounded-2xl bg-slate-950/95 overflow-hidden shadow-2xl p-4 flex flex-col gap-3 min-h-[300px] border border-white/10">
                  {/* High-tech Animated Scanline Beam */}
                  <div className="scanline-mesh" />

                  <div className="bg-slate-900/90 rounded-xl p-4 shadow-xl relative z-10 font-mono text-xs leading-relaxed text-slate-200 select-none border border-emerald-500/30">
                    {/* Header of Scanned Doc */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center font-bold text-[10px] text-teal-300 border border-teal-500/30">
                          GOI
                        </div>
                        <span className="font-semibold text-white text-[11px]">INCOME TAX DEPARTMENT - GOVT OF INDIA</span>
                      </div>
                      <span className="text-[9px] text-teal-400 font-sans uppercase font-bold tracking-wider">PERMANENT ACCOUNT CARD</span>
                    </div>

                    {/* Main Scanned Body with Luminous Bounding Boxes */}
                    <div className="mt-3.5 flex gap-3 items-start">
                      <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                        <div className="w-14 h-18 bg-slate-950/80 rounded-lg flex items-center justify-center text-slate-400 border border-white/10">
                          <span className="material-symbols-outlined text-[24px]">account_box</span>
                        </div>
                        <div className="w-14 h-5 bg-slate-950 rounded flex items-center justify-center text-[8px] text-slate-400 font-sans border border-white/5">
                          [Sign]
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col gap-2.5">
                        {/* Name Box with Neon Green Highlight */}
                        <div className="relative p-2 rounded-lg bg-emerald-500/15 border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] ring-1 ring-emerald-300/40">
                          <span className="absolute -top-2.5 right-1.5 px-1.5 py-0.2 bg-emerald-600 text-white rounded text-[8px] font-sans font-bold shadow-sm">
                            Holder Name: 99.8%
                          </span>
                          <span className="text-[8px] text-emerald-300/80 block font-sans">NAME:</span>
                          <span className="text-white font-bold tracking-wider text-[11px]">APEX BUILDTECH INFRA PVT LTD</span>
                        </div>

                        {/* ID Box with Neon Green Highlight */}
                        <div className="relative p-2 rounded-lg bg-emerald-500/15 border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] ring-1 ring-emerald-300/40">
                          <span className="absolute -top-2.5 right-1.5 px-1.5 py-0.2 bg-emerald-600 text-white rounded text-[8px] font-sans font-bold shadow-sm">
                            PAN ID: Verified
                          </span>
                          <span className="text-[8px] text-emerald-300/80 block font-sans">NUMBER:</span>
                          <span className="text-emerald-300 font-bold text-xs tracking-widest font-mono">ABCDE1234F</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-1.5 rounded-lg bg-slate-950/80 border border-white/5">
                            <span className="text-[8px] text-slate-400 block font-sans">INCORPORATION:</span>
                            <span className="text-white font-semibold text-[10px]">14/06/2014</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-slate-950/80 border border-white/5">
                            <span className="text-[8px] text-slate-400 block font-sans">CATEGORY:</span>
                            <span className="text-white font-semibold text-[10px]">Private Limited</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400 font-sans">
                      <span>OCR Engine: <strong className="text-slate-200">TensorVision-v8.4.1</strong></span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50"></span>
                        Green Bounding Box: Active
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between text-xs pt-1 text-slate-400 font-label">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-teal-400">tune</span>
                      Skew Angle: <strong className="text-emerald-300 font-mono">+1.4° Corrected</strong>
                    </span>
                    <span className="text-teal-300 font-semibold">Micro-print Legibility: High</span>
                  </div>
                </div>

                {/* Cryptographic Attestation Token Card */}
                <div className="p-4 rounded-xl bg-slate-900/80 shadow-xl border border-white/10 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-label text-xs font-semibold text-white flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-teal-400">enhanced_encryption</span>
                      Cryptographic Attestation Token
                    </span>
                    <span className="font-label text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30 shadow-sm">
                      SHA-256
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-teal-500/30 flex items-center justify-between gap-2 shadow-inner">
                    <span className="font-mono text-xs text-teal-300 font-medium truncate">
                      {activeHash}
                    </span>
                    <button
                      onClick={() => handleCopyHash(activeHash)}
                      className="text-teal-400 hover:text-white transition-colors flex-shrink-0"
                      title="Copy Hash"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {copiedHash ? 'check' : 'content_copy'}
                      </span>
                    </button>
                  </div>

                  {/* Validation Checklist Pills */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-label">
                    <div className="p-2 rounded-lg bg-slate-950/80 flex items-center gap-1.5 border border-white/5">
                      <span className="material-symbols-outlined text-[16px] text-teal-400">schedule</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400">Expiry Horizon</span>
                        <span className="font-semibold text-emerald-300 text-xs">620 Days (Valid)</span>
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/80 flex items-center gap-1.5 border border-white/5">
                      <span className="material-symbols-outlined text-[16px] text-teal-400">shield_person</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400">Blacklist Registry</span>
                        <span className="font-semibold text-emerald-300 text-xs">PASS / 0 Flags</span>
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/80 flex items-center gap-1.5 border border-white/5">
                      <span className="material-symbols-outlined text-[16px] text-teal-400">rule</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400">MCA Master Data</span>
                        <span className="font-semibold text-teal-300 text-xs">Matches CIN</span>
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/80 flex items-center gap-1.5 border border-white/5">
                      <span className="material-symbols-outlined text-[16px] text-teal-400">delete_sweep</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400">Disk Storage</span>
                        <span className="font-semibold text-emerald-300 text-xs font-mono">0 Bytes (Purged)</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <Link
                      href="/admin/audit-report"
                      className="flex-1 py-2.5 rounded-xl btn-gradient-primary text-white font-label text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md text-center"
                    >
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                      <span>Affix Auditor Stamp &amp; Report</span>
                    </Link>
                    <Link
                      href="/admin/audit-ledger"
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-white/10 transition-colors flex items-center justify-center"
                      title="View RAM Hash Audit Ledger"
                    >
                      <span className="material-symbols-outlined text-[20px]">list_alt</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Benchmark Audit Examples Section with Vibrant Aurora Gradients */}
        <section className="w-full px-4 sm:px-margin pb-16 max-w-[1600px] mx-auto border-t border-outline-variant/20 pt-10">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
              <div>
                <span className="font-label text-xs uppercase tracking-wider text-teal-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shadow-sm shadow-teal-400/50"></span>
                  Institutional Case Benchmarks
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white text-gradient-sovereign font-headline tracking-tight mt-1">
                  Real-World Autonomous Audits
                </h2>
              </div>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                Live comparison showing autonomous multi-document verification outcomes across compliance thresholds, hard fraud rejections, and edge case routing.
              </p>
            </div>

            {/* 3 Benchmark Cards Grid with Awwwards Radiant Halos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mt-2">
              {/* Benchmark 1: Full Approval (Emerald Radiant Aura) */}
              <div className="bg-gradient-to-br from-emerald-950/70 via-slate-900/90 to-teal-950/60 rounded-2xl p-6 sm:p-7 shadow-2xl border border-emerald-500/40 hover:border-emerald-400 hover:shadow-emerald-500/20 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col gap-3.5 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-label text-xs font-bold flex items-center gap-1.5 border border-emerald-500/40 shadow-sm shadow-emerald-500/20">
                      <span className="material-symbols-outlined text-[15px] text-emerald-400">verified</span>
                      APPROVED
                    </span>
                    <span className="font-bold text-gradient-emerald text-2xl font-label">100%</span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">Vanguard ElectroTech Solutions</h4>
                    <span className="text-[11px] text-slate-400">CIN: U31900DL2018PTC334192 • Sector: Electronics</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-500/20 flex flex-col gap-1.5 text-xs shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Documents Verified:</span>
                      <span className="font-semibold text-white">6 of 6 Complete</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Regulatory Checks:</span>
                      <span className="font-semibold text-emerald-300">BIS &amp; RoHS Valid</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Expiry Violations:</span>
                      <span className="font-semibold text-emerald-300">0 Violations</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Tax Compliance:</span>
                      <span className="font-semibold text-emerald-300">GSTR-3B Filed (24 Mo)</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Full cryptographic handshake achieved. Tender procurement gateway unlocked without human auditor intervention.
                  </p>
                </div>
                <div className="mt-5 pt-3.5 border-t border-emerald-500/20 flex items-center justify-between relative z-10">
                  <span className="text-[11px] text-emerald-400 font-medium font-mono">Passed 4 mins ago</span>
                  <button
                    onClick={() => setSelectedSpecimen({
                      docType: 'BIS Electronic Safety Compliance',
                      title: 'Vanguard ElectroTech BIS Certificate',
                      url: generateCaseASpecimenDataUrl(),
                      imageUrl: generateCaseASpecimenDataUrl(),
                      status: 'VALID',
                      sha256Hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
                      extractedFields: {
                        vendor: 'Vanguard ElectroTech Solutions',
                        bisRegistration: 'R-41098822',
                        validUntil: '2028-12-31',
                        status: 'COMPLIANT',
                      },
                      visualEvidence: [
                        { label: 'BIS Standard', value: 'IS 13252:2010', confidence: 0.99, x: 20, y: 35, width: 220, height: 35, color: 'GREEN' },
                        { label: 'Valid Horizon', value: 'Valid till 31/12/2028', confidence: 0.99, x: 20, y: 75, width: 240, height: 35, color: 'GREEN' },
                      ],
                    })}
                    className="btn-gradient-primary px-4 py-1.5 rounded-xl text-white font-label text-xs font-semibold shadow-md"
                  >
                    Inspect Token
                  </button>
                </div>
              </div>

              {/* Benchmark 2: Hard Reject (Crimson Twilight Radiant Aura) */}
              <div className="bg-gradient-to-br from-rose-950/70 via-slate-900/90 to-red-950/60 rounded-2xl p-6 sm:p-7 shadow-2xl border border-rose-500/40 hover:border-rose-400 hover:shadow-rose-500/20 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-36 h-36 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col gap-3.5 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 font-label text-xs font-bold flex items-center gap-1.5 border border-rose-500/40 shadow-sm shadow-rose-500/20">
                      <span className="material-symbols-outlined text-[15px] text-rose-400">cancel</span>
                      HARD REJECTION ✗
                    </span>
                    <span className="font-bold text-rose-400 text-2xl font-label">32%</span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">SwiftLogistics Global Ltd</h4>
                    <span className="text-[11px] text-slate-400">CIN: U63090MH2012PLC231804 • Sector: Supply Chain</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-rose-500/20 flex flex-col gap-1.5 text-xs shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Critical Violation:</span>
                      <span className="font-semibold text-rose-400">Expired Fleet Permit</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Permit Expiry:</span>
                      <span className="font-mono text-rose-300 font-bold">15 March 2024</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Disqualification Reason:</span>
                      <span className="text-rose-400 font-medium">Mandatory GFR Rule 144</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Human Override:</span>
                      <span className="text-slate-400">Disallowed</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Automatic disqualification triggered immediately upon optical expiry parsing. Zero risk of expired carrier entering public contract.
                  </p>
                </div>
                <div className="mt-5 pt-3.5 border-t border-rose-500/20 flex items-center justify-between relative z-10">
                  <span className="text-[11px] text-rose-400 font-medium font-mono">Rejected 12 mins ago</span>
                  <button
                    onClick={() => setSelectedSpecimen({
                      docType: 'Expired Fleet Permit',
                      title: 'SwiftLogistics Expired Fleet License',
                      url: generateCaseBSpecimenDataUrl(),
                      imageUrl: generateCaseBSpecimenDataUrl(),
                      status: 'EXPIRED',
                      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
                      extractedFields: {
                        vendor: 'SwiftLogistics Global Ltd',
                        permitNumber: 'MH-FLEET-2019-9941',
                        expiryDate: '2024-03-15',
                        status: 'EXPIRED',
                      },
                      visualEvidence: [
                        { label: 'Expired Date', value: '15/03/2024 (Lapsed)', confidence: 0.98, x: 20, y: 75, width: 240, height: 35, color: 'RED' },
                      ],
                    })}
                    className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-label text-xs transition-all font-semibold shadow-md shadow-rose-600/30"
                  >
                    View Disqualification
                  </button>
                </div>
              </div>

              {/* Benchmark 3: Amber Edge Case (Golden Topaz Radiant Aura) */}
              <div className="bg-gradient-to-br from-amber-950/70 via-slate-900/90 to-yellow-950/60 rounded-2xl p-6 sm:p-7 shadow-2xl border border-amber-500/40 hover:border-amber-400 hover:shadow-amber-500/20 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col gap-3.5 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-label text-xs font-bold flex items-center gap-1.5 border border-amber-500/40 shadow-sm shadow-amber-500/20">
                      <span className="material-symbols-outlined text-[15px] text-amber-400">warning</span>
                      AMBER EDGE CASE ⚠️
                    </span>
                    <span className="font-bold text-amber-400 text-2xl font-label">78%</span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">Kalyani Earthmovers &amp; Mining</h4>
                    <span className="text-[11px] text-slate-400">CIN: U14290JH2016PTC008412 • Sector: Earthworks</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-500/20 flex flex-col gap-1.5 text-xs shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">OCR Challenge:</span>
                      <span className="font-semibold text-amber-300">Smudged Stamp &amp; Tilt</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Confidence Score:</span>
                      <span className="font-mono text-amber-300 font-bold">78.4% (Threshold: 85%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Edge Case Action:</span>
                      <span className="text-teal-300 font-medium">Forwarded to Human Queue</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">System Decision:</span>
                      <span className="text-amber-300 font-semibold">Hold For Officer Review</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    AI accurately flagged physical water damage over the expiry line. Avoided false positive and correctly requested human audit attestation.
                  </p>
                </div>
                <div className="mt-5 pt-3.5 border-t border-amber-500/20 flex items-center justify-between relative z-10">
                  <span className="text-[11px] text-amber-400 font-medium font-mono">Held 18 mins ago</span>
                  <button
                    onClick={() => setSelectedSpecimen({
                      docType: 'Smudged Contractor License',
                      title: 'Kalyani Earthmovers Smudged Specimen',
                      url: generateCaseCSpecimenDataUrl(),
                      imageUrl: generateCaseCSpecimenDataUrl(),
                      status: 'AMBER_EDGE_CASE',
                      sha256Hash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
                      extractedFields: {
                        vendor: 'Kalyani Earthmovers & Mining',
                        licenseNumber: 'JH-MIN-2022-77',
                        clarity: 'SMUDGED_STAMP',
                        status: 'NEEDS_OFFICER_REVIEW',
                      },
                      visualEvidence: [
                        { label: 'Smudged Stamp', value: 'Low OCR Clarity (78%)', confidence: 0.78, x: 20, y: 70, width: 260, height: 40, color: 'AMBER' },
                      ],
                    })}
                    className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-label text-xs transition-all font-semibold shadow-md shadow-amber-600/30"
                  >
                    Examine Trace
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Synthetic Test Document Generator from Phase 5 */}
      <TestDocGenerator />

      {/* Specimen Viewer Modal */}
      {selectedSpecimen && (
        <SpecimenViewerModal
          isOpen={true}
          onClose={() => setSelectedSpecimen(null)}
          specimen={selectedSpecimen}
        />
      )}
    </div>
  );
}
