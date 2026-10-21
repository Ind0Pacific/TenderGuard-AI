import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { VendorSession } from './types';

export const AUTH_COOKIE_NAME = 'tenderguard_session';
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'tenderguard-zero-retention-secret-key-32chars-min-2026!'
);

/**
 * Signs a cryptographically secure JWT session token for the authenticated vendor.
 */
export async function signVendorToken(payload: VendorSession): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/**
 * Verifies a JWT token and decodes the VendorSession payload.
 */
export async function verifyVendorToken(token: string): Promise<VendorSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      vendorId: payload.vendorId as string,
      phoneNumber: payload.phoneNumber as string,
      companyName: (payload.companyName as string) || null,
      category: payload.category as any,
      applicationStatus: payload.applicationStatus as any,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Server-side helper to read and verify the vendor session from Next.js cookies.
 */
export async function getAuthSession(): Promise<VendorSession | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyVendorToken(token);
  } catch (error) {
    return null;
  }
}

/**
 * Standard cookie configuration for session persistence.
 */
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
};
