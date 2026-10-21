'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Sparkles,
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HardHat,
  Cpu,
  Layers,
  Shield,
  Coffee,
  Info,
} from 'lucide-react';

interface TestDocConfig {
  id: string;
  title: string;
  category: string;
  expectedVerdict: 'VERIFIED' | 'REJECTED' | 'EDGE_CASE';
  badgeColor: string;
  description: string;
  filename: string;
  generatorFn: (canvas: HTMLCanvasElement) => void;
}

export default function TestDocGenerator() {
  const [isOpen, setIsOpen] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Hidden Canvas for rendering high-res images
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ----------------------------------------------------------------------
  // Canvas Generator 1: Valid Construction Safety License (Clean PNG)
  // ----------------------------------------------------------------------
  const generateValidLicense = (canvas: HTMLCanvasElement) => {
    canvas.width = 1000;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background parchment
    ctx.fillStyle = '#fbfbfa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ornate double borders
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.strokeRect(32, 32, canvas.width - 64, canvas.height - 64);

    // Watermark
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 6);
    ctx.font = 'bold 50px sans-serif';
    ctx.fillStyle = 'rgba(217, 119, 6, 0.07)';
    ctx.textAlign = 'center';
    ctx.fillText('SYNTHETIC SPECIMEN - TENDERGUARD AI', 0, 0);
    ctx.restore();

    // Top Header Banner
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GOVERNMENT OF INDIA • DIRECTORATE OF INDUSTRIAL SAFETY', 500, 80);

    ctx.font = 'bold 15px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('CENTRAL POLLUTION CONTROL BOARD & STATE INFRASTRUCTURE CLEARANCE', 500, 108);

    ctx.font = 'italic 13px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('(Issued under Rule 64 of The Building & Other Construction Workers Act)', 500, 130);

    // Certificate Title Box
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(150, 155, 700, 44);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('HEAVY MACHINERY SAFETY & EMISSION FITNESS LICENSE', 500, 184);

    // Certificate Meta
    ctx.textAlign = 'left';
    ctx.fillStyle = '#334155';
    ctx.font = '14px sans-serif';

    const leftX = 80;
    let y = 240;
    const lineHeight = 36;

    ctx.fillText('Certificate Registration No:', leftX, y);
    ctx.font = 'bold 15px monospace';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('SAF-MACH-2024-99814', leftX + 220, y);

    y += lineHeight;
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('Registered Entity Name:', leftX, y);
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#1e3a8a';
    ctx.fillText('APEX INFRABUILDERS PVT LTD', leftX + 220, y);

    y += lineHeight;
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('Statutory Tax PAN / GSTIN:', leftX, y);
    ctx.font = 'bold 15px monospace';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('PAN: AAACA9812A  •  GST: 07AAACA9812A1Z5', leftX + 220, y);

    y += lineHeight;
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('Covered Heavy Equipment:', leftX, y);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('Batching Plants, Earthmovers, Hydraulic Piling Rigs, Tower Cranes', leftX + 220, y);

    y += lineHeight;
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('PUC & Emission Standard:', leftX, y);
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#059669';
    ctx.fillText('STAGE-IV CEV (Bharat Stage Construction Equipment Compliant)', leftX + 220, y);

    // Green Expiry Box (Prominently Valid)
    y += 45;
    ctx.fillStyle = '#ecfdf5';
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2;
    ctx.fillRect(leftX, y, 840, 70);
    ctx.strokeRect(leftX, y, 840, 70);

    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('STATUTORY VALIDITY PERIOD:', leftX + 20, y + 28);
    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = '#047857';
    ctx.fillText('VALID THRU: 2028-12-31  (FUTURE EXPIRY • IN-FORCE)', leftX + 20, y + 55);

    // Stamp / Gold Seal Mockup
    ctx.beginPath();
    ctx.arc(800, 560, 55, 0, Math.PI * 2);
    ctx.fillStyle = '#fef3c7';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#d97706';
    ctx.stroke();

    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DIRECTORATE', 800, 545);
    ctx.fillText('OF SAFETY', 800, 562);
    ctx.fillText('★ OFFICIAL ★', 800, 578);

    // Digital Signatory
    ctx.textAlign = 'left';
    ctx.fillStyle = '#475569';
    ctx.font = 'italic 14px cursive';
    ctx.fillText('K. S. Ramanathan', 120, 600);
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Chief Boiler & Machinery Inspector', 120, 620);
    ctx.fillText('Government Quality Directorate', 120, 638);
  };

  // ----------------------------------------------------------------------
  // Canvas Generator 2: Expired Electronics BIS Certificate (Clean PNG)
  // ----------------------------------------------------------------------
  const generateExpiredBisCert = (canvas: HTMLCanvasElement) => {
    canvas.width = 1000;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clean white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Crimson and blue statutory borders
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    // Watermark
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 6);
    ctx.font = 'bold 55px sans-serif';
    ctx.fillStyle = 'rgba(153, 27, 27, 0.08)';
    ctx.textAlign = 'center';
    ctx.fillText('EXPIRED SPECIMEN - TENDERGUARD', 0, 0);
    ctx.restore();

    // BIS Header
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BUREAU OF INDIAN STANDARDS (BIS)', 500, 80);

    ctx.font = 'bold 15px sans-serif';
    ctx.fillStyle = '#1e40af';
    ctx.fillText('COMPULSORY REGISTRATION SCHEME FOR ELECTRONICS & IT GOODS', 500, 108);

    ctx.font = 'italic 13px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Under the provisions of the Bureau of Indian Standards Act, 2016', 500, 130);

    // Blue Bar
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(150, 155, 700, 44);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 19px sans-serif';
    ctx.fillText('REGISTRATION OF CONFORMITY CERTIFICATE (CRS)', 500, 184);

    // Certificate Meta
    ctx.textAlign = 'left';
    ctx.fillStyle = '#334155';
    const leftX = 80;
    let y = 240;
    const lineHeight = 36;

    ctx.font = '14px sans-serif';
    ctx.fillText('BIS Registration Number (R-No):', leftX, y);
    ctx.font = 'bold 15px monospace';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('R-4100982 (IS 13252 Part 1)', leftX + 240, y);

    y += lineHeight;
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('Registered Vendor Name:', leftX, y);
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('VOLTEDGE ELECTRONICS CORP', leftX + 240, y);

    y += lineHeight;
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('Manufacturing Base Facility:', leftX, y);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#dc2626';
    // Mismatched foreign entity mentioned in spec
    ctx.fillText('Shenzhen K-Tech Electronics Ltd (Sub-Assembly Unit 4)', leftX + 240, y);

    y += lineHeight;
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('Applicable Indian Standard:', leftX, y);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('IS 13252 (Part 1):2010 / IEC 60950-1:2005 (IT Equipment Safety)', leftX + 240, y);

    // RED EXPIRY BOX (Past date: 2024-03-15)
    y += 45;
    ctx.fillStyle = '#fef2f2';
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.fillRect(leftX, y, 840, 75);
    ctx.strokeRect(leftX, y, 840, 75);

    ctx.fillStyle = '#991b1b';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('STATUTORY CRS VALIDITY EXPIRATION:', leftX + 20, y + 30);
    ctx.font = 'bold 24px monospace';
    ctx.fillStyle = '#b91c1c';
    ctx.fillText('EXPIRY DATE: 2024-03-15  (LAPSED / EXPIRED OVER 8 MONTHS)', leftX + 20, y + 60);

    // Large Red Stamp "LAPSED / EXPIRED"
    ctx.save();
    ctx.translate(760, 550);
    ctx.rotate(-Math.PI / 12);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 4;
    ctx.strokeRect(-90, -35, 180, 70);
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('REJECTED', 0, -2);
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('LAPSED RENEWAL', 0, 20);
    ctx.restore();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.fillText('Signed on behalf of Bureau of Indian Standards (Central Office)', leftX, 610);
    ctx.fillText('National Registration Portal • Verification ID: REF-BIS-881920', leftX, 630);
  };

  // ----------------------------------------------------------------------
  // Canvas Generator 3: Dirty/Smudged Contractor License (Noisy/Stained PNG)
  // ----------------------------------------------------------------------
  const generateDirtySmudgedLicense = (canvas: HTMLCanvasElement) => {
    canvas.width = 1000;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark desk surface
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply a 4-degree tilt rotation to simulate a phone camera capture
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((3.8 * Math.PI) / 180); // 3.8 degree tilt
    ctx.translate(-450, -300);

    // Paper background with slightly aged ivory
    ctx.fillStyle = '#f8f6f0';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 8;
    ctx.shadowOffsetY = 12;
    ctx.fillRect(0, 0, 900, 600);
    ctx.shadowColor = 'transparent';

    // Faded outer border
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.strokeRect(15, 15, 870, 570);

    // Watermark
    ctx.font = 'bold 40px sans-serif';
    ctx.fillStyle = 'rgba(100, 116, 139, 0.1)';
    ctx.textAlign = 'center';
    ctx.fillText('STATE CONTRACTOR REGISTRY - SPECIMEN', 450, 300);

    // Header
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('GOVERNMENT OF GUJARAT • PUBLIC WORKS DEPARTMENT (PWD)', 450, 60);
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('SPECIAL CLASS-A INFRASTRUCTURE & HEAVY LOGISTICS CONTRACTOR LICENSE', 450, 85);

    // Content
    ctx.textAlign = 'left';
    ctx.fillStyle = '#334155';
    let y = 140;
    const leftX = 50;
    const lineHeight = 34;

    ctx.font = '13px sans-serif';
    ctx.fillText('License Registry No:', leftX, y);
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('PWD/GUJ/CIVIL/2022/4412', leftX + 180, y);

    y += lineHeight;
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('Contractor Entity:', leftX, y);
    ctx.font = 'bold 15px sans-serif';
    ctx.fillStyle = '#1e3a8a';
    ctx.fillText('SHAKTI HEAVY LOGISTICS & CIVIL', leftX + 180, y);

    y += lineHeight;
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('Statutory PAN:', leftX, y);
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('AAGCS7714M', leftX + 180, y);

    y += lineHeight;
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('Equipment Scope:', leftX, y);
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('Multi-Axle Heavy Haulers, Bridge Girders, Hydraulic Cranes', leftX + 180, y);

    // Ambiguous Expiry Box
    y += 40;
    ctx.fillStyle = '#fef3c7';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.fillRect(leftX, y, 780, 70);
    ctx.strokeRect(leftX, y, 780, 70);

    ctx.fillStyle = '#92400e';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('STATUTORY RENEWAL DATE BOX:', leftX + 20, y + 25);

    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = '#b45309';
    ctx.fillText('VALID THRU: 31-DEC-2026 / 2028', leftX + 20, y + 54);

    // -------------------------------------------------------------
    // COFFEE CUP STAIN 1: Large Ring Over Expiry Date
    // -------------------------------------------------------------
    const coffeeX = leftX + 320;
    const coffeeY = y + 40;
    const grad = ctx.createRadialGradient(coffeeX, coffeeY, 50, coffeeX, coffeeY, 90);
    grad.addColorStop(0, 'rgba(120, 53, 15, 0.04)');
    grad.addColorStop(0.7, 'rgba(146, 64, 14, 0.25)');
    grad.addColorStop(0.9, 'rgba(120, 53, 15, 0.55)'); // Dark stain rim
    grad.addColorStop(1, 'rgba(120, 53, 15, 0.0)');

    ctx.beginPath();
    ctx.arc(coffeeX, coffeeY, 90, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Coffee drip splatters
    for (let i = 0; i < 15; i++) {
      const dropX = coffeeX + (Math.random() - 0.5) * 160;
      const dropY = coffeeY + (Math.random() - 0.5) * 160;
      const radius = Math.random() * 4 + 1;
      ctx.beginPath();
      ctx.arc(dropX, dropY, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(120, 53, 15, 0.45)';
      ctx.fill();
    }

    // Heavy Ink Smudge over Expiry Year (obscuring 2026 vs 2028)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.beginPath();
    ctx.ellipse(leftX + 375, y + 48, 45, 14, Math.PI / 10, 0, Math.PI * 2);
    ctx.fill();

    // Secondary Coffee Ring near top right
    const coffee2X = 720;
    const coffee2Y = 120;
    const grad2 = ctx.createRadialGradient(coffee2X, coffee2Y, 40, coffee2X, coffee2Y, 70);
    grad2.addColorStop(0, 'rgba(120, 53, 15, 0.05)');
    grad2.addColorStop(0.8, 'rgba(146, 64, 14, 0.35)');
    grad2.addColorStop(1, 'rgba(120, 53, 15, 0.0)');
    ctx.beginPath();
    ctx.arc(coffee2X, coffee2Y, 70, 0, Math.PI * 2);
    ctx.fillStyle = grad2;
    ctx.fill();

    // Paper Crease Shadows
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 180);
    ctx.lineTo(900, 240);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(350, 0);
    ctx.lineTo(410, 600);
    ctx.stroke();

    ctx.restore(); // Restore tilt transform

    // Vignette / Low-Light Shadow around corners
    const vignette = ctx.createRadialGradient(500, 350, 250, 500, 350, 600);
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // ----------------------------------------------------------------------
  // Document Configuration List
  // ----------------------------------------------------------------------
  const testDocs: TestDocConfig[] = [
    {
      id: 'doc-valid-construction',
      title: 'Valid Construction Safety License',
      category: 'Construction',
      expectedVerdict: 'VERIFIED',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description:
        'Crisp text, unexpired validity (2028-12-31), official gold seal, and CPCB emission clearance.',
      filename: 'TenderGuard_Valid_Construction_License_2028.png',
      generatorFn: generateValidLicense,
    },
    {
      id: 'doc-expired-bis',
      title: 'Expired Electronics BIS Certificate',
      category: 'Electronics',
      expectedVerdict: 'REJECTED',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      description:
        'Crisp text with expired validity (2024-03-15) & mismatched factory entity. Triggers Red Cross ❌.',
      filename: 'TenderGuard_Expired_BIS_Certificate_2024.png',
      generatorFn: generateExpiredBisCert,
    },
    {
      id: 'doc-dirty-smudge',
      title: 'Dirty/Smudged Contractor License',
      category: 'Construction/Heavy',
      expectedVerdict: 'EDGE_CASE',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      description:
        '3.8° tilted scan, coffee cup ring, and ink smudge obscuring 2026/2028 expiry. Triggers Amber ⚠️.',
      filename: 'TenderGuard_Dirty_Smudged_Contractor_License.png',
      generatorFn: generateDirtySmudgedLicense,
    },
  ];

  const handleDownload = (doc: TestDocConfig) => {
    if (!canvasRef.current) return;
    setGeneratingId(doc.id);

    try {
      doc.generatorFn(canvasRef.current);
      const dataUrl = canvasRef.current.toDataURL('image/png');

      const link = document.createElement('a');
      link.download = doc.filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(doc.title);
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err) {
      console.error('Canvas generation error:', err);
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <>
      {/* Hidden Offscreen Canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Floating Launcher Trigger Pill (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-xs font-bold shadow-2xl shadow-blue-500/40 border border-blue-400/30 hover:border-blue-300 transition-all"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Download Test Documents (Synthetic PNGs)</span>
        </motion.button>
      </div>

      {/* Floating Slide-Over Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-slate-100"
              >
                {/* Drawer Header */}
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Synthetic Test Document Vault</h3>
                      <p className="text-[11px] text-slate-400">HTML5 Canvas Instant Generator</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Privacy Assurance Banner */}
                <div className="mx-6 mt-4 p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-[11px] text-slate-300 space-y-1">
                  <div className="flex items-center space-x-1.5 font-semibold text-blue-300">
                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                    <span>Statutory Privacy Assurance</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    All test documents are rendered 100% client-side via HTML5 Canvas using synthetic dummy IDs.
                    Never upload real citizen identity documents.
                  </p>
                </div>

                {/* Success Notification */}
                {downloadSuccess && (
                  <div className="mx-6 mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">Downloaded {downloadSuccess}! Drag into checklist.</span>
                  </div>
                )}

                {/* Document List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {testDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-3 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${doc.badgeColor}`}
                        >
                          Triggers {doc.expectedVerdict}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{doc.category}</span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-white">{doc.title}</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                          {doc.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={generatingId !== null}
                        onClick={() => handleDownload(doc)}
                        className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center space-x-2 shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>
                          {generatingId === doc.id ? 'Rendering Canvas...' : 'Generate & Download PNG'}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Drawer Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/60 text-center">
                  <p className="text-[11px] text-slate-400">
                    💡 Once downloaded, drag & drop the PNG directly into the active step upload zone on the
                    dashboard!
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
