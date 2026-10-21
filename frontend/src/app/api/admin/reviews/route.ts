import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApplicationStatus } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    // Fetch all vendors requiring human review or with edge-case audit logs
    const vendors = await prisma.vendor.findMany({
      where: {
        OR: [
          { applicationStatus: ApplicationStatus.EDGE_CASE_HUMAN_REVIEW },
          {
            auditLogs: {
              some: {
                status: 'EDGE_CASE',
              },
            },
          },
        ],
      },
      include: {
        auditLogs: {
          orderBy: { verifiedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedQueue = vendors.map((v) => {
      const edgeCaseLogs = v.auditLogs.filter((l) => l.status === 'EDGE_CASE');
      return {
        vendorId: v.id,
        phoneNumber: v.phoneNumber,
        companyName: v.companyName || 'Unregistered Entity',
        category: v.category,
        applicationStatus: v.applicationStatus,
        createdAt: v.createdAt.toISOString(),
        totalLogs: v.auditLogs.length,
        edgeCaseLogs: edgeCaseLogs.map((log) => ({
          id: log.id,
          docType: log.docType,
          sha256Hash: log.sha256Hash,
          status: log.status,
          expiryDate: log.expiryDate?.toISOString() || null,
          confidenceScore: log.confidenceScore,
          aiRemarks: log.aiRemarks,
          verifiedAt: log.verifiedAt.toISOString(),
        })),
        allLogs: v.auditLogs.map((l) => ({
          id: l.id,
          docType: l.docType,
          status: l.status,
          confidenceScore: l.confidenceScore,
          sha256Hash: l.sha256Hash,
        })),
      };
    });

    return NextResponse.json({
      success: true,
      count: formattedQueue.length,
      queue: formattedQueue,
    });
  } catch (error: any) {
    console.error('Error in /api/admin/reviews:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve human review escalation queue' },
      { status: 500 }
    );
  }
}
