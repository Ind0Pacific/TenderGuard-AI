import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signVendorToken, SESSION_COOKIE_OPTIONS, AUTH_COOKIE_NAME } from '@/lib/auth';
import { checkTwilioVerifyApi } from '@/lib/twilioClient';
import { VendorCategory, ApplicationStatus } from '@/lib/types';

function normalizeIndianPhoneNumber(input: string): string | null {
  const cleaned = input.replace(/\D/g, '');
  if (cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('91') && /^91[6-9]\d{9}$/.test(cleaned)) {
    return `+${cleaned}`;
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phoneNumber, otp } = body;

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { error: 'Mobile number and 6-digit OTP code are required' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizeIndianPhoneNumber(phoneNumber);
    if (!normalizedPhone) {
      return NextResponse.json(
        { error: 'Invalid mobile number format' },
        { status: 400 }
      );
    }

    const cleanOtp = String(otp).trim();

    // 1. Look up real stored OTP from database
    const storedVerification = await prisma.otpVerification.findUnique({
      where: { phoneNumber: normalizedPhone },
    });

    let isValidOtp = false;

    // Check with Twilio Verify API if configured
    const twilioCheck = await checkTwilioVerifyApi(normalizedPhone, cleanOtp);
    if (twilioCheck.success) {
      isValidOtp = true;
    }

    if (!isValidOtp && storedVerification) {
      const isExpired = new Date() > storedVerification.expiresAt;
      if (isExpired) {
        return NextResponse.json(
          { error: 'OTP has expired (10 minute limit). Please request a new code.' },
          { status: 401 }
        );
      }

      // Check against real generated OTP (or test code 123456)
      if (storedVerification.otpCode === cleanOtp || cleanOtp === '123456') {
        isValidOtp = true;
        // Purge used OTP to prevent replay
        await prisma.otpVerification.delete({
          where: { phoneNumber: normalizedPhone },
        }).catch(() => {});
      } else {
        // Track failed attempt
        await prisma.otpVerification.update({
          where: { phoneNumber: normalizedPhone },
          data: { attempts: { increment: 1 } },
        }).catch(() => {});
      }
    } else if (!isValidOtp && cleanOtp === '123456') {
      // Fallback test code
      isValidOtp = true;
    }

    if (!isValidOtp) {
      return NextResponse.json(
        {
          error:
            'Invalid OTP code. Please enter the exact 6-digit code sent to your phone number.',
        },
        { status: 401 }
      );
    }

    // 2. Find or create vendor account in Prisma DB
    let vendor = await prisma.vendor.findUnique({
      where: { phoneNumber: normalizedPhone },
      include: {
        auditLogs: true,
      },
    });

    const isNewVendor = !vendor;

    if (!vendor) {
      vendor = await prisma.vendor.create({
        data: {
          phoneNumber: normalizedPhone,
          applicationStatus: ApplicationStatus.PENDING,
        },
        include: {
          auditLogs: true,
        },
      });
    }

    // 3. Generate JWT session payload
    const sessionPayload = {
      vendorId: vendor.id,
      phoneNumber: vendor.phoneNumber,
      companyName: vendor.companyName,
      category: vendor.category as VendorCategory | null,
      applicationStatus: vendor.applicationStatus as ApplicationStatus,
    };

    const token = await signVendorToken(sessionPayload);

    // 4. Determine redirection target based on onboarding status
    const needsOnboarding = !vendor.companyName || !vendor.category;
    const redirectTo = needsOnboarding ? '/onboarding' : '/dashboard';

    // 5. Build response with HTTP-only session cookie
    const response = NextResponse.json({
      success: true,
      message: isNewVendor
        ? 'Account created and authenticated successfully'
        : 'Authenticated successfully',
      vendor: {
        id: vendor.id,
        phoneNumber: vendor.phoneNumber,
        companyName: vendor.companyName,
        category: vendor.category,
        applicationStatus: vendor.applicationStatus,
        createdAt: vendor.createdAt.toISOString(),
      },
      isNewVendor,
      redirectTo,
    });

    response.cookies.set(
      AUTH_COOKIE_NAME,
      token,
      SESSION_COOKIE_OPTIONS as any
    );

    return response;
  } catch (error: any) {
    console.error('Error in verify-otp route:', error);
    return NextResponse.json(
      { error: 'Internal server error while verifying authorization code' },
      { status: 500 }
    );
  }
}
