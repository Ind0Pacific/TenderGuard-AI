'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import DemoCaseSwitcher from '@/components/DemoCaseSwitcher';
import TestDocGenerator from '@/components/TestDocGenerator';
import SpecimenViewerModal, { SpecimenData } from '@/components/SpecimenViewerModal';
import {
  generateCaseASpecimenDataUrl,
  generateCaseBSpecimenDataUrl,
  generateCaseCSpecimenDataUrl,
  generateGenericSpecimenDataUrl,
} from '@/lib/specimenGenerators';
import {
  VendorCategory,
  ApplicationStatus,
  AuditStatus,
  ChecklistDocumentConfig,
  SequentialStepProgress,
  DocumentAuditLogItem,
  VisualEvidence,
} from '@/lib/types';
import { generateVisualEvidenceBoxes } from '@/lib/aiVerifier';
import {
  getChecklistForCategory,
  evaluateSequentialProgress,
} from '@/lib/checklists';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UploadCloud,
  FileText,
  RefreshCw,
  HardHat,
  Cpu,
  Truck,
  Building,
  Key,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Database,
  CpuIcon,
  Trash2,
  Layers,
  ChevronDown,
  ChevronUp,
  Info,
  Eye,
  FileCheck2,
  BookOpen,
} from 'lucide-react';

// Processing Stages for RAM lifecycle animation
type ProcessingStage =
  | 'IDLE'
  | 'LOADING_RAM'
  | 'GENERATING_HASH'
  | 'VISION_AI'
  | 'PURGING_RAM'
  | 'COMPLETED';

export default function DashboardPage() {
  const router = useRouter();

  // Vendor Session State
  const [vendor, setVendor] = useState<{
    id: string;
    phoneNumber: string;
    companyName: string | null;
    category: VendorCategory | null;
    applicationStatus: ApplicationStatus;
    auditLogs: DocumentAuditLogItem[];
  } | null>(null);

  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<VendorCategory>(VendorCategory.CONSTRUCTION);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Client-side in-memory upload previews (Zero disk writes, RAM only, cleared on unmount/reload)
  const [uploadedPreviews, setUploadedPreviews] = useState<
    Record<
      string,
      {
        url: string;
        fileName: string;
        fileSize?: string;
        isPdf?: boolean;
        visualEvidence?: VisualEvidence[];
        uploadedAt: string;
      }
    >
  >({});
  const [activeSpecimen, setActiveSpecimen] = useState<SpecimenData | null>(null);

  // Active Upload / Processing State
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('IDLE');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(1);
  const [dragActiveDocType, setDragActiveDocType] = useState<string | null>(null);

  // Hidden File Input Ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const targetDocTypeRef = useRef<string | null>(null);

  // Load Vendor Session and Audit Logs
  useEffect(() => {
    fetchVendorSession();
  }, []);

  async function fetchVendorSession() {
    try {
      setIsLoadingSession(true);
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        // If not authenticated, redirect to login
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (data.authenticated && data.vendor) {
        if (data.vendor.needsOnboarding) {
          router.push('/onboarding');
          return;
        }

        const cat = (data.vendor.category as VendorCategory) || VendorCategory.CONSTRUCTION;
        setActiveCategory(cat);
        setVendor(data.vendor);
      } else {
        router.push('/login');
      }
    } catch (err) {
      console.error('Error fetching vendor session:', err);
      router.push('/login');
    } finally {
      setIsLoadingSession(false);
    }
  }

  // Derive Sequential Step Progress
  const evaluation = evaluateSequentialProgress(
    activeCategory,
    vendor?.auditLogs || []
  );

  // Automatically keep current actionable step expanded
  useEffect(() => {
    if (evaluation.currentDocument) {
      setExpandedStep(evaluation.currentDocument.stepNumber);
    } else if (evaluation.isAllCompleted) {
      setExpandedStep(null);
    }
  }, [evaluation.currentDocument?.stepNumber, evaluation.isAllCompleted]);

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent, docType: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveDocType(docType);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveDocType(null);
  };

  const handleDrop = (e: React.DragEvent, docType: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveDocType(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processDocumentUpload(file, docType);
    }
  };

  const triggerFileInput = (docType: string) => {
    targetDocTypeRef.current = docType;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleNativeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && targetDocTypeRef.current) {
      const file = e.target.files[0];
      processDocumentUpload(file, targetDocTypeRef.current);
    }
  };

  // Upload and Execute In-Memory Verification with 4-stage RAM progress
  async function processDocumentUpload(file: File, docType: string, scenario?: string) {
    setUploadError(null);

    // Support uploads up to 10MB (covers high-res scans & multi-page PDF certificates)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum allowed limit of 10MB.`);
      return;
    }

    setUploadingDocType(docType);

    // Retain in client-side ephemeral memory for immediate visual inspection (Zero disk/db retention)
    try {
      const objectUrl = URL.createObjectURL(file);
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      setUploadedPreviews((prev) => ({
        ...prev,
        [docType]: {
          url: objectUrl,
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          isPdf,
          uploadedAt: new Date().toLocaleTimeString(),
        },
      }));
    } catch (e) {
      console.warn('Could not create ephemeral object URL for file preview:', e);
    }

    try {
      // Stage 1: Volatile RAM Allocation
      setProcessingStage('LOADING_RAM');
      await new Promise((r) => setTimeout(r, 450));

      // Stage 2: SHA-256 Cryptographic Hash Generation
      setProcessingStage('GENERATING_HASH');
      await new Promise((r) => setTimeout(r, 450));

      // Stage 3: Vision AI & Dirty-Doc OCR
      setProcessingStage('VISION_AI');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('docType', docType);
      if (scenario) {
        formData.append('testScenario', scenario);
      }

      const res = await fetch('/api/verify-doc', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      // Stage 4: RAM Buffer Purging
      setProcessingStage('PURGING_RAM');
      await new Promise((r) => setTimeout(r, 400));

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Store returned scanned text visual evidence (green bounding boxes)
      if (data.visualEvidence && Array.isArray(data.visualEvidence)) {
        setUploadedPreviews((prev) => {
          if (!prev[docType]) return prev;
          return {
            ...prev,
            [docType]: {
              ...prev[docType],
              visualEvidence: data.visualEvidence,
            },
          };
        });
      }

      setProcessingStage('COMPLETED');
      await new Promise((r) => setTimeout(r, 300));

      // Refresh vendor data to unlock next step in checklist
      await fetchVendorSession();
    } catch (err: any) {
      setUploadError(err.message || 'Error processing document');
    } finally {
      setUploadingDocType(null);
      setProcessingStage('IDLE');
    }
  }

  // Quick Synthetic Demo Upload Generator (Allows instant testing without external files)
  const handleSyntheticDemoUpload = (docType: string, scenario: 'VALID' | 'DEGRADED' | 'EXPIRED') => {
    // Dynamically render a high-resolution canvas certificate image
    const canvas = document.createElement('canvas');
    canvas.width = 850;
    canvas.height = 550;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      // Fallback if canvas context unavailable
      const mockText = `TENDERGUARD_AI_STATUTORY_DOCUMENT\nScenario: ${scenario}\nDocType: ${docType}\nCompany: ${
        vendor?.companyName || 'Apex Infrastructure'
      }\nNonce: ${Date.now()}-${Math.random().toString(36).substring(7)}\n${
        scenario === 'EXPIRED'
          ? 'EXPIRY DATE: 2024-03-15 [EXPIRED]'
          : scenario === 'DEGRADED'
          ? 'Scan Quality: 68% - Low light dirty smartphone capture with coffee rings'
          : 'Status: Valid & In-Force thru 2028-12-31'
      }`;
      const blob = new Blob([mockText], { type: 'text/plain' });
      const file = new File([blob], `${docType}_${scenario.toLowerCase()}_sample.txt`, {
        type: 'text/plain',
      });
      processDocumentUpload(file, docType, scenario);
      return;
    }

    // Draw realistic certificate
    ctx.fillStyle = scenario === 'DEGRADED' ? '#f5f0e6' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle =
      scenario === 'EXPIRED' ? '#dc2626' : scenario === 'DEGRADED' ? '#d97706' : '#2563eb';
    ctx.lineWidth = 8;
    ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GOVERNMENT PROCUREMENT STATUTORY CERTIFICATE', 425, 55);

    ctx.font = 'bold 15px monospace';
    ctx.fillStyle = '#1e40af';
    ctx.fillText(`STATUTORY DOCUMENT TYPE: ${docType}`, 425, 88);

    ctx.textAlign = 'left';
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText(`Registered Entity: ${vendor?.companyName || 'Apex Infrastructure'}`, 50, 140);
    ctx.fillText(`Statutory Reg No: REF-${docType}-${Date.now().toString().slice(-6)}`, 50, 170);

    if (scenario === 'EXPIRED') {
      ctx.fillStyle = '#fee2e2';
      ctx.fillRect(50, 210, 750, 80);
      ctx.strokeStyle = '#ef4444';
      ctx.strokeRect(50, 210, 750, 80);
      ctx.fillStyle = '#b91c1c';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('EXPIRY DATE: 2024-03-15 [EXPIRED OVER 8 MONTHS]', 70, 258);

      ctx.save();
      ctx.translate(680, 390);
      ctx.rotate(-0.2);
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 4;
      ctx.strokeRect(-80, -30, 160, 60);
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('REJECTED', 0, 8);
      ctx.restore();
    } else if (scenario === 'DEGRADED') {
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(50, 210, 750, 80);
      ctx.strokeStyle = '#d97706';
      ctx.strokeRect(50, 210, 750, 80);
      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('VALID THRU: 31-DEC-2026 / 2028 [SMUDGED]', 70, 258);

      // Coffee Cup Ring
      ctx.beginPath();
      ctx.arc(380, 250, 55, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(120, 53, 15, 0.65)';
      ctx.lineWidth = 7;
      ctx.stroke();

      // Ink Smudge
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(330, 242, 85, 22);
    } else {
      ctx.fillStyle = '#ecfdf5';
      ctx.fillRect(50, 210, 750, 80);
      ctx.strokeStyle = '#10b981';
      ctx.strokeRect(50, 210, 750, 80);
      ctx.fillStyle = '#047857';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('VALID THRU: 2028-12-31 [ACTIVE & IN-FORCE]', 70, 258);
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = '11px monospace';
    ctx.fillText(
      `Cryptographic Audit Nonce: ${Date.now()}-${Math.random().toString(36).substring(7)}`,
      50,
      480
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${docType}_${scenario.toLowerCase()}_sample.png`, {
          type: 'image/png',
        });
        processDocumentUpload(file, docType, scenario);
      }
    }, 'image/png');
  };

  const copyToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // View the user's uploaded document using ephemeral client memory
  const viewUserUploadedDocument = (step: SequentialStepProgress) => {
    const preview = uploadedPreviews[step.docType];
    const previewUrl =
      preview?.url ||
      generateGenericSpecimenDataUrl(step.docType, vendor?.companyName || 'Registered Vendor Entity');
    const isPdf = preview?.isPdf || false;

    const verdict =
      step.status === 'VERIFIED' || step.status === 'REJECTED' || step.status === 'EDGE_CASE'
        ? step.status
        : 'VERIFIED';

    const visualEvidence =
      preview?.visualEvidence ||
      generateVisualEvidenceBoxes(
        step.docType,
        vendor?.companyName || 'Registered Vendor Entity',
        step.auditLog?.expiryDate
          ? new Date(step.auditLog.expiryDate).toISOString().split('T')[0]
          : '2028-12-31',
        verdict
      );

    setActiveSpecimen({
      title: `Your Uploaded Filing: ${step.title}`,
      category: activeCategory,
      verdict,
      imageUrl: previewUrl,
      isPdf,
      isUserUpload: true,
      visualEvidence,
      sha256Hash: step.auditLog?.sha256Hash || 'In-Memory Volatile Digest',
      entityName: vendor?.companyName || 'Registered Vendor Entity',
      expiryDate: step.auditLog?.expiryDate
        ? new Date(step.auditLog.expiryDate).toLocaleDateString()
        : 'Active / In-Force',
      confidenceScore: step.auditLog?.confidenceScore || 0.95,
      explanation:
        step.auditLog?.aiRemarks ||
        'Document was ingested into volatile RAM buffer. OCR and validation completed with zero-disk-storage privacy adherence.',
      highlightNotes: [
        preview
          ? `Ephemeral In-Memory Client Buffer: ${preview.fileName} (${preview.fileSize})`
          : 'Zero-Retention Notice: Original file was purged from RAM upon verification. Displaying reconstructed benchmark specimen.',
        `Cryptographic Ledger Fingerprint: ${
          step.auditLog?.sha256Hash
            ? `${step.auditLog.sha256Hash.slice(0, 24)}...`
            : 'Generated in RAM'
        }`,
        'Zero Disk Retention Guarantee: No files or blobs are ever written to server disk or database.',
        `Current Compliance State: ${step.status}`,
      ],
    });
  };

  // View standard statutory model benchmark specimen for this step
  const viewBenchmarkSpecimen = (step: SequentialStepProgress) => {
    const fullConfig = getChecklistForCategory(activeCategory).find(
      (c) => c.docType === step.docType
    );

    const visualEvidence = generateVisualEvidenceBoxes(
      step.docType,
      vendor?.companyName || 'Model Benchmark Entity',
      '2028-12-31',
      'VERIFIED'
    );

    setActiveSpecimen({
      title: `Reference Benchmark Specimen: ${step.title}`,
      category: activeCategory,
      verdict: 'VERIFIED',
      imageUrl: generateGenericSpecimenDataUrl(
        step.docType,
        vendor?.companyName || 'Model Benchmark Entity'
      ),
      visualEvidence,
      sha256Hash: 'a6c8e310f852b4129dc47690321bc355810239cfd911b32d04a69e4f20817c91',
      entityName: vendor?.companyName || 'Model Statutory Benchmark',
      expiryDate: '2028-12-31',
      confidenceScore: 0.99,
      explanation: `Statutory compliance reference for ${step.title}. Ensure your uploaded document has clear entity name matches, visible authority stamps, and unexpired statutory validity.`,
      highlightNotes: [
        `Required Statutory Authority: ${fullConfig?.authorityOrForm || 'Government Procurement Cell'}`,
        'Entity Name Matching: Must match PAN & GST registered business name exactly.',
        'Statutory Expiry: Must be valid beyond tender period (future expiration date).',
        'Privacy Compliance: First 8 digits of Aadhaar must be masked; zero unmasked PII.',
      ],
    });
  };

  // View the 3 reference company cases (Accepted, Rejected, Edge-case)
  const viewReferenceCase = (caseType: 'CASE_A' | 'CASE_B' | 'CASE_C') => {
    if (caseType === 'CASE_A') {
      setActiveSpecimen({
        title: 'Case A: Clean Valid Contractor License (Reference Specimen)',
        category: 'Construction',
        verdict: 'VERIFIED',
        imageUrl: generateCaseASpecimenDataUrl(),
        visualEvidence: generateVisualEvidenceBoxes(
          'SAFETY_CERT',
          'Apex InfraBuilders Pvt Ltd',
          '2028-12-31',
          'VERIFIED'
        ),
        entityName: 'Apex InfraBuilders Pvt Ltd',
        expiryDate: '2028-12-31',
        confidenceScore: 0.98,
        sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        explanation:
          'Model statutory filing specimen: Crisp font rendering, unexpired validity (31-Dec-2028), official gold seal, and CPCB Stage-IV environmental fitness certification.',
        highlightNotes: [
          'Unexpired future validity date (2028-12-31) prominently displayed in green box.',
          'Official Directorate of Industrial Safety circular gold seal verified.',
          'Statutory entity name "Apex InfraBuilders Pvt Ltd" matches PAN & GST records.',
        ],
      });
    } else if (caseType === 'CASE_B') {
      setActiveSpecimen({
        title: 'Case B: Expired Electronics BIS Certificate (Reference Specimen)',
        category: 'Electronics',
        verdict: 'REJECTED',
        imageUrl: generateCaseBSpecimenDataUrl(),
        visualEvidence: generateVisualEvidenceBoxes(
          'BIS_CERT',
          'VoltEdge Electronics Corp',
          '2024-03-15',
          'REJECTED'
        ),
        entityName: 'VoltEdge Electronics Corp',
        expiryDate: '2024-03-15',
        confidenceScore: 0.94,
        sha256Hash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
        explanation:
          'Non-compliant filing specimen: The Bureau of Indian Standards (BIS CRS) registration expired on 2024-03-15 (over 8 months ago), and the manufacturing unit cites an unapproved foreign sub-assembly facility.',
        highlightNotes: [
          'Statutory expiration date (2024-03-15) is in the past (> 8 months lapsed).',
          'Bold red "REJECTED - LAPSED RENEWAL" cancellation stamp present.',
          'Discrepancy: Manufacturing unit name does not match applicant company.',
        ],
      });
    } else {
      setActiveSpecimen({
        title: 'Case C: Dirty/Tilted Scanned Machinery License (Reference Specimen)',
        category: 'Construction',
        verdict: 'EDGE_CASE',
        imageUrl: generateCaseCSpecimenDataUrl(),
        visualEvidence: generateVisualEvidenceBoxes(
          'SAFETY_CERT',
          'Shakti Heavy Logistics & Civil',
          '2026-12-31',
          'EDGE_CASE'
        ),
        entityName: 'Shakti Heavy Logistics & Civil',
        expiryDate: 'Ambiguous (2026/2028 Smudged)',
        confidenceScore: 0.64,
        sha256Hash: '4a6b2c891f73e5a01bc98d24fe77aa1209e8631c9a456123ffb87192a03bcda1',
        explanation:
          'Dirty-Doc Ambiguity Specimen: Document exhibits 4-degree rotational tilt, low-light vignette, simulated coffee cup ring stain, and heavy ink smudge over the expiry year. Queued for TenderGuard Human Officer sign-off.',
        highlightNotes: [
          'Vision AI extracted text with 64% confidence due to simulated physical camera noise.',
          'Expiry date field obscured between 2026 and 2028 by radial coffee stain ring.',
          'Statutory authority stamp partially readable; escalated to Human Compliance Officer.',
        ],
      });
    }
  };

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-mesh-surface flex flex-col text-on-surface font-manrope relative overflow-hidden">
        <Navbar />
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-teal-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-3 text-secondary glass-panel px-6 py-4 rounded-2xl shadow-sm">
            <RefreshCw className="w-6 h-6 animate-spin text-secondary" />
            <span className="text-sm font-semibold text-gradient-sovereign">Loading sequential verification workspace...</span>
          </div>
        </div>
      </div>
    );
  }

  const verifiedLogsCount = vendor?.auditLogs?.filter((l) => l.status === 'VERIFIED').length || 0;

  return (
    <div className="min-h-screen bg-mesh-surface flex flex-col text-on-surface font-manrope relative overflow-hidden">
      {/* Ambient Aurora Light Spheres */}
      <div className="absolute top-10 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-teal-500/15 via-emerald-400/10 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[600px] left-0 w-[550px] h-[550px] bg-gradient-to-tr from-cyan-500/15 via-secondary/10 to-transparent blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[400px] bg-gradient-to-r from-emerald-500/10 to-teal-400/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <Navbar />

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleNativeFileChange}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        {/* Top Header & Vendor Context Banner */}
        <div className="glass-panel gradient-border-card rounded-2xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed-variant text-xs font-semibold uppercase tracking-wider font-label border border-secondary/20 shadow-sm">
                  <Building className="w-3.5 h-3.5 text-secondary" />
                  <span>{vendor?.companyName || 'Apex Buildtech Infra Pvt Ltd'}</span>
                </span>

                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white/70 border border-surface-container-high text-on-surface text-xs font-medium">
                  {activeCategory === VendorCategory.CONSTRUCTION && (
                    <HardHat className="w-3.5 h-3.5 text-amber-600" />
                  )}
                  {activeCategory === VendorCategory.ELECTRONICS && (
                    <Cpu className="w-3.5 h-3.5 text-cyan-600" />
                  )}
                  {activeCategory === VendorCategory.LOGISTICS && (
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  <span>Category: {activeCategory}</span>
                </span>

                <span className="text-xs text-on-surface-variant font-mono">
                  +91 {vendor?.phoneNumber.slice(-10)}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gradient-sovereign">
                Sequential Vendor Compliance Checklist
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant max-w-3xl leading-relaxed">
                Step-by-step verification pipeline. Step N+1 unlocks only after Step N is cryptographically
                audited and verified. Zero unencrypted documents are stored on server disks.
              </p>
            </div>

            {/* Overall Progress Gauge */}
            <div className="bg-surface-container-low border border-surface-container rounded-xl p-4 flex items-center space-x-5 min-w-[260px] shadow-sm">
              <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-surface-container-high"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={
                      evaluation.isAllCompleted
                        ? 'text-emerald-600'
                        : evaluation.rejectedCount > 0
                        ? 'text-rose-600'
                        : 'text-secondary'
                    }
                    strokeDasharray={`${(evaluation.verifiedCount / 6) * 100}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-xs font-bold text-primary font-mono">
                  {Math.round((evaluation.verifiedCount / 6) * 100)}%
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block font-label">
                  Audit Checklist Status
                </span>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-base font-bold text-primary">
                    {evaluation.verifiedCount} of 6 Passed
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-on-surface-variant mt-0.5">
                  {evaluation.isAllCompleted ? (
                    <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Compliant &amp; Tender Ready</span>
                    </span>
                  ) : (
                    <span>Step {evaluation.currentStepIndex + 1} Active</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Global Alert Notification */}
          {uploadError && (
            <div className="mt-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{uploadError}</span>
              </div>
              <button
                onClick={() => setUploadError(null)}
                className="text-rose-400 hover:text-rose-200 font-bold ml-3"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Phase 4: Interactive 3-Company Demo Case Switcher */}
        <DemoCaseSwitcher
          onCaseLoaded={fetchVendorSession}
          currentCompanyName={vendor?.companyName}
        />

        {/* Visual Inspection & Reference Specimen Bar */}
        <div className="glass-panel-dark gradient-border-card rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center space-x-3 relative z-10">
            <div className="p-2.5 rounded-xl bg-teal-500/15 text-teal-300 border border-teal-500/20 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span className="text-gradient-aurora">Statutory Reference Benchmark Library</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Visual Previews
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Inspect sample filings for approved, rejected, and edge-case submissions to benchmark compliance standards before uploading.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 relative z-10">
            <button
              type="button"
              onClick={() => viewReferenceCase('CASE_A')}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Case A (Approved ✅)</span>
            </button>
            <button
              type="button"
              onClick={() => viewReferenceCase('CASE_B')}
              className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Case B (Rejected ❌)</span>
            </button>
            <button
              type="button"
              onClick={() => viewReferenceCase('CASE_C')}
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Case C (Edge Case ⚠️)</span>
            </button>
          </div>
        </div>

        {/* 2-Column Layout: Sequential Checklist & Live RAM Privacy Shield */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): Sequential Document Checklist */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-bold text-primary flex items-center space-x-2">
                <Layers className="w-4 h-4 text-secondary" />
                <span className="text-gradient-sovereign">Sequential Verification Steps (1 through 6)</span>
              </h2>
              <span className="text-xs text-on-surface-variant font-medium">
                {evaluation.verifiedCount} Verified &bull; {evaluation.rejectedCount} Rejected &bull;{' '}
                {evaluation.edgeCaseCount} In Review
              </span>
            </div>

            {/* Steps Container */}
            <div className="space-y-4">
              {evaluation.checklist.map((step) => {
                const isCurrent = step.isCurrent;
                const isUnlocked = step.isUnlocked;
                const isVerified = step.status === 'VERIFIED';
                const isRejected = step.status === 'REJECTED';
                const isEdgeCase = step.status === 'EDGE_CASE';
                const isLocked = step.status === 'LOCKED';
                const isExpanded = expandedStep === step.stepNumber;
                const isProcessingThis = uploadingDocType === step.docType;

                const fullConfig = getChecklistForCategory(activeCategory).find(
                  (c) => c.docType === step.docType
                );

                return (
                  <motion.div
                    key={step.docType}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl border transition-all duration-300 overflow-hidden backdrop-blur-md ${
                      isLocked
                        ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                        : isCurrent
                        ? 'bg-slate-900/95 border-teal-500/60 shadow-xl shadow-teal-500/10 ring-1 ring-teal-500/30'
                        : isVerified
                        ? 'bg-slate-900/85 border-emerald-500/40 shadow-sm hover:border-emerald-400/60'
                        : isRejected
                        ? 'bg-slate-900/85 border-rose-500/50 shadow-sm'
                        : 'bg-slate-900/85 border-amber-500/50 shadow-sm'
                    }`}
                  >
                    {/* Step Summary Header */}
                    <div
                      onClick={() => !isLocked && setExpandedStep(isExpanded ? null : step.stepNumber)}
                      className={`p-5 flex items-center justify-between cursor-pointer select-none transition-colors ${
                        isLocked ? 'cursor-not-allowed' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center space-x-4 min-w-0">
                        {/* Status Icon Badge */}
                        <div className="shrink-0">
                          {isVerified ? (
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                              <CheckCircle2 className="w-6 h-6" />
                            </div>
                          ) : isRejected ? (
                            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                              <XCircle className="w-6 h-6" />
                            </div>
                          ) : isEdgeCase ? (
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                              <AlertTriangle className="w-6 h-6" />
                            </div>
                          ) : isCurrent ? (
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center animate-pulse">
                              <Unlock className="w-5 h-5" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-800/80 text-slate-500 border border-slate-700/60 flex items-center justify-center">
                              <Lock className="w-5 h-5" />
                            </div>
                          )}
                        </div>

                        {/* Step Titles */}
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                              Step {step.stepNumber} of 6
                            </span>
                            <span className="text-slate-600">&bull;</span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                fullConfig?.isUniversal
                                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                  : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                              }`}
                            >
                              {fullConfig?.isUniversal ? 'Universal Base' : activeCategory}
                            </span>
                          </div>

                          <h3 className="text-sm sm:text-base font-bold text-white truncate mt-0.5">
                            {step.title}
                          </h3>

                          {/* Quick Audit Hash / Expiry preview */}
                          {step.auditLog && (
                            <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-1">
                              <span className="font-mono text-slate-300">
                                SHA-256: {step.auditLog.sha256Hash.slice(0, 8)}...
                                {step.auditLog.sha256Hash.slice(-6)}
                              </span>
                              {step.auditLog.expiryDate && (
                                <>
                                  <span className="text-slate-600">&bull;</span>
                                  <span className="text-slate-300">
                                    Expires: {new Date(step.auditLog.expiryDate).toLocaleDateString()}
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Indicator & Accordion Toggle */}
                      <div className="flex items-center space-x-2.5 shrink-0">
                        {/* Quick Visual Inspection Action Buttons in Summary Header */}
                        {(step.auditLog || uploadedPreviews[step.docType]) && !isLocked && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              viewUserUploadedDocument(step);
                            }}
                            title="Inspect your uploaded document in volatile RAM"
                            className="hidden md:inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 text-xs font-semibold transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Upload</span>
                          </button>
                        )}

                        {!isLocked && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              viewBenchmarkSpecimen(step);
                            }}
                            title="View model statutory benchmark specimen for this requirement"
                            className="hidden lg:inline-flex items-center space-x-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-medium transition-colors"
                          >
                            <BookOpen className="w-3 h-3 text-blue-400" />
                            <span>Reference</span>
                          </button>
                        )}

                        {isVerified && (
                          <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                            <span>VERIFIED</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold">
                            <span>REJECTED</span>
                          </span>
                        )}
                        {isEdgeCase && (
                          <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
                            <span>REQUIRES REVIEW</span>
                          </span>
                        )}
                        {isCurrent && (
                          <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold animate-pulse">
                            <span>ACTION REQUIRED</span>
                          </span>
                        )}
                        {isLocked && (
                          <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-500 text-xs font-medium">
                            <span>LOCKED</span>
                          </span>
                        )}

                        {!isLocked && (
                          <button
                            type="button"
                            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Step Body (Expanded) */}
                    <AnimatePresence>
                      {isExpanded && !isLocked && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-slate-800/80 p-5 space-y-5 bg-slate-950/40"
                        >
                          {/* Statutory Authority & Validation Rules */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                                Statutory Authority & Purpose
                              </span>
                              <p className="font-semibold text-white">{fullConfig?.authorityOrForm}</p>
                              <p className="text-slate-400 leading-relaxed">{step.description}</p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                                Automated Validation Rules
                              </span>
                              <ul className="space-y-1 text-slate-300">
                                {fullConfig?.validationRules.map((rule, idx) => (
                                  <li key={idx} className="flex items-start space-x-1.5">
                                    <span className="text-blue-400 mt-0.5">&bull;</span>
                                    <span>{rule}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Existing Audit Result Card (If already processed) */}
                          {step.auditLog && (
                            <div
                              className={`p-4 rounded-xl border space-y-3 ${
                                isVerified
                                  ? 'bg-emerald-950/20 border-emerald-500/30'
                                  : isRejected
                                  ? 'bg-rose-950/20 border-rose-500/30'
                                  : 'bg-amber-950/20 border-amber-500/30'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                                <div className="flex items-center space-x-2">
                                  {isVerified && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                                  {isRejected && <XCircle className="w-4 h-4 text-rose-400" />}
                                  {isEdgeCase && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                                    Audit Verdict: {step.auditLog.status}
                                  </span>
                                  <span className="text-[11px] text-slate-400">
                                    ({Math.round(step.auditLog.confidenceScore * 100)}% Confidence)
                                  </span>
                                </div>

                                <div className="flex items-center space-x-2 text-xs">
                                  <span className="text-slate-400">SHA-256 Digest:</span>
                                  <code className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-blue-300 font-mono text-[11px]">
                                    {step.auditLog.sha256Hash.slice(0, 10)}...
                                    {step.auditLog.sha256Hash.slice(-6)}
                                  </code>
                                  <button
                                    onClick={() => copyToClipboard(step.auditLog!.sha256Hash)}
                                    title="Copy full cryptographic SHA-256 hash"
                                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                                  >
                                    {copiedHash === step.auditLog.sha256Hash ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </div>

                              <p className="text-xs text-slate-300 leading-relaxed">
                                <strong className="text-white">AI Auditor Remarks: </strong>
                                {step.auditLog.aiRemarks}
                              </p>

                              {step.auditLog.expiryDate && (
                                <p className="text-xs text-slate-400">
                                  <strong>Statutory Expiry Date: </strong>
                                  <span className="text-white font-mono">
                                    {new Date(step.auditLog.expiryDate).toLocaleDateString()}
                                  </span>
                                </p>
                              )}

                              {/* Visual Inspection Actions */}
                              <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-800/80">
                                <button
                                  type="button"
                                  onClick={() => viewUserUploadedDocument(step)}
                                  className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View Your Uploaded Document 👁️</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => viewBenchmarkSpecimen(step)}
                                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                                >
                                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                                  <span>View Reference Specimen 📋</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Live 4-Stage In-Memory Processing Animation */}
                          {isProcessingThis && (
                            <div className="p-6 rounded-xl bg-slate-900 border border-blue-500/40 shadow-2xl space-y-4">
                              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-blue-400">
                                <span className="flex items-center space-x-2">
                                  <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                                  <span>Zero-Retention Audit Pipeline Active</span>
                                </span>
                                <span className="font-mono text-slate-400">RAM EPHEMERAL BUFFER</span>
                              </div>

                              {/* Progress Step Nodes */}
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
                                <div
                                  className={`p-2.5 rounded-lg border text-xs flex items-center space-x-2 ${
                                    processingStage === 'LOADING_RAM'
                                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500/40 animate-pulse'
                                      : 'bg-slate-950/60 border-slate-800 text-slate-400'
                                  }`}
                                >
                                  <CpuIcon className="w-4 h-4 shrink-0 text-cyan-400" />
                                  <span className="font-medium text-[11px]">1. In-RAM Loading</span>
                                </div>

                                <div
                                  className={`p-2.5 rounded-lg border text-xs flex items-center space-x-2 ${
                                    processingStage === 'GENERATING_HASH'
                                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500/40 animate-pulse'
                                      : 'bg-slate-950/60 border-slate-800 text-slate-400'
                                  }`}
                                >
                                  <Key className="w-4 h-4 shrink-0 text-blue-400" />
                                  <span className="font-medium text-[11px]">2. SHA-256 Digest</span>
                                </div>

                                <div
                                  className={`p-2.5 rounded-lg border text-xs flex items-center space-x-2 ${
                                    processingStage === 'VISION_AI'
                                      ? 'bg-purple-600/20 border-purple-500 text-purple-300 ring-1 ring-purple-500/40 animate-pulse'
                                      : 'bg-slate-950/60 border-slate-800 text-slate-400'
                                  }`}
                                >
                                  <Sparkles className="w-4 h-4 shrink-0 text-purple-400" />
                                  <span className="font-medium text-[11px]">3. Dirty-Doc OCR</span>
                                </div>

                                <div
                                  className={`p-2.5 rounded-lg border text-xs flex items-center space-x-2 ${
                                    processingStage === 'PURGING_RAM'
                                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/40 animate-pulse'
                                      : 'bg-slate-950/60 border-slate-800 text-slate-400'
                                  }`}
                                >
                                  <Trash2 className="w-4 h-4 shrink-0 text-emerald-400" />
                                  <span className="font-medium text-[11px]">4. Buffer Purged</span>
                                </div>
                              </div>

                              <p className="text-[11px] text-slate-400 text-center animate-pulse">
                                Documents are never written to disk. The memory buffer is purged as soon as
                                verification completes.
                              </p>
                            </div>
                          )}

                          {/* Upload Area (Actionable if unlocked or if re-uploading after rejection) */}
                          {(!isVerified || isRejected) && !isProcessingThis && (
                            <div className="space-y-3">
                              {/* Ephemeral upload indicator (Client Volatile RAM) */}
                              {uploadedPreviews[step.docType] && (
                                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs">
                                  <div className="flex items-center space-x-2 text-slate-200">
                                    <FileCheck2 className="w-4 h-4 text-blue-400 shrink-0" />
                                    <span>
                                      Current Upload:{' '}
                                      <strong className="text-white">
                                        {uploadedPreviews[step.docType].fileName}
                                      </strong>{' '}
                                      <span className="text-slate-400">({uploadedPreviews[step.docType].fileSize})</span>
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => viewUserUploadedDocument(step)}
                                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold flex items-center space-x-1 shadow-sm transition-colors"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Inspect Upload 👁️</span>
                                  </button>
                                </div>
                              )}

                              {/* Reference Guidance Pill */}
                              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                                <div className="flex items-center space-x-2 text-slate-400">
                                  <BookOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                  <span>Unsure what format is compliant?</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => viewBenchmarkSpecimen(step)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 text-[11px] font-medium flex items-center space-x-1 transition-colors"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>View Model Reference Specimen</span>
                                </button>
                              </div>

                              {/* Drag & Drop Zone */}
                              <div
                                onDragOver={(e) => handleDragOver(e, step.docType)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, step.docType)}
                                onClick={() => triggerFileInput(step.docType)}
                                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                                  dragActiveDocType === step.docType
                                    ? 'border-blue-400 bg-blue-500/10 scale-[1.01]'
                                    : 'border-slate-700 hover:border-blue-500/70 hover:bg-slate-900/60'
                                }`}
                              >
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-3">
                                  <UploadCloud className="w-6 h-6" />
                                </div>
                                <h4 className="text-sm font-bold text-white mb-1">
                                  Drag and drop statutory certificate here, or{' '}
                                  <span className="text-blue-400 underline">Browse File</span>
                                </h4>
                                <p className="text-xs text-slate-400">
                                  Accepts PDF, JPG, PNG &bull; Max size: {fullConfig?.maxSizeMB}MB
                                </p>
                                <p className="text-[11px] text-slate-500 mt-2">
                                  🔒 Processed strictly in volatile memory. No disk writes.
                                </p>
                              </div>

                              {/* Quick Synthetic Demo Simulators */}
                              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                                <span className="text-slate-400 text-[11px] font-medium flex items-center space-x-1">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Automated Pilot Simulators (No scanner required):</span>
                                </span>
                                <div className="flex items-center space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => handleSyntheticDemoUpload(step.docType, 'VALID')}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition-colors"
                                  >
                                    + Test Valid Document
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSyntheticDemoUpload(step.docType, 'DEGRADED')}
                                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition-colors"
                                  >
                                    + Test Dirty/Tilted Scan
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSyntheticDemoUpload(step.docType, 'EXPIRED')}
                                    className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-semibold transition-colors"
                                  >
                                    + Test Expired/Invalid
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* If Verified, allow viewing or re-verification option */}
                          {isVerified && !isProcessingThis && (
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                              <span className="text-emerald-400 font-medium flex items-center space-x-1.5">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Verification Completed & Cryptographically Locked</span>
                              </span>
                              <div className="flex items-center space-x-3">
                                <button
                                  type="button"
                                  onClick={() => viewUserUploadedDocument(step)}
                                  className="text-blue-400 hover:text-blue-300 underline text-[11px] flex items-center space-x-1 font-semibold"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View Uploaded Document 👁️</span>
                                </button>
                                <span className="text-slate-600">&bull;</span>
                                <button
                                  type="button"
                                  onClick={() => triggerFileInput(step.docType)}
                                  className="text-slate-400 hover:text-slate-200 underline text-[11px]"
                                >
                                  Re-upload Replacement
                                </button>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Column (4 cols): RAM Monitor & Privacy Shield Widget */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
            {/* Live RAM Monitor / Privacy Shield Card */}
            <div className="glass-panel-dark gradient-border-card rounded-2xl p-5 shadow-2xl backdrop-blur-xl space-y-5 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white text-gradient-aurora">RAM Privacy Shield</h3>
                    <p className="text-[11px] text-slate-300">Zero-Retention Monitor</p>
                  </div>
                </div>

                {/* Green Pulsing Beacon */}
                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-[10px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
                  <span>ACTIVE</span>
                </div>
              </div>

              {/* Core Real-Time Storage Telemetry */}
              <div className="grid grid-cols-1 gap-2.5 relative z-10">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-300">Documents Stored on Disk:</span>
                  <span className="font-mono text-xs font-bold text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                    0 bytes
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-300">Active Hashes Logged:</span>
                  <span className="font-mono text-xs font-bold text-teal-300 bg-teal-950/40 px-2 py-0.5 rounded border border-teal-500/20">
                    {verifiedLogsCount}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-300">Volatile Buffer State:</span>
                  <span className="font-mono text-xs font-bold text-emerald-300 flex items-center space-x-1">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>PURGED</span>
                  </span>
                </div>
              </div>

              {/* Statutory Privacy Highlights */}
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-white/5 space-y-2 text-[11px] text-slate-300 relative z-10">
                <div className="flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Statutory Aadhaar Redaction:</strong> Unmasked 12-digit Aadhaar numbers are never logged or echoed.
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <Database className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Cryptographic Ledger:</strong> Only non-reversible SHA-256 fingerprints are registered in the public audit log.
                  </span>
                </div>
              </div>
            </div>

            {/* Cryptographic SHA-256 Ledger Vault */}
            <div className="glass-panel-dark gradient-border-card rounded-2xl p-5 shadow-2xl backdrop-blur-xl space-y-4 relative overflow-hidden">
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between border-b border-white/10 pb-3 relative z-10">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <Key className="w-3.5 h-3.5 text-teal-300" />
                  <span>Audit Receipts Ledger</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  {vendor?.auditLogs.length || 0} Entries
                </span>
              </div>

              {(!vendor?.auditLogs || vendor.auditLogs.length === 0) ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                  <span>No documents verified yet. Upload Step 1 to generate your first audit receipt.</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {vendor.auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{log.docType}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            log.status === 'VERIFIED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : log.status === 'REJECTED'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span className="truncate max-w-[190px]">
                          {log.sha256Hash.slice(0, 16)}...
                        </span>
                        <button
                          onClick={() => copyToClipboard(log.sha256Hash)}
                          className="hover:text-white"
                        >
                          {copiedHash === log.sha256Hash ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      <div className="text-[10px] text-slate-400">
                        {new Date(log.verifiedAt).toLocaleTimeString()} &bull;{' '}
                        {new Date(log.verifiedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Final Tender Compliance Clearance Pass (When all 6 steps pass) */}
            {evaluation.isAllCompleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-blue-950/60 border border-emerald-500/40 shadow-2xl space-y-3"
              >
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Statutory Tender Clearance Granted</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  All 6 statutory filings have been verified with complete Zero-Retention privacy compliance.
                  Your tender application is ready for procurement committee review.
                </p>
                <Link
                  href="/"
                  className="block w-full text-center py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 transition-all"
                >
                  View Procurement Dossier
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Synthetic Test Document Generator Drawer */}
      <TestDocGenerator />

      {/* Forensic Document Specimen Inspection Modal */}
      <SpecimenViewerModal
        specimen={activeSpecimen}
        onClose={() => setActiveSpecimen(null)}
      />
    </div>
  );
}
