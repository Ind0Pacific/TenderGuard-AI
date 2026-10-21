import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession, signVendorToken, SESSION_COOKIE_OPTIONS, AUTH_COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { VendorCategory, ApplicationStatus } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Vendor session missing' }, { status: 401 });
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
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      vendor: {
        id: vendor.id,
        phoneNumber: vendor.phoneNumber,
        companyName: vendor.companyName,
        category: vendor.category,
        applicationStatus: vendor.applicationStatus,
        createdAt: vendor.createdAt.toISOString(),
        needsOnboarding: !vendor.companyName || !vendor.category,
        auditLogs: vendor.auditLogs,
      },
    });
  } catch (error: any) {
    console.error('Error fetching vendor profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Please authenticate with your mobile number' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { companyName, category } = body;

    if (!companyName || typeof companyName !== 'string' || companyName.trim().length < 3) {
      return NextResponse.json(
        { error: 'Company Legal Name must be at least 3 characters' },
        { status: 400 }
      );
    }

    const validCategories = Object.values(VendorCategory);
    if (!category || !validCategories.includes(category as VendorCategory)) {
      return NextResponse.json(
        {
          error: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const cleanCompanyName = companyName.trim();
    const cleanCategory = category as VendorCategory;

    // Update vendor record in database
    const updatedVendor = await prisma.vendor.update({
      where: { id: session.vendorId },
      data: {
        companyName: cleanCompanyName,
        category: cleanCategory,
      },
    });

    // Refresh JWT session token with updated company and category
    const updatedSession = {
      vendorId: updatedVendor.id,
      phoneNumber: updatedVendor.phoneNumber,
      companyName: updatedVendor.companyName,
      category: updatedVendor.category as VendorCategory,
      applicationStatus: updatedVendor.applicationStatus as ApplicationStatus,
    };

    const newToken = await signVendorToken(updatedSession);

    const response = NextResponse.json({
      success: true,
      message: 'Vendor profile & category configured successfully',
      vendor: {
        id: updatedVendor.id,
        phoneNumber: updatedVendor.phoneNumber,
        companyName: updatedVendor.companyName,
        category: updatedVendor.category,
        applicationStatus: updatedVendor.applicationStatus,
      },
      redirectTo: '/dashboard',
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: newToken,
      ...SESSION_COOKIE_OPTIONS,
    });

    return response;
  } catch (error: any) {
    console.error('Error updating vendor profile:', error);
    return NextResponse.json(
      { error: 'Failed to update vendor profile and category' },
      { status: 500 }
    );
  }
}
