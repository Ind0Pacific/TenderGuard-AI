// Global resilient in-memory OTP storage to guarantee zero-downtime even if SQLite/Prisma is uninitialized
export interface OtpRecord {
  otpCode: string;
  expiresAt: Date;
  attempts: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __tenderguardOtpStore: Map<string, OtpRecord> | undefined;
}

export function getOtpStore(): Map<string, OtpRecord> {
  if (!globalThis.__tenderguardOtpStore) {
    globalThis.__tenderguardOtpStore = new Map<string, OtpRecord>();
  }
  return globalThis.__tenderguardOtpStore;
}
