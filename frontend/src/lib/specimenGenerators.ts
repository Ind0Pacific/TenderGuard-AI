/**
 * Generates client-side high-resolution synthetic document specimen images (PNG Data URLs)
 * used for visual reference and comparison in the TenderGuard AI dashboard.
 */

// -------------------------------------------------------------
// Case A: Apex InfraBuilders Pvt Ltd (APPROVED ✅)
// -------------------------------------------------------------
export function generateCaseASpecimenDataUrl(): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 700;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#fbfbfa';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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
  ctx.font = 'bold 46px sans-serif';
  ctx.fillStyle = 'rgba(217, 119, 6, 0.08)';
  ctx.textAlign = 'center';
  ctx.fillText('CASE A: APPROVED BENCHMARK SPECIMEN', 0, 0);
  ctx.restore();

  // Header
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('GOVERNMENT OF INDIA • DIRECTORATE OF INDUSTRIAL SAFETY', 500, 80);

  ctx.font = 'bold 15px sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('CENTRAL POLLUTION CONTROL BOARD & STATE INFRASTRUCTURE CLEARANCE', 500, 108);

  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(150, 145, 700, 44);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('HEAVY MACHINERY SAFETY & EMISSION FITNESS LICENSE', 500, 174);

  // Details
  ctx.textAlign = 'left';
  ctx.fillStyle = '#334155';
  ctx.font = '14px sans-serif';
  const leftX = 80;
  let y = 230;

  ctx.fillText('Certificate Registration No:', leftX, y);
  ctx.font = 'bold 15px monospace';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('SAF-MACH-2024-99814', leftX + 220, y);

  y += 36;
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('Registered Entity Name:', leftX, y);
  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = '#1e3a8a';
  ctx.fillText('APEX INFRABUILDERS PVT LTD', leftX + 220, y);

  y += 36;
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('Statutory Tax PAN / GSTIN:', leftX, y);
  ctx.font = 'bold 15px monospace';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('PAN: AAACA9812A  •  GST: 07AAACA9812A1Z5', leftX + 220, y);

  y += 36;
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('Approved Machinery:', leftX, y);
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('Batching Plants, Earthmovers, Hydraulic Cranes, Piling Rigs', leftX + 220, y);

  // Emerald Expiry Box
  y += 45;
  ctx.fillStyle = '#ecfdf5';
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 2;
  ctx.fillRect(leftX, y, 840, 75);
  ctx.strokeRect(leftX, y, 840, 75);

  ctx.fillStyle = '#065f46';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('STATUTORY VALIDITY PERIOD:', leftX + 20, y + 28);
  ctx.font = 'bold 22px monospace';
  ctx.fillStyle = '#047857';
  ctx.fillText('VALID THRU: 2028-12-31  (FUTURE EXPIRY • STATUTORY IN-FORCE)', leftX + 20, y + 55);

  // Gold Seal
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
  ctx.fillText('★ VERIFIED ★', 800, 578);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#475569';
  ctx.font = 'italic 14px cursive';
  ctx.fillText('K. S. Ramanathan', 120, 600);
  ctx.font = '12px sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Chief Boiler & Machinery Inspector • Govt. Safety Directorate', 120, 620);

  return canvas.toDataURL('image/png');
}

// -------------------------------------------------------------
// Case B: VoltEdge Electronics Corp (REJECTED ❌)
// -------------------------------------------------------------
export function generateCaseBSpecimenDataUrl(): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 700;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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
  ctx.font = 'bold 46px sans-serif';
  ctx.fillStyle = 'rgba(153, 27, 27, 0.08)';
  ctx.textAlign = 'center';
  ctx.fillText('CASE B: REJECTED SPECIMEN (EXPIRED)', 0, 0);
  ctx.restore();

  // Header
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('BUREAU OF INDIAN STANDARDS (BIS)', 500, 80);

  ctx.font = 'bold 15px sans-serif';
  ctx.fillStyle = '#1e40af';
  ctx.fillText('COMPULSORY REGISTRATION SCHEME FOR ELECTRONICS & IT GOODS', 500, 108);

  ctx.fillStyle = '#1e40af';
  ctx.fillRect(150, 145, 700, 44);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 19px sans-serif';
  ctx.fillText('REGISTRATION OF CONFORMITY CERTIFICATE (CRS)', 500, 174);

  // Details
  ctx.textAlign = 'left';
  ctx.fillStyle = '#334155';
  const leftX = 80;
  let y = 230;

  ctx.font = '14px sans-serif';
  ctx.fillText('BIS Registration Number (R-No):', leftX, y);
  ctx.font = 'bold 15px monospace';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('R-4100982 (IS 13252 Part 1)', leftX + 240, y);

  y += 36;
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('Registered Vendor Name:', leftX, y);
  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('VOLTEDGE ELECTRONICS CORP', leftX + 240, y);

  y += 36;
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('Manufacturing Base Facility:', leftX, y);
  ctx.font = 'bold 14px sans-serif';
  ctx.fillStyle = '#dc2626';
  ctx.fillText('Shenzhen K-Tech Electronics Ltd [ENTITY MISMATCH FLAG]', leftX + 240, y);

  // Red Expiry Box
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
  ctx.fillText('EXPIRY DATE: 2024-03-15  (EXPIRED OVER 8 MONTHS AGO)', leftX + 20, y + 60);

  // Red Stamp
  ctx.save();
  ctx.translate(760, 540);
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
  ctx.fillText('Signed on behalf of Bureau of Indian Standards • Verification ID: REF-BIS-881920', leftX, 615);

  return canvas.toDataURL('image/png');
}

// -------------------------------------------------------------
// Case C: Shakti Heavy Logistics & Civil (EDGE CASE ⚠️)
// -------------------------------------------------------------
export function generateCaseCSpecimenDataUrl(): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 700;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Desk background
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 3.8 degree tilt
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((3.8 * Math.PI) / 180);
  ctx.translate(-450, -300);

  // Paper
  ctx.fillStyle = '#f8f6f0';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 22;
  ctx.shadowOffsetX = 10;
  ctx.shadowOffsetY = 14;
  ctx.fillRect(0, 0, 900, 600);
  ctx.shadowColor = 'transparent';

  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 4;
  ctx.strokeRect(15, 15, 870, 570);

  // Header
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('GOVERNMENT OF GUJARAT • PUBLIC WORKS DEPARTMENT (PWD)', 450, 60);
  ctx.font = 'bold 14px sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('SPECIAL CLASS-A INFRASTRUCTURE & HEAVY LOGISTICS LICENSE', 450, 85);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#334155';
  let y = 140;
  const leftX = 50;

  ctx.font = '13px sans-serif';
  ctx.fillText('License Registry No:', leftX, y);
  ctx.font = 'bold 14px monospace';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('PWD/GUJ/CIVIL/2022/4412', leftX + 180, y);

  y += 34;
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('Contractor Entity:', leftX, y);
  ctx.font = 'bold 15px sans-serif';
  ctx.fillStyle = '#1e3a8a';
  ctx.fillText('SHAKTI HEAVY LOGISTICS & CIVIL', leftX + 180, y);

  y += 34;
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('Statutory PAN:', leftX, y);
  ctx.font = 'bold 14px monospace';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('AAGCS7714M', leftX + 180, y);

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

  // COFFEE CUP STAIN: Radial gradient ring over expiry
  const coffeeX = leftX + 320;
  const coffeeY = y + 40;
  const grad = ctx.createRadialGradient(coffeeX, coffeeY, 50, coffeeX, coffeeY, 90);
  grad.addColorStop(0, 'rgba(120, 53, 15, 0.04)');
  grad.addColorStop(0.7, 'rgba(146, 64, 14, 0.25)');
  grad.addColorStop(0.9, 'rgba(120, 53, 15, 0.55)');
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

  // Heavy Ink Smudge over Expiry Year
  ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
  ctx.beginPath();
  ctx.ellipse(leftX + 375, y + 48, 48, 15, Math.PI / 10, 0, Math.PI * 2);
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

  ctx.restore();

  // Vignette
  const vignette = ctx.createRadialGradient(500, 350, 250, 500, 350, 600);
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/png');
}

// -------------------------------------------------------------
// Generic Model Statutory Benchmark Specimen Generator (For Step Reference)
// -------------------------------------------------------------
export function generateGenericSpecimenDataUrl(
  docType: string,
  companyName: string
): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 8;
  ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('GOVERNMENT OF INDIA • STATUTORY PROCUREMENT SPECIMEN', 450, 65);

  ctx.font = 'bold 16px monospace';
  ctx.fillStyle = '#2563eb';
  ctx.fillText(`STATUTORY DOCUMENT TYPE: ${docType}`, 450, 100);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#334155';
  ctx.font = '14px sans-serif';

  let y = 170;
  ctx.fillText('Registered Legal Entity:', 60, y);
  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(companyName || 'Apex Infrastructure Pvt. Ltd.', 260, y);

  y += 40;
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('Statutory Reference ID:', 60, y);
  ctx.font = 'bold 15px monospace';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(`REF-${docType}-891472`, 260, y);

  y += 40;
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('Statutory Verification Status:', 60, y);
  ctx.font = 'bold 14px sans-serif';
  ctx.fillStyle = '#059669';
  ctx.fillText('ACTIVE • IN-FORCE • COMPLIANT', 260, y);

  // Validity Box
  y += 50;
  ctx.fillStyle = '#ecfdf5';
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.fillRect(60, y, 780, 75);
  ctx.strokeRect(60, y, 780, 75);

  ctx.fillStyle = '#065f46';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('OFFICIAL VALIDITY WINDOW:', 80, y + 28);
  ctx.font = 'bold 20px monospace';
  ctx.fillStyle = '#047857';
  ctx.fillText('VALID THRU: 2028-12-31  (ALL STATUTORY CHECKS PASSED)', 80, y + 55);

  // Seal
  ctx.beginPath();
  ctx.arc(740, 480, 48, 0, Math.PI * 2);
  ctx.fillStyle = '#eff6ff';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#3b82f6';
  ctx.stroke();

  ctx.fillStyle = '#1d4ed8';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('GOVT AUDIT', 740, 475);
  ctx.fillText('OFFICIAL', 740, 490);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748b';
  ctx.font = '11px monospace';
  ctx.fillText('Official Benchmark Specimen • Zero PII • For Evaluation Purposes', 60, 540);

  return canvas.toDataURL('image/png');
}
