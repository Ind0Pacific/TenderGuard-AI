import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { evaluateSequentialProgress } from '@/lib/checklists';
import { ApplicationStatus, AuditStatus, VendorCategory, DocumentAuditLogItem } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vendorId, auditLogId, action, officerName, officerRemarks } = body;

    if (!vendorId || !auditLogId || !action) {
      return NextResponse.json(
        { error: 'vendorId, auditLogId, and action parameters are required' },
        { status: 400 }
      );
    }

    const officer = officerName?.trim() || 'Chief Procurement Officer';
    const cleanRemarks = officerRemarks?.trim() || 'Officer manual statutory review performed.';
    const timestamp = new Date().toISOString();

    const existingLog = await prisma.documentAuditLog.findUnique({
      where: { id: auditLogId },
    });

    if (!existingLog) {
      return NextResponse.json({ error: 'Audit log record not found' }, { status: 404 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: { auditLogs: true },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor record not found' }, { status: 404 });
    }

    let updatedLogStatus = existingLog.status;
    let appendedRemarks = existingLog.aiRemarks;

    if (action === 'OVERRIDE_APPROVE') {
      updatedLogStatus = AuditStatus.VERIFIED;
      appendedRemarks = `[OFFICER OVERRIDE - APPROVED by ${officer} at ${timestamp}]: ${cleanRemarks} (Previous Status: ${existingLog.status}). Entity verification cleared manually.`;
    } else if (action === 'CONFIRM_REJECT') {
      updatedLogStatus = AuditStatus.REJECTED;
      appendedRemarks = `[OFFICER OVERRIDE - REJECTED by ${officer} at ${timestamp}]: ${cleanRemarks} (Previous Status: ${existingLog.status}). Statutory document non-compliance affirmed.`;
    } else if (action === 'REQUEST_VIDEO_KYC') {
      appendedRemarks = `[ACTION REQUIRED - LIVE VIDEO KYC REQUESTED by ${officer} at ${timestamp}]: High-ambiguity scan flagged. Vendor instructed to present original physical certificate via scheduled portal video KYC.`;
    } else {
      return NextResponse.json(
        { error: `Invalid action "${action}". Expected OVERRIDE_APPROVE, CONFIRM_REJECT, or REQUEST_VIDEO_KYC.` },
        { status: 400 }
      );
    }

    // Update document audit log
    const updatedAuditLog = await prisma.documentAuditLog.update({
      where: { id: auditLogId },
      data: {
        status: updatedLogStatus,
        aiRemarks: appendedRemarks,
      },
    });

    // Re-evaluate Vendor's overall status
    const allAuditLogs = await prisma.documentAuditLog.findMany({
      where: { vendorId },
    });

    const formattedLogs: DocumentAuditLogItem[] = allAuditLogs.map((l) => ({
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

    const progress = evaluateSequentialProgress(vendor.category as VendorCategory, formattedLogs);

    let newAppStatus = vendor.applicationStatus;
    if (progress.isAllCompleted) {
      newAppStatus = ApplicationStatus.APPROVED;
    } else if (action === 'CONFIRM_REJECT') {
      newAppStatus = ApplicationStatus.REJECTED;
    } else if (progress.edgeCaseCount === 0 && !progress.rejectedCount) {
      newAppStatus = ApplicationStatus.PENDING;
    }

    const updatedVendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: { applicationStatus: newAppStatus },
    });

    return NextResponse.json({
      success: true,
      action,
      auditLogId,
      newLogStatus: updatedAuditLog.status,
      vendorStatus: updatedVendor.applicationStatus,
      message: `Human Review Action "${action}" recorded successfully by ${officer}.`,
      updatedLog: {
        id: updatedAuditLog.id,
        status: updatedAuditLog.status,
        aiRemarks: updatedAuditLog.aiRemarks,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/admin/override:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process officer review action' },
      { status: 500 }
    );
  }
}
