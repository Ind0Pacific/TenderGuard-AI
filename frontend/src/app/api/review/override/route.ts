import { NextResponse } from 'next/server';
import { initialVendorFilings } from '@/lib/mockData';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { filing_id, rule_id, new_status, reviewer_name, reviewer_role, review_comments } = body;

    const filing = initialVendorFilings.find((f) => f.filing_id === filing_id);
    if (!filing) {
      return NextResponse.json({ detail: 'Filing not found' }, { status: 404 });
    }

    const check = filing.checks.find((c) => c.rule_id === rule_id);
    if (check) {
      const oldStatus = check.status;
      check.status = new_status;
      check.reviewer_override = {
        reviewer_name,
        reviewer_role,
        comments: review_comments,
        timestamp: new Date().toISOString(),
        previous_status: oldStatus,
      };

      // Recalculate
      filing.compliant_count = filing.checks.filter((c) => c.status === 'COMPLIANT').length;
      filing.non_compliant_count = filing.checks.filter((c) => c.status === 'NON_COMPLIANT').length;
      filing.requires_review_count = filing.checks.filter((c) => c.status === 'REQUIRES_REVIEW').length;
      filing.overall_compliance_score = Math.round((filing.compliant_count / filing.total_checks) * 100);

      if (filing.non_compliant_count > 0) filing.overall_status = 'NON_COMPLIANT';
      else if (filing.requires_review_count > 0) filing.overall_status = 'REQUIRES_REVIEW';
      else filing.overall_status = 'COMPLIANT';
    }

    return NextResponse.json({
      success: true,
      filing_id,
      rule_id,
      new_overall_status: filing.overall_status,
      new_score: filing.overall_compliance_score,
    });
  } catch {
    return NextResponse.json({ detail: 'Error updating review status' }, { status: 500 });
  }
}
