'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function OfficialAuditReportPage() {
  const [officerNote, setOfficerNote] = useState('All statutory procurement conditions satisfied without human intervention.');
  const [isSigned, setIsSigned] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'TenderGuard AI Compliance Dossier',
        text: 'Official Statutory Audit Report & Compliance Dossier for GeM 4.0 Tender Procurement',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Dossier link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-mesh-surface font-manrope text-on-surface relative overflow-hidden">
      {/* Ambient Aurora Orbs */}
      <div className="absolute top-10 right-0 w-[550px] h-[550px] bg-gradient-to-bl from-teal-500/10 via-emerald-400/5 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/10 via-secondary/5 to-transparent blur-[130px] rounded-full pointer-events-none -z-10" />

      <Navbar />

      <main className="w-full">
        {/* Status & Workflow Subheader Breadcrumb Strip */}
        <div className="w-full glass-panel px-4 sm:px-margin py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-sm border-b border-surface-container">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full btn-gradient-primary text-white font-label text-xs uppercase tracking-wider font-semibold shadow-sm">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              <span>Stage 5 of 5 • Final Determination</span>
            </div>
            <span className="text-xs text-on-surface-variant hidden md:inline">Audit Dossier #TG-2026-IND-9942A</span>
            <span className="text-on-surface-variant/40 hidden md:inline">•</span>
            <span className="text-xs text-secondary flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span> Cryptographically Sealed
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900/80 text-teal-300 font-label text-xs font-semibold hover:bg-slate-800 hover:text-white transition-all shadow-sm border border-white/10 hover:border-teal-500/40"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print Certificate</span>
            </button>
            <button
              onClick={handleShare}
              type="button"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900/80 text-teal-300 font-label text-xs font-semibold hover:bg-slate-800 hover:text-white transition-all shadow-sm border border-white/10 hover:border-teal-500/40"
            >
              <span className="material-symbols-outlined text-[16px]">share</span>
              <span>Share Dossier</span>
            </button>
            <button
              onClick={handlePrint}
              type="button"
              className="btn-gradient-primary flex items-center gap-1.5 px-4 py-2 rounded-xl text-white font-label text-xs font-semibold transition-all shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Download Official PDF (Signed)</span>
            </button>
          </div>
        </div>

        {/* Main Certificate Canvas & Content */}
        <div className="w-full px-4 sm:px-margin py-space-lg flex flex-col gap-space-lg max-w-[1600px] mx-auto">
          {/* Top Document Summary & Sovereign Seal Banner */}
          <div className="relative overflow-hidden rounded-2xl glass-panel-dark gradient-border-card p-6 sm:p-8 shadow-xl">
            <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-secondary-container/30 blur-3xl pointer-events-none"></div>

            <div className="relative flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
              <div className="flex flex-col gap-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-label text-xs font-semibold tracking-wide uppercase flex items-center gap-1 border border-emerald-500/40 shadow-sm">
                    <span className="material-symbols-outlined text-[14px] text-emerald-400">shield</span> GeM 4.0 Attested
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-900/80 text-slate-300 font-label text-xs border border-white/10 shadow-sm">
                    FIPS 140-3 HSM Verified
                  </span>
                  <span className="font-label text-xs text-on-surface-variant">
                    Tender Ref: <strong className="text-primary font-bold font-mono">GeM/2026/B/89412</strong>
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-gradient-sovereign tracking-tight font-headline">
                  Official Statutory Audit Report &amp; Compliance Dossier
                </h1>

                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Comprehensive autonomous statutory cross-examination executed for{' '}
                  <strong className="text-primary font-semibold">TechNova Infotech Private Limited</strong> (CIN: U72900MH2021PTC358912).
                  Zero deviations detected across all central Ministry rules, debarment registries, and statutory criteria.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-1 font-label text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-secondary">calendar_today</span>
                    Audit Date: <strong>21 Oct 2026, 16:45:12 UTC</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-secondary">fingerprint</span>
                    Dossier Digest: <span className="font-mono text-primary font-semibold">sha256:7f4a...92b1</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <span className="material-symbols-outlined text-[15px]">verified_user</span>
                    Non-repudiation Guaranteed
                  </span>
                </div>
              </div>

              {/* Official Sovereign Stamp / Seal Badge */}
              <div className="flex items-center gap-4 p-4 rounded-2xl glass-panel-dark border border-teal-500/30 shadow-md shrink-0">
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-secondary to-primary-container flex items-center justify-center text-white shadow-lg shadow-secondary/30">
                  <span className="material-symbols-outlined text-white text-[30px]">gavel</span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-label text-[10px] uppercase tracking-wider text-secondary font-bold">Government of India</span>
                  <span className="text-base font-bold text-primary leading-tight font-headline">GeM 4.0 Seal</span>
                  <span className="text-xs text-on-surface-variant">Procurement Integrity Verified</span>
                  <span className="font-mono text-[11px] text-emerald-400 font-semibold pt-0.5">ROOT-CA-MEITY #8812</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Qualification Summary Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter">
            {/* Card 1: Final Verdict */}
            <div className="md:col-span-2 xl:col-span-1 rounded-xl bg-primary-container text-white p-6 flex flex-col justify-between shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-label text-xs uppercase tracking-wider text-secondary-fixed font-semibold">Tender Qualification Verdict</span>
                <span className="material-symbols-outlined text-emerald-400 text-[24px]">verified</span>
              </div>
              <div className="my-4 flex flex-col gap-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-label text-xs font-bold uppercase tracking-wider w-fit">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Passed &amp; Tender Eligible
                </div>
                <span className="text-4xl font-extrabold tracking-tight text-white mt-1">100.0%</span>
                <span className="text-xs text-on-primary-container leading-relaxed">
                  All 5 critical statutory obligations verified with absolute cryptographic audit concordance.
                </span>
              </div>
              <div className="pt-2 bg-black/20 -mx-6 -mb-6 px-6 py-2.5 flex items-center justify-between text-[11px] text-secondary-fixed font-mono">
                <span>RULEBOOK: MeitY-2026-REV3</span>
                <span className="flex items-center gap-1 text-emerald-300"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> ZERO DISQUALIFIERS</span>
              </div>
            </div>

            {/* Card 2: Identity & MCA Concordance */}
            <div className="rounded-xl bg-surface-container-lowest p-6 flex flex-col justify-between shadow-sm border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[20px]">corporate_fare</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-label text-xs font-semibold">100% Match</span>
              </div>
              <div className="my-2 flex flex-col">
                <span className="font-label text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">MCA &amp; CBDT Identity Concordance</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-primary">5 / 5 Fields</span>
                  <span className="text-xs text-emerald-400 font-semibold">Identical Entity</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Legal title, PAN entity, and GSTIN registered to identical corporate charter.
                </p>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                <div className="bg-secondary h-full rounded-full w-full"></div>
              </div>
            </div>

            {/* Card 3: Registry & Debarment Check */}
            <div className="rounded-xl bg-surface-container-lowest p-6 flex flex-col justify-between shadow-sm border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[20px]">gavel</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-label text-xs font-semibold">Clean Status</span>
              </div>
              <div className="my-2 flex flex-col">
                <span className="font-label text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">Central Debarment &amp; Blacklist Scan</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-primary">0 Flags</span>
                  <span className="text-xs text-emerald-400 font-semibold">Across 4 Registries</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Queried CVC, GeM incident repository, World Bank sanction database, and EPFO defaults.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
                <span>No active bans or vigilance inquiries</span>
              </div>
            </div>

            {/* Card 4: Hardware & RAM Isolation Privacy Attestation */}
            <div className="rounded-xl bg-surface-container-lowest p-6 flex flex-col justify-between shadow-sm border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[20px]">memory</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-label text-xs font-semibold">Zero Retention</span>
              </div>
              <div className="my-2 flex flex-col">
                <span className="font-label text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">Secure Enclave RAM Purge</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-primary">Attested</span>
                  <span className="text-xs text-secondary font-semibold">0 Residual Bytes</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  All optical extraction buffers were shredded in volatile RAM post-hashing.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-on-surface-variant">
                <span className="material-symbols-outlined text-[15px] text-secondary">lock</span>
                <span>EPHEMERAL-PURGE-ACK#992</span>
              </div>
            </div>
          </div>

          {/* Main 2-Column Split: Document Proof Matrix vs. AI Determination & Officer Sign-off */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            {/* Left Column: Document-by-Document Proof Matrix (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-space-lg">
              <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm border border-outline-variant/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-container">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-secondary">fact_check</span>
                      <h2 className="text-base font-bold text-primary">Document-by-Document Proof Matrix</h2>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Every uploaded artifact verified via OCR bounding box coordinate extraction against live Gov registries.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Standard:</span>
                    <span className="px-2.5 py-1 rounded-lg bg-surface-container-low text-primary font-label text-xs font-bold">Rule Precedence</span>
                  </div>
                </div>

                {/* Proof Matrix Cards Array */}
                <div className="flex flex-col gap-3 pt-4">
                  {/* Item 1: GST */}
                  <div className="p-4 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low transition-all border border-surface-container">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-primary text-xs sm:text-sm">1. GST Registration Certificate (Form GST REG-06)</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-label text-[10px] font-semibold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">check</span> Verified Active
                            </span>
                          </div>
                          <span className="text-xs text-on-surface-variant mt-1">
                            GSTIN: <strong className="text-primary font-mono">27AABCT2341P1ZB</strong> • Reg Date: <strong>15/04/2021</strong> • Validity: <strong>Unlimited (Regular)</strong>
                          </span>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-on-surface-variant">
                            <span className="flex items-center gap-1 text-secondary">
                              <span className="material-symbols-outlined text-[14px]">pin_drop</span> State: 27 (Maharashtra)
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-secondary">
                              <span className="material-symbols-outlined text-[14px]">visibility</span> Visual Trace: Bounding Box Confirmed
                            </span>
                            <span>•</span>
                            <span className="font-mono text-[10px] text-on-surface-variant">Hash: 8f4b01ce...3c12</span>
                          </div>
                        </div>
                      </div>
                      <Link
                        href="/dashboard"
                        className="px-3 py-1.5 rounded-lg bg-slate-900/90 text-teal-300 border border-teal-500/30 font-label text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-1 shrink-0 self-end md:self-start"
                      >
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span> Trace Box
                      </Link>
                    </div>
                  </div>

                  {/* Item 2: PAN */}
                  <div className="p-4 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low transition-all border border-surface-container">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[18px]">badge</span>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-primary text-xs sm:text-sm">2. Permanent Account Number (Company PAN)</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-label text-[10px] font-semibold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">check</span> Valid CBDT &amp; MCA Match
                            </span>
                          </div>
                          <span className="text-xs text-on-surface-variant mt-1">
                            PAN: <strong className="text-primary font-mono">AABCT2341P</strong> • Name: <strong>TechNova Infotech Private Limited</strong> • Category: <strong>Company</strong>
                          </span>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-on-surface-variant">
                            <span className="flex items-center gap-1 text-secondary">
                              <span className="material-symbols-outlined text-[14px]">link</span> MCA Cross-Index: Linked
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-secondary">
                              <span className="material-symbols-outlined text-[14px]">verified</span> IT Department API Status: Operative
                            </span>
                            <span>•</span>
                            <span className="font-mono text-[10px] text-on-surface-variant">Hash: ef2d59aa...691a</span>
                          </div>
                        </div>
                      </div>
                      <Link
                        href="/dashboard"
                        className="px-3 py-1.5 rounded-lg bg-slate-900/90 text-teal-300 border border-teal-500/30 font-label text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-1 shrink-0 self-end md:self-start"
                      >
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span> View Proof
                      </Link>
                    </div>
                  </div>

                  {/* Item 3: Udyam MSME */}
                  <div className="p-4 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low transition-all border border-surface-container">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[18px]">storefront</span>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-primary text-xs sm:text-sm">3. Udyam MSME Registration Certificate</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-label text-[10px] font-semibold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">check</span> Small Enterprise Tier Verified
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-label text-[10px] font-bold">
                              GeM EMD Exemption Granted
                            </span>
                          </div>
                          <span className="text-xs text-on-surface-variant mt-1">
                            Udyam No: <strong className="text-primary font-mono">UDYAM-MH-03-0098411</strong> • Major Activity: <strong>Services &amp; Software Solutions</strong>
                          </span>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-on-surface-variant">
                            <span className="flex items-center gap-1 text-secondary">
                              <span className="material-symbols-outlined text-[14px]">star</span> Public Procurement Policy (PPP) Benefit: Applicable
                            </span>
                            <span>•</span>
                            <span className="font-mono text-[10px] text-on-surface-variant">Hash: 4b22384a...e76b</span>
                          </div>
                        </div>
                      </div>
                      <Link
                        href="/dashboard"
                        className="px-3 py-1.5 rounded-lg bg-slate-900/90 text-teal-300 border border-teal-500/30 font-label text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-1 shrink-0 self-end md:self-start"
                      >
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span> View Proof
                      </Link>
                    </div>
                  </div>

                  {/* Item 4: Startup India */}
                  <div className="p-4 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low transition-all border border-surface-container">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-primary text-xs sm:text-sm">4. Startup India Certificate of Recognition</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-label text-[10px] font-semibold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">check</span> DPIIT Verified Entity
                            </span>
                          </div>
                          <span className="text-xs text-on-surface-variant mt-1">
                            DPIIT Ref: <strong className="text-primary font-mono">DIPP89124</strong> • Incorporated: <strong>15 April 2021 (&lt; 10 Years Concession Applied)</strong>
                          </span>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-on-surface-variant">
                            <span className="flex items-center gap-1 text-secondary">
                              <span className="material-symbols-outlined text-[14px]">workspace_premium</span> Prior Turnover &amp; Experience Relaxation: Active
                            </span>
                            <span>•</span>
                            <span className="font-mono text-[10px] text-on-surface-variant">Hash: ca97fe31...bc11</span>
                          </div>
                        </div>
                      </div>
                      <Link
                        href="/dashboard"
                        className="px-3 py-1.5 rounded-lg bg-slate-900/90 text-teal-300 border border-teal-500/30 font-label text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-1 shrink-0 self-end md:self-start"
                      >
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span> View Proof
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Evaluator Attestation & Officer Sign-off (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-space-lg">
              <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm border border-outline-variant/30 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-surface-container">
                  <span className="material-symbols-outlined text-[20px] text-secondary">draw</span>
                  <h3 className="text-sm font-bold text-primary">Procurement Officer Digital Signature</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-on-surface-variant font-medium mb-1">Evaluator Notes</label>
                    <textarea
                      value={officerNote}
                      onChange={(e) => setOfficerNote(e.target.value)}
                      rows={3}
                      className="w-full bg-surface-container-low border border-surface-container rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:border-secondary"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container space-y-1">
                    <span className="text-[10px] text-on-surface-variant uppercase font-semibold">DSC Token Status</span>
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                      <span className="material-symbols-outlined text-[16px]">key</span>
                      <span>Class 3 Hardware Crypto Token Plugged</span>
                    </div>
                    <span className="text-[10px] font-mono text-on-surface-variant block">Issuer: eMudhra Sub-CA 2026</span>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-[11px] flex items-center justify-between">
                    <span>Officer Attestation:</span>
                    <span className="font-bold">SIGNED &amp; RATIFIED</span>
                  </div>

                  <button
                    onClick={handlePrint}
                    type="button"
                    className="w-full py-2.5 rounded-lg bg-primary hover:bg-secondary text-white font-semibold text-xs transition shadow-md flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                    <span>Download Cryptographically Sealed Dossier</span>
                  </button>

                  <div className="text-center pt-2">
                    <Link
                      href="/admin/audit-ledger"
                      className="text-xs text-secondary hover:text-primary underline font-medium"
                    >
                      ← Back to Cryptographic Audit Ledger
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
