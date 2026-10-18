import { NextResponse } from 'next/server';
import { initialVendorFilings } from '@/lib/mockData';

export async function GET() {
  const queueItems = [];
  for (const filing of initialVendorFilings) {
    if (filing.requires_review_count > 0) {
      for (const check of filing.checks) {
        if (check.status === 'REQUIRES_REVIEW') {
          queueItems.push({
            filing_id: filing.filing_id,
            vendor_name: filing.vendor_name,
            tender_ref_number: filing.tender_ref_number,
            submission_timestamp: filing.submission_timestamp,
            rule: check,
          });
        }
      }
    }
  }
  return NextResponse.json(queueItems);
}
