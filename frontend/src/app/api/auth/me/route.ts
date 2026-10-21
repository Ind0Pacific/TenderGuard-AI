import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, vendor: null }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: session.vendorId },
      include: {
        auditLogs: {
          orderBy: { verifiedAt: 'desc' },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json({ authenticated: false, vendor: null }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      vendor: {
        id: vendor.id,
        phoneNumber: vendor.phoneNumber,
        companyName: vendor.companyName,
        category: vendor.category,
        applicationStatus: vendor.applicationStatus,
        createdAt: vendor.createdAt.toISOString(),
        needsOnboarding: !vendor.companyName || !vendor.category,
        auditLogs: vendor.auditLogs.map((log) => ({
          id: log.id,
          docType: log.docType,
          sha256Hash: log.sha256Hash,
          status: log.status,
          expiryDate: log.expiryDate?.toISOString() || null,
          confidenceScore: log.confidenceScore,
          aiRemarks: log.aiRemarks,
          verifiedAt: log.verifiedAt.toISOString(),
        })),
      },
    });
  } catch (error: any) {
    console.error('Error in auth/me route:', error);
    return NextResponse.json({ error: 'Failed to retrieve session' }, { status: 500 });
  }
}
