import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: 'Signed out successfully',
  });

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    path: '/',
    maxAge: 0,
    httpOnly: true,
  });

  return response;
}
