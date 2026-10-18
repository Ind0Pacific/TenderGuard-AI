import { NextResponse } from 'next/server';
import { initialVendorFilings } from '@/lib/mockData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search')?.toLowerCase();

  let results = [...initialVendorFilings];

  if (status && status !== 'ALL') {
    results = results.filter((f) => f.overall_status === status);
  }

  if (search) {
    results = results.filter(
      (f) =>
        f.vendor_name.toLowerCase().includes(search) ||
        f.tender_ref_number.toLowerCase().includes(search)
    );
  }

  return NextResponse.json(results);
}
