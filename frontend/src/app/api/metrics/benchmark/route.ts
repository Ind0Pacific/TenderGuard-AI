import { NextResponse } from 'next/server';
import { benchmarkMetricsData } from '@/lib/mockData';

export async function GET() {
  return NextResponse.json(benchmarkMetricsData);
}
