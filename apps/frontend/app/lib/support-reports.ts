export const SUPPORT_REPORT_MODULE = "__support_report";

export const SUPPORT_REPORT_CATEGORIES = [
  "bug",
  "sign-in",
  "autograph",
  "community",
  "accessibility",
  "performance",
  "content",
  "privacy-security",
  "feedback",
] as const;

export const SUPPORT_REPORT_SEVERITIES = ["low", "normal", "high", "urgent"] as const;
export const SUPPORT_REPORT_STATUSES = ["new", "reviewing", "resolved"] as const;
export const SUPPORT_REPORT_REPRODUCIBILITY = ["always", "sometimes", "once", "not-sure"] as const;

export type SupportReportCategory = (typeof SUPPORT_REPORT_CATEGORIES)[number];
export type SupportReportSeverity = (typeof SUPPORT_REPORT_SEVERITIES)[number];
export type SupportReportStatus = (typeof SUPPORT_REPORT_STATUSES)[number];
export type SupportReportReproducibility = (typeof SUPPORT_REPORT_REPRODUCIBILITY)[number];

export type SupportReportDiagnostics = {
  url?: string;
  referrer?: string;
  userAgent?: string;
  language?: string;
  languages?: string[];
  timezone?: string;
  viewport?: string;
  screen?: string;
  devicePixelRatio?: number;
  online?: boolean;
  connection?: string;
  capturedAt?: string;
};

export type SupportReportEntry = {
  id: string;
  reportId: string;
  createdAt: string;
  updatedAt: string;
  status: SupportReportStatus;
  category: SupportReportCategory;
  severity: SupportReportSeverity;
  title: string;
  pageUrl: string;
  tryingToDo: string;
  actualBehavior: string;
  expectedBehavior?: string;
  reproducibility: SupportReportReproducibility;
  contactEmail?: string;
  diagnostics?: SupportReportDiagnostics;
  consentToDiagnostics: boolean;
  requesterIpHash?: string;
  userAgent?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  [key: string]: unknown;
};

export function truncateText(value: unknown, maxLength: number): string {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}
export function normalizeSupportReportCategory(value: unknown): SupportReportCategory {
  return SUPPORT_REPORT_CATEGORIES.includes(value as SupportReportCategory)
    ? (value as SupportReportCategory)
    : "bug";
}

export function normalizeSupportReportSeverity(value: unknown): SupportReportSeverity {
  return SUPPORT_REPORT_SEVERITIES.includes(value as SupportReportSeverity)
    ? (value as SupportReportSeverity)
    : "normal";
}

export function normalizeSupportReportStatus(value: unknown): SupportReportStatus {
  return SUPPORT_REPORT_STATUSES.includes(value as SupportReportStatus)
    ? (value as SupportReportStatus)
    : "new";
}

export function normalizeSupportReportReproducibility(value: unknown): SupportReportReproducibility {
  return SUPPORT_REPORT_REPRODUCIBILITY.includes(value as SupportReportReproducibility)
    ? (value as SupportReportReproducibility)
    : "not-sure";
}

export function normalizeContactEmail(value: unknown): string | undefined {
  const email = truncateText(value, 160);
  if (!email) return undefined;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined;
}

export function buildSupportReportId(now = new Date()): string {
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  const random = crypto.randomUUID().slice(0, 8).toUpperCase();
  return `BA-SUP-${date}-${random}`;
}
