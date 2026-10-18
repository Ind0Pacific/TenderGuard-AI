import { NextResponse } from 'next/server';
import { initialVendorFilings } from '@/lib/mockData';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const filing = initialVendorFilings.find((f) => f.filing_id === params.id);
  if (!filing) {
    return NextResponse.json({ detail: 'Vendor filing not found' }, { status: 404 });
  }
  return NextResponse.json(filing);
}
