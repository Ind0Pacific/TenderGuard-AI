import { NextResponse } from 'next/server';
import { defaultTenders } from '@/lib/mockData';

export async function GET() {
  return NextResponse.json(defaultTenders);
}
