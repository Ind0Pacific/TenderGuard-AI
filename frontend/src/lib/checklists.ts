import {
  VendorCategory,
  DocumentType,
  ChecklistDocumentConfig,
  SequentialStepProgress,
  DocumentAuditLogItem,
} from './types';

/**
 * Universal Base Documents (Mandatory for ALL vendor categories)
 * Step 1: PAN Card
 * Step 2: Aadhaar Card (Redacted Check - first 8 digits masked)
 * Step 3: GST Registration Certificate (Form GST REG-06)
 */
export const UNIVERSAL_BASE_CHECKLIST: ChecklistDocumentConfig[] = [
  {
    stepNumber: 1,
    docType: 'PAN',
    title: 'Permanent Account Number (PAN) Card',
    description: 'Statutory 10-character corporate/individual PAN issued by the Income Tax Department.',
    isUniversal: true,
    requiredFor: 'Statutory tax entity identification & anti-fraud verification',
    authorityOrForm: 'Income Tax Department, Govt. of India',
    acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeMB: 10,
    validationRules: [
      'Must contain valid 10-character alphanumeric PAN format ([A-Z]{5}[0-9]{4}[A-Z]{1})',
      'Name must match registered vendor legal business name',
      'Document must not be physically damaged or illegible',
    ],
  },
  {
    stepNumber: 2,
    docType: 'AADHAAR',
    title: 'Aadhaar Card (Redacted Check)',
    description: 'Authorized signatory Aadhaar card with UIDAI privacy compliance masking.',
    isUniversal: true,
    requiredFor: 'Signatory identity validation with Zero-Retention PII compliance',
    authorityOrForm: 'Unique Identification Authority of India (UIDAI)',
    acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeMB: 10,
    validationRules: [
      'First 8 digits MUST be redacted/masked (e.g., XXXX-XXXX-1234)',
      'Only last 4 digits visible to prevent statutory privacy violations under Aadhaar Act',
      'QR code or UIDAI hologram watermark verified for authenticity',
    ],
  },
  {
    stepNumber: 3,
    docType: 'GST',
    title: 'GST Registration Certificate',
    description: 'Form GST REG-06 confirming active registration and state tax jurisdiction.',
    isUniversal: true,
    requiredFor: 'Inter-document cross-reference & valid tax remittance status',
    authorityOrForm: 'Central Board of Indirect Taxes and Customs (CBIC) - Form GST REG-06',
    acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeMB: 10,
    validationRules: [
      '15-character statutory GSTIN structure checksum',
      'State jurisdiction code must match regional procurement filing',
      'PAN segment (characters 3-12 of GSTIN) must strictly match verified PAN from Step 1',
    ],
  },
];

/**
 * Category-Specific Document Checklists (Steps 4 - 6)
 */
export const CATEGORY_SPECIFIC_CHECKLISTS: Record<VendorCategory, ChecklistDocumentConfig[]> = {
  [VendorCategory.CONSTRUCTION]: [
    {
      stepNumber: 4,
      docType: 'PWD_LICENSE',
      title: 'PWD Contractor Registration License',
      description: 'Public Works Department (PWD / CPWD) Class-A/B civil works contractor registration.',
      isUniversal: false,
      category: VendorCategory.CONSTRUCTION,
      requiredFor: 'Civil infrastructure tender bidding qualification',
      authorityOrForm: 'Central / State Public Works Department',
      acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
      maxSizeMB: 10,
      validationRules: [
        'Registration class must meet minimum tender contract value threshold',
        'Validity date must not be expired at the time of procurement bid deadline',
        'Entity name must exactly match PAN and GST records',
      ],
    },
    {
      stepNumber: 5,
      docType: 'SAFETY_CERT',
      title: 'Heavy Machinery Safety & Emission Clearance',
      description: 'Fitness and emission testing certifications for earthmoving, cranes, and heavy machinery.',
      isUniversal: false,
      category: VendorCategory.CONSTRUCTION,
      requiredFor: 'Site safety and environmental pollution norms compliance',
      authorityOrForm: 'State Pollution Control Board & Directorate of Industrial Safety',
      acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
      maxSizeMB: 10,
      validationRules: [
        'Active environmental clearance & PUC certification for plant machinery',
        'Equipment serial numbers mapped to registered company assets',
        'Valid inspection seal within statutory 12-month period',
      ],
    },
    {
      stepNumber: 6,
      docType: 'WORKMEN_COMP',
      title: 'Workmen Compensation Insurance Policy',
      description: 'Comprehensive labour insurance policy under the Employees Compensation Act.',
      isUniversal: false,
      category: VendorCategory.CONSTRUCTION,
      requiredFor: 'Mandatory worker liability protection on construction sites',
      authorityOrForm: 'IRDAI-licensed General Insurance Underwriter',
      acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
      maxSizeMB: 10,
      validationRules: [
        'Policy coverage must cover total site worker head count',
        'Policy premium receipt must indicate active in-force status',
        'Expiry date must extend past the scheduled project milestone completion date',
      ],
    },
  ],

  [VendorCategory.ELECTRONICS]: [
    {
      stepNumber: 4,
      docType: 'BIS_CERT',
      title: 'BIS (Bureau of Indian Standards) Certification',
      description: 'Compulsory Registration Scheme (CRS) certification for electronic and IT equipment.',
      isUniversal: false,
      category: VendorCategory.ELECTRONICS,
      requiredFor: 'Indian safety and quality compliance for hardware electronics',
      authorityOrForm: 'Bureau of Indian Standards (BIS CRS)',
      acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
      maxSizeMB: 10,
      validationRules: [
        'Valid R-Number (Registration Number) and IS standard reference',
        'Hardware product models listed in tender must match certified scope',
        'Validity period active on National BIS CRS Registry',
      ],
    },
    {
      stepNumber: 5,
      docType: 'ROHS_E_WASTE',
      title: 'RoHS & E-Waste EPR Compliance Authorization',
      description: 'Restriction of Hazardous Substances (RoHS) test report & CPCB Extended Producer Responsibility.',
      isUniversal: false,
      category: VendorCategory.ELECTRONICS,
      requiredFor: 'Environmental hazardous substance limits & statutory e-waste recycling',
      authorityOrForm: 'Central Pollution Control Board (CPCB) - EPR Authorization',
      acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
      maxSizeMB: 10,
      validationRules: [
        'CPCB EPR registration number verified',
        'Lead, Mercury, Cadmium levels under statutory ppm limits',
        'Valid annual recycling target clearance certificate',
      ],
    },
    {
      stepNumber: 6,
      docType: 'ISO_9001',
      title: 'ISO 9001:2015 Quality Management Certificate',
      description: 'International quality standard for manufacturing and electronic assembly processes.',
      isUniversal: false,
      category: VendorCategory.ELECTRONICS,
      requiredFor: 'Manufacturing quality management audit compliance',
      authorityOrForm: 'IAF / NABCB Accredited Certification Body',
      acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
      maxSizeMB: 10,
      validationRules: [
        'Accreditation body must have valid IAF / NABCB endorsement mark',
        'Scope of certification must explicitly include electronic device design/assembly',
        'Surveillance audit stamp valid within preceding 12 months',
      ],
    },
  ],

  [VendorCategory.LOGISTICS]: [
    {
      stepNumber: 4,
      docType: 'SHOP_ESTABLISHMENT',
      title: 'Shop & Commercial Establishment Certificate',
      description: 'Municipal registration under the State Shops and Commercial Establishments Act.',
      isUniversal: false,
      category: VendorCategory.LOGISTICS,
      requiredFor: 'Operating warehouse and distribution hub legality',
      authorityOrForm: 'Department of Labour / Municipal Corporation',
      acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
      maxSizeMB: 10,
      validationRules: [
        'Commercial premises address matches logistics dispatch hub',
        'Registration renewal current with municipal authority',
        'Trade category explicitly classified for warehousing/transport',
      ],
    },
    {
      stepNumber: 5,
      docType: 'FLEET_FITNESS',
      title: 'Fleet Fitness & Pollution Clearance Certificate',
      description: 'Consolidated RTO fitness certificate and green tax pollution receipts for transport fleet.',
      isUniversal: false,
      category: VendorCategory.LOGISTICS,
      requiredFor: 'Commercial vehicle roadworthiness on national freight corridors',
      authorityOrForm: 'Ministry of Road Transport and Highways (MoRTH) / RTO',
      acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
      maxSizeMB: 10,
      validationRules: [
        'Commercial carriage chassis/engine numbers verified against Vahan database',
        'Valid fitness inspection certificate covering tender execution window',
        'Speed limiter and GPS telematics compliance installed',
      ],
    },
    {
      stepNumber: 6,
      docType: 'CARRIER_PERMIT',
      title: 'National Goods Carriage Carrier Permit',
      description: 'All-India National Permit (Form 48 / N.P.) under Motor Vehicles Act.',
      isUniversal: false,
      category: VendorCategory.LOGISTICS,
      requiredFor: 'Inter-state tender transport authorization without border hold-ups',
      authorityOrForm: 'State Transport Authority (STA) / MoRTH National Permit Portal',
      acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
      maxSizeMB: 10,
      validationRules: [
        'Valid National Permit composite fee payment receipt',
        'Gross Vehicle Weight (GVW) matches cargo carrying capacity required in tender',
        'Authorization valid across all transit state corridors',
      ],
    },
  ],
};

/**
 * Returns the complete sequential document checklist for a given category.
 * Always consists of 6 sequential steps:
 * 1-3: Universal Base Documents (PAN, Aadhaar, GST)
 * 4-6: Category-Specific Documents
 */
export function getChecklistForCategory(
  category: VendorCategory | string | null | undefined
): ChecklistDocumentConfig[] {
  const cat = (category as VendorCategory) || VendorCategory.CONSTRUCTION;
  const categorySpecific = CATEGORY_SPECIFIC_CHECKLISTS[cat] || CATEGORY_SPECIFIC_CHECKLISTS[VendorCategory.CONSTRUCTION];
  return [...UNIVERSAL_BASE_CHECKLIST, ...categorySpecific];
}

/**
 * Evaluates the sequential progression of a vendor through the checklist.
 * STRICT ENFORCEMENT RULE: Step N+1 unlocks ONLY IF Step N is processed and VERIFIED.
 */
export function evaluateSequentialProgress(
  category: VendorCategory | string | null | undefined,
  auditLogs: DocumentAuditLogItem[] = []
): {
  checklist: SequentialStepProgress[];
  currentStepIndex: number;
  currentDocument: ChecklistDocumentConfig | null;
  isAllCompleted: boolean;
  verifiedCount: number;
  rejectedCount: number;
  edgeCaseCount: number;
} {
  const baseChecklist = getChecklistForCategory(category);
  
  // Index latest audit log per docType
  const logsByDocType = new Map<string, DocumentAuditLogItem>();
  for (const log of auditLogs) {
    // Keep most recent log for each docType
    const existing = logsByDocType.get(log.docType);
    if (!existing || new Date(log.verifiedAt) > new Date(existing.verifiedAt)) {
      logsByDocType.set(log.docType, log);
    }
  }

  const stepsProgress: SequentialStepProgress[] = [];
  let previousStepVerified = true; // Step 1 is always unlocked initially
  let currentDocument: ChecklistDocumentConfig | null = null;
  let currentStepIndex = 0;

  for (let i = 0; i < baseChecklist.length; i++) {
    const docConfig = baseChecklist[i];
    const log = logsByDocType.get(docConfig.docType);

    const isVerified = log?.status === 'VERIFIED';
    const isRejected = log?.status === 'REJECTED';
    const isEdgeCase = log?.status === 'EDGE_CASE';
    const hasBeenProcessed = Boolean(log);

    let status: SequentialStepProgress['status'] = 'LOCKED';
    let isUnlocked = false;
    let isCurrent = false;

    if (i === 0 || previousStepVerified) {
      isUnlocked = true;
    }

    if (hasBeenProcessed) {
      if (isVerified) status = 'VERIFIED';
      else if (isRejected) status = 'REJECTED';
      else if (isEdgeCase) status = 'EDGE_CASE';
    } else if (isUnlocked) {
      status = 'UNLOCKED';
    } else {
      status = 'LOCKED';
    }

    // Identify current actionable step
    if (isUnlocked && !isVerified && !currentDocument) {
      isCurrent = true;
      currentDocument = docConfig;
      currentStepIndex = i;
    }

    stepsProgress.push({
      stepNumber: docConfig.stepNumber,
      docType: docConfig.docType,
      title: docConfig.title,
      description: docConfig.description,
      isUnlocked,
      isCurrent,
      isCompleted: isVerified,
      status,
      auditLog: log,
    });

    // Sequential lock enforcement: Step N+1 unlocks ONLY if Step N is strictly VERIFIED
    previousStepVerified = isVerified;
  }

  const verifiedCount = stepsProgress.filter((s) => s.status === 'VERIFIED').length;
  const rejectedCount = stepsProgress.filter((s) => s.status === 'REJECTED').length;
  const edgeCaseCount = stepsProgress.filter((s) => s.status === 'EDGE_CASE').length;
  const isAllCompleted = verifiedCount === baseChecklist.length;

  return {
    checklist: stepsProgress,
    currentStepIndex: currentDocument ? currentStepIndex : baseChecklist.length,
    currentDocument,
    isAllCompleted,
    verifiedCount,
    rejectedCount,
    edgeCaseCount,
  };
}

/**
 * Returns metadata and details for a single document type.
 */
export function getDocumentConfigByType(
  docType: DocumentType | string,
  category?: VendorCategory | string | null
): ChecklistDocumentConfig | undefined {
  const fullChecklist = getChecklistForCategory(category);
  return fullChecklist.find((item) => item.docType === docType);
}
