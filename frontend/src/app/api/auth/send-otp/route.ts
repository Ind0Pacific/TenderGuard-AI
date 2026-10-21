import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendTwilioOtp, isTwilioReady } from '@/lib/twilioClient';

/**
 * Normalizes Indian and International mobile numbers into standard E.164 (+91XXXXXXXXXX) format.
 */
function normalizePhoneNumber(input: string): string | null {
  const cleaned = input.replace(/\D/g, '');
  // Standard Indian 10-digit mobile
  if (cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }
  // With Indian country code
  if (cleaned.length === 12 && cleaned.startsWith('91') && /^91[6-9]\d{9}$/.test(cleaned)) {
    return `+${cleaned}`;
  }
  // Generic international with country code (11-15 digits)
  if (cleaned.length >= 11 && cleaned.length <= 15) {
    return `+${cleaned}`;
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phoneNumber } = body;

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return NextResponse.json(
        { error: 'Valid mobile number is required' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    if (!normalizedPhone) {
      return NextResponse.json(
        {
          error:
            'Please enter a valid 10-digit mobile number (e.g. 9876543210).',
        },
        { status: 400 }
      );
    }

    // Generate a cryptographically secure 6-digit OTP
    const realOtp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

    // Store in OtpVerification table
    await prisma.otpVerification.upsert({
      where: { phoneNumber: normalizedPhone },
      update: {
        otpCode: realOtp,
        expiresAt,
        attempts: 0,
        createdAt: new Date(),
      },
      create: {
        phoneNumber: normalizedPhone,
        otpCode: realOtp,
        expiresAt,
        attempts: 0,
      },
    });

    // Dispatch OTP text message via Twilio
    const twilioResult = await sendTwilioOtp(normalizedPhone, realOtp);

    return NextResponse.json({
      success: true,
      message: twilioResult.mode === 'TWILIO_SMS' || twilioResult.mode === 'TWILIO_VERIFY_API'
        ? `Text message dispatched via Twilio to ${normalizedPhone}`
        : `Verification code generated for ${normalizedPhone}`,
      phoneNumber: normalizedPhone,
      deliveryMode: twilioResult.mode,
      isTwilioLive: isTwilioReady(),
      messageSid: twilioResult.messageSid,
      realOtp, // Provided for user convenience & fallback testing
      expiresInSeconds: 600,
    });
  } catch (error: any) {
    console.error('Error in send-otp route:', error);
    return NextResponse.json(
      { error: 'Internal server error while dispatching OTP via Twilio' },
      { status: 500 }
    );
  }
}
