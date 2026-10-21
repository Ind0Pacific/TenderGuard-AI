import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { signVendorToken, SESSION_COOKIE_OPTIONS, AUTH_COOKIE_NAME } from '@/lib/auth';
import { VendorCategory, ApplicationStatus, AuditStatus } from '@/lib/types';

// Helper to generate realistic SHA-256 hashes
function generateSha256(seed: string): string {
  return crypto.createHash('sha256').update(seed).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { caseType } = body;

    let phone = '';
    let companyName = '';
    let category = VendorCategory.CONSTRUCTION;
    let applicationStatus = ApplicationStatus.PENDING;
    let auditLogsToCreate: Array<{
      docType: string;
      sha256Hash: string;
      status: string;
      expiryDate: Date | null;
      confidenceScore: number;
      aiRemarks: string;
    }> = [];

    const now = new Date();
    const future2028 = new Date('2028-06-30T00:00:00.000Z');
    const future2027 = new Date('2027-12-31T00:00:00.000Z');
    const past2024 = new Date('2024-02-15T00:00:00.000Z'); // 8 months expired

    if (caseType === 'CASE_A') {
      // Case A: "Apex InfraBuilders Pvt Ltd" (Construction - APPROVED ✅)
      phone = '+919811100001';
      companyName = 'Apex InfraBuilders Pvt Ltd';
      category = VendorCategory.CONSTRUCTION;
      applicationStatus = ApplicationStatus.APPROVED;

      auditLogsToCreate = [
        {
          docType: 'PAN',
          sha256Hash: generateSha256('CASE_A_PAN_APEX_INFRABUILDERS'),
          status: AuditStatus.VERIFIED,
          expiryDate: null,
          confidenceScore: 0.99,
          aiRemarks:
            'Income Tax Dept 10-char PAN verified (AAACA9812A). Legal entity matches "Apex InfraBuilders Pvt Ltd". Zero-retention RAM scrub verified.',
        },
        {
          docType: 'AADHAAR',
          sha256Hash: generateSha256('CASE_A_AADHAAR_APEX_INFRABUILDERS'),
          status: AuditStatus.VERIFIED,
          expiryDate: null,
          confidenceScore: 0.97,
          aiRemarks:
            'Authorized Director Aadhaar card verified. First 8 digits masked (XXXX-XXXX-8912) conforming strictly to Section 29 Aadhaar Act privacy mandate.',
        },
        {
          docType: 'GST',
          sha256Hash: generateSha256('CASE_A_GST_APEX_INFRABUILDERS'),
          status: AuditStatus.VERIFIED,
          expiryDate: null,
          confidenceScore: 0.98,
          aiRemarks:
            'Form GST REG-06 verified. GSTIN 07AAACA9812A1Z5 matches registered PAN characters 3-12. Active tax filing state: Delhi NCT.',
        },
        {
          docType: 'PWD_LICENSE',
          sha256Hash: generateSha256('CASE_A_PWD_APEX_INFRABUILDERS'),
          status: AuditStatus.VERIFIED,
          expiryDate: future2028,
          confidenceScore: 0.96,
          aiRemarks:
            'CPWD Class-A Civil Contractor License verified. Entity registration active through June 2028. Unrestricted contract bidding tier.',
        },
        {
          docType: 'SAFETY_CERT',
          sha256Hash: generateSha256('CASE_A_SAFETY_APEX_INFRABUILDERS'),
          status: AuditStatus.VERIFIED,
          expiryDate: future2027,
          confidenceScore: 0.95,
          aiRemarks:
            'Directorate of Industrial Safety & State Pollution Control Board clearance verified for heavy earthmovers and batching plants.',
        },
        {
          docType: 'WORKMEN_COMP',
          sha256Hash: generateSha256('CASE_A_WORKMEN_APEX_INFRABUILDERS'),
          status: AuditStatus.VERIFIED,
          expiryDate: future2027,
          confidenceScore: 0.96,
          aiRemarks:
            'Employees Compensation Act policy (National Insurance Corp) verified. Active coverage for 250 site operatives through Dec 2027.',
        },
      ];
    } else if (caseType === 'CASE_B') {
      // Case B: "VoltEdge Electronics Corp" (Electronics - REJECTED ❌)
      phone = '+919822200002';
      companyName = 'VoltEdge Electronics Corp';
      category = VendorCategory.ELECTRONICS;
      applicationStatus = ApplicationStatus.REJECTED;

      auditLogsToCreate = [
        {
          docType: 'PAN',
          sha256Hash: generateSha256('CASE_B_PAN_VOLTEDGE'),
          status: AuditStatus.VERIFIED,
          expiryDate: null,
          confidenceScore: 0.98,
          aiRemarks:
            'Corporate PAN verified (AABCV1024K). Entity Name matches "VoltEdge Electronics Corp".',
        },
        {
          docType: 'AADHAAR',
          sha256Hash: generateSha256('CASE_B_AADHAAR_VOLTEDGE'),
          status: AuditStatus.VERIFIED,
          expiryDate: null,
          confidenceScore: 0.96,
          aiRemarks:
            'Signatory Aadhaar verified. First 8 digits masked (XXXX-XXXX-4519). Zero unmasked PII saved.',
        },
        {
          docType: 'GST',
          sha256Hash: generateSha256('CASE_B_GST_VOLTEDGE'),
          status: AuditStatus.VERIFIED,
          expiryDate: null,
          confidenceScore: 0.97,
          aiRemarks:
            'Form GST REG-06 verified. GSTIN 27AABCV1024K1Z9 matches PAN segment. Maharashtra jurisdiction active.',
        },
        {
          docType: 'BIS_CERT',
          sha256Hash: generateSha256('CASE_B_BIS_VOLTEDGE'),
          status: AuditStatus.REJECTED,
          expiryDate: past2024,
          confidenceScore: 0.94,
          aiRemarks:
            'CRITICAL COMPLIANCE FAILURE: Bureau of Indian Standards (BIS CRS) Certificate R-4100982 expired on 2024-02-15 (over 8 months ago). Furthermore, the attached RoHS clearance certificate cites a different manufacturing entity ("Shenzhen K-Tech Electronics Ltd"). Registration invalidated.',
        },
      ];
    } else if (caseType === 'CASE_C') {
      // Case C: "Shakti Heavy Logistics & Civil" (Construction - EDGE CASE ⚠️ -> Human Review)
      phone = '+919833300003';
      companyName = 'Shakti Heavy Logistics & Civil';
      category = VendorCategory.CONSTRUCTION;
      applicationStatus = ApplicationStatus.EDGE_CASE_HUMAN_REVIEW;

      auditLogsToCreate = [
        {
          docType: 'PAN',
          sha256Hash: generateSha256('CASE_C_PAN_SHAKTI'),
          status: AuditStatus.VERIFIED,
          expiryDate: null,
          confidenceScore: 0.98,
          aiRemarks:
            'Income Tax PAN validated (AAGCS7714M). Legal entity corresponds with "Shakti Heavy Logistics & Civil".',
        },
        {
          docType: 'AADHAAR',
          sha256Hash: generateSha256('CASE_C_AADHAAR_SHAKTI'),
          status: AuditStatus.VERIFIED,
          expiryDate: null,
          confidenceScore: 0.96,
          aiRemarks:
            'UIDAI masked Aadhaar verified (XXXX-XXXX-6621). Zero raw digits recorded.',
        },
        {
          docType: 'GST',
          sha256Hash: generateSha256('CASE_C_GST_SHAKTI'),
          status: AuditStatus.VERIFIED,
          expiryDate: null,
          confidenceScore: 0.97,
          aiRemarks:
            'Form GST REG-06 verified. State code 24 (Gujarat) matches regional transport permit.',
        },
        {
          docType: 'PWD_LICENSE',
          sha256Hash: generateSha256('CASE_C_PWD_SHAKTI'),
          status: AuditStatus.VERIFIED,
          expiryDate: future2027,
          confidenceScore: 0.94,
          aiRemarks:
            'Gujarat PWD Class-B Infrastructure License validated. Valid through Nov 2027.',
        },
        {
          docType: 'SAFETY_CERT',
          sha256Hash: generateSha256('CASE_C_SAFETY_SHAKTI_COFFEE_STAINED'),
          status: AuditStatus.EDGE_CASE,
          expiryDate: new Date('2026-12-31T00:00:00.000Z'),
          confidenceScore: 0.64, // 64% Confidence due to dirty/smudged scan
          aiRemarks:
            'AMBIGUOUS SCAN DETECTED (Confidence: 64%): The uploaded Heavy Machinery Fitness Certificate has severe coffee stains, low contrast, and an ink smudge over the statutory renewal date box (unclear whether "2026" or "2028"). Extracted entity "Shakti Heavy Logistics & Civil" matches, but certificate expiry requires mandatory sign-off by a TenderGuard Human Compliance Officer.',
        },
      ];
    } else {
      return NextResponse.json({ error: 'Invalid caseType. Expected CASE_A, CASE_B, or CASE_C.' }, { status: 400 });
    }

    // Upsert Vendor in database
    const vendor = await prisma.vendor.upsert({
      where: { phoneNumber: phone },
      update: {
        companyName,
        category,
        applicationStatus,
      },
      create: {
        phoneNumber: phone,
        companyName,
        category,
        applicationStatus,
      },
    });

    // Remove any previous audit logs for this test vendor
    await prisma.documentAuditLog.deleteMany({
      where: { vendorId: vendor.id },
    });

    // Insert clean realistic audit logs
    for (const log of auditLogsToCreate) {
      await prisma.documentAuditLog.create({
        data: {
          vendorId: vendor.id,
          docType: log.docType,
          sha256Hash: log.sha256Hash,
          status: log.status,
          expiryDate: log.expiryDate,
          confidenceScore: log.confidenceScore,
          aiRemarks: log.aiRemarks,
          verifiedAt: new Date(),
        },
      });
    }

    // Generate JWT auth session
    const sessionPayload = {
      vendorId: vendor.id,
      phoneNumber: vendor.phoneNumber,
      companyName: vendor.companyName,
      category: vendor.category as VendorCategory,
      applicationStatus: vendor.applicationStatus as ApplicationStatus,
    };

    const token = await signVendorToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      caseType,
      vendor: {
        id: vendor.id,
        phoneNumber: vendor.phoneNumber,
        companyName: vendor.companyName,
        category: vendor.category,
        applicationStatus: vendor.applicationStatus,
      },
      auditLogsCount: auditLogsToCreate.length,
      message: `Demo Preset "${companyName}" loaded successfully.`,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      ...SESSION_COOKIE_OPTIONS,
    });

    return response;
  } catch (error: any) {
    console.error('Error loading demo case preset:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to initialize demo case scenario' },
      { status: 500 }
    );
  }
}
