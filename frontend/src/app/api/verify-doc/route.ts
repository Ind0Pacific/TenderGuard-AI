import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { verifyDocumentWithAI } from '@/lib/aiVerifier';
import { evaluateSequentialProgress, getChecklistForCategory } from '@/lib/checklists';
import { VendorCategory, ApplicationStatus, AuditStatus, DocumentAuditLogItem } from '@/lib/types';

export async function POST(req: NextRequest) {
  // Ephemeral reference holders for explicit RAM cleanup
  let fileBuffer: Buffer | null = null;

  try {
    // 1. Authenticate vendor session
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Vendor session missing or expired. Please login.' },
        { status: 401 }
      );
    }

    // 2. Parse Multipart FormData strictly in RAM (Zero Disk Writes)
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const docType = formData.get('docType') as string | null;
    const testScenario = formData.get('testScenario') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No document file uploaded' }, { status: 400 });
    }

    if (!docType || typeof docType !== 'string') {
      return NextResponse.json({ error: 'Valid docType parameter is required' }, { status: 400 });
    }

    // Read bytes directly into RAM Buffer
    const arrayBuffer = await file.arrayBuffer();
    fileBuffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || 'image/jpeg';
    const fileSize = fileBuffer.length;

    if (fileSize === 0) {
      fileBuffer = null;
      return NextResponse.json({ error: 'Uploaded file buffer is empty' }, { status: 400 });
    }

    // Support document uploads up to 10MB (comfortably covers 5MB high-res scans & multi-page PDFs)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (fileSize > MAX_FILE_SIZE) {
      fileBuffer = null;
      return NextResponse.json(
        {
          error: `File size (${(fileSize / (1024 * 1024)).toFixed(
            2
          )}MB) exceeds the maximum permitted limit of 10MB.`,
        },
        { status: 413 }
      );
    }

    // 3. Immediately compute SHA-256 cryptographic digest in RAM
    const sha256Hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // 4. Fetch Vendor profile and previous audit logs
    const vendor = await prisma.vendor.findUnique({
      where: { id: session.vendorId },
      include: {
        auditLogs: {
          orderBy: { verifiedAt: 'desc' },
        },
      },
    });

    if (!vendor) {
      fileBuffer = null;
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    const companyName = vendor.companyName || 'Registered Vendor';
    const category = (vendor.category as VendorCategory) || VendorCategory.CONSTRUCTION;

    // 5. Fraudulent Cross-Vendor Duplicate Check
    // In production, flag duplicate SHA-256 submissions from different companies as collusion.
    // In development mode, allow vendors to test their documents across sessions without false-positive lockouts.
    const isProduction = process.env.NODE_ENV === 'production';
    const duplicateSubmission = await prisma.documentAuditLog.findFirst({
      where: {
        sha256Hash,
        NOT: {
          vendorId: vendor.id,
        },
      },
      include: {
        vendor: true,
      },
    });

    if (duplicateSubmission && isProduction) {
      // Flag as critical cross-vendor collision fraud in production
      const fraudRemarks = `CRITICAL FRAUD ALERT: Cryptographic SHA-256 collision (${sha256Hash.slice(
        0,
        16
      )}...). This identical document was previously submitted by entity "${
        duplicateSubmission.vendor.companyName || 'Another Vendor'
      }" (Vendor ID: ${duplicateSubmission.vendorId}). Cross-bidder collusion flagged.`;

      const auditLog = await prisma.documentAuditLog.create({
        data: {
          vendorId: vendor.id,
          docType,
          sha256Hash,
          status: AuditStatus.REJECTED,
          confidenceScore: 1.0,
          aiRemarks: fraudRemarks,
          verifiedAt: new Date(),
        },
      });

      // Update vendor status to REJECTED
      await prisma.vendor.update({
        where: { id: vendor.id },
        data: { applicationStatus: ApplicationStatus.REJECTED },
      });

      // Explicitly purge RAM Buffer
      fileBuffer = null;

      return NextResponse.json({
        success: false,
        verdict: 'REJECTED',
        isFraudDuplicate: true,
        reason: fraudRemarks,
        sha256Hash,
        auditLogId: auditLog.id,
        confidenceScore: 100,
        imageQualityScore: 0,
        zeroRetentionPurged: true,
      });
    } else if (duplicateSubmission) {
      console.log(
        `[Dev Notice] SHA-256 hash (${sha256Hash.slice(
          0,
          12
        )}...) matches test document previously uploaded under "${
          duplicateSubmission.vendor.companyName
        }". Re-verification permitted in development mode.`
      );
    }

    // 6. Sequential Gating Verification
    // Ensure vendor is uploading the currently unlocked step
    const formattedAuditLogs: DocumentAuditLogItem[] = vendor.auditLogs.map((l) => ({
      id: l.id,
      vendorId: l.vendorId,
      docType: l.docType,
      sha256Hash: l.sha256Hash,
      status: l.status,
      expiryDate: l.expiryDate?.toISOString() || null,
      confidenceScore: l.confidenceScore,
      aiRemarks: l.aiRemarks,
      verifiedAt: l.verifiedAt.toISOString(),
    }));

    const progressBefore = evaluateSequentialProgress(category, formattedAuditLogs);
    const expectedCurrentDoc = progressBefore.currentDocument;

    // Check if vendor is skipping steps
    if (expectedCurrentDoc && expectedCurrentDoc.docType !== docType) {
      // Verify if they are re-uploading an already passed doc or jumping ahead
      const isJumpingAhead = progressBefore.checklist.some(
        (step) => step.docType === docType && !step.isUnlocked
      );

      if (isJumpingAhead) {
        fileBuffer = null;
        return NextResponse.json(
          {
            error: `Sequential verification rule violation: Document "${docType}" is locked. You must complete Step "${expectedCurrentDoc.title}" first.`,
          },
          { status: 403 }
        );
      }
    }

    // 7. Invoke Gemini 2.5 Flash Vision AI (In-Memory Base64 OCR)
    const aiResult = await verifyDocumentWithAI({
      buffer: fileBuffer,
      mimeType,
      docType,
      vendorCompanyName: companyName,
      testScenario,
    });

    // 8. Immediately purge RAM buffer (Rule #1 Zero Retention)
    fileBuffer = null;

    // 9. Persist Cryptographic Audit Log in Database
    const auditStatus =
      aiResult.verdict === 'VERIFIED'
        ? AuditStatus.VERIFIED
        : aiResult.verdict === 'EDGE_CASE'
        ? AuditStatus.EDGE_CASE
        : AuditStatus.REJECTED;

    const auditLog = await prisma.documentAuditLog.create({
      data: {
        vendorId: vendor.id,
        docType,
        sha256Hash,
        status: auditStatus,
        expiryDate: aiResult.expiryDate ? new Date(aiResult.expiryDate) : null,
        confidenceScore: aiResult.confidenceScore / 100,
        aiRemarks: aiResult.reason,
        verifiedAt: new Date(),
      },
    });

    // 10. Re-evaluate overall application progress
    const updatedAuditLogs = [
      ...formattedAuditLogs,
      {
        id: auditLog.id,
        vendorId: auditLog.vendorId,
        docType: auditLog.docType,
        sha256Hash: auditLog.sha256Hash,
        status: auditLog.status,
        expiryDate: auditLog.expiryDate?.toISOString() || null,
        confidenceScore: auditLog.confidenceScore,
        aiRemarks: auditLog.aiRemarks,
        verifiedAt: auditLog.verifiedAt.toISOString(),
      },
    ];

    const progressAfter = evaluateSequentialProgress(category, updatedAuditLogs);

    // Update Vendor application status based on progress
    let newAppStatus = vendor.applicationStatus;
    if (progressAfter.isAllCompleted) {
      newAppStatus = ApplicationStatus.APPROVED;
    } else if (auditStatus === AuditStatus.REJECTED) {
      newAppStatus = ApplicationStatus.REJECTED;
    } else if (auditStatus === AuditStatus.EDGE_CASE) {
      newAppStatus = ApplicationStatus.EDGE_CASE_HUMAN_REVIEW;
    }

    if (newAppStatus !== vendor.applicationStatus) {
      await prisma.vendor.update({
        where: { id: vendor.id },
        data: { applicationStatus: newAppStatus },
      });
    }

    return NextResponse.json({
      success: true,
      verdict: aiResult.verdict,
      reason: aiResult.reason,
      docType,
      sha256Hash,
      expiryDate: aiResult.expiryDate,
      imageQualityScore: aiResult.imageQualityScore,
      confidenceScore: aiResult.confidenceScore,
      visualEvidence: aiResult.visualEvidence || [],
      auditLogId: auditLog.id,
      verifiedAt: auditLog.verifiedAt.toISOString(),
      isChecklistCompleted: progressAfter.isAllCompleted,
      nextDocumentToVerify: progressAfter.currentDocument?.docType || null,
      nextDocumentTitle: progressAfter.currentDocument?.title || null,
      zeroRetentionPurged: true,
    });
  } catch (error: any) {
    // Ensure RAM buffer is purged even if an unhandled exception occurs
    fileBuffer = null;
    console.error('Error in /api/verify-doc route:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error during document verification' },
      { status: 500 }
    );
  }
}
