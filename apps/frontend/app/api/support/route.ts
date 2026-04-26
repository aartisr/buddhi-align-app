import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createDataProvider } from "@buddhi-align/data-access";
import { logServerError } from "@/app/lib/server-error-log";
import { recordObservabilityEvent } from "@/app/lib/server-observability";
import {
  SUPPORT_REPORT_MODULE,
  buildSupportReportId,
  normalizeContactEmail,
  normalizeSupportReportCategory,
  normalizeSupportReportReproducibility,
  normalizeSupportReportSeverity,
  truncateText,
  type SupportReportDiagnostics,
  type SupportReportEntry,
} from "@/app/lib/support-reports";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 6;
const MAX_LONG_TEXT = 2200;
const MAX_URL = 600;
const recentSubmissions = new Map<string, { count: number; resetAt: number }>();

type SupportReportPayload = {
  category?: unknown;
  severity?: unknown;
  title?: unknown;
  pageUrl?: unknown;
  tryingToDo?: unknown;
  actualBehavior?: unknown;
  expectedBehavior?: unknown;
  reproducibility?: unknown;
  contactEmail?: unknown;
  consentToDiagnostics?: unknown;
  diagnostics?: unknown;
  company?: unknown;
};

function clientKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const userAgent = req.headers.get("user-agent") ?? "unknown";
  const raw = `${forwarded || "unknown"}:${userAgent.slice(0, 120)}`;
  return createHash("sha256").update(raw).digest("hex");
}
function checkRateLimit(key: string, now = Date.now()): boolean {
  const current = recentSubmissions.get(key);
  if (!current || current.resetAt <= now) {
    recentSubmissions.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (current.count >= RATE_LIMIT_MAX) {
    return false;
  }

  current.count += 1;
  return true;
}

function normalizeDiagnostics(value: unknown): SupportReportDiagnostics | undefined {
  if (!value || typeof value !== "object") return undefined;
  const source = value as Record<string, unknown>;
  return {
    url: truncateText(source.url, MAX_URL),
    referrer: truncateText(source.referrer, MAX_URL),
    userAgent: truncateText(source.userAgent, 600),
    language: truncateText(source.language, 80),
    languages: Array.isArray(source.languages)
      ? source.languages.map((item) => truncateText(item, 40)).filter(Boolean).slice(0, 8)
      : undefined,
    timezone: truncateText(source.timezone, 80),
    viewport: truncateText(source.viewport, 80),
    screen: truncateText(source.screen, 80),
    devicePixelRatio: typeof source.devicePixelRatio === "number" ? source.devicePixelRatio : undefined,
    online: typeof source.online === "boolean" ? source.online : undefined,
    connection: truncateText(source.connection, 80),
    capturedAt: truncateText(source.capturedAt, 80),
  };
}

function validationError(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let payload: SupportReportPayload;

  try {
    payload = await req.json();
  } catch {
    return validationError("Invalid JSON body.");
  }

  // Honeypot: make bot submissions look accepted while dropping them.
  if (truncateText(payload.company, 80)) {
    return NextResponse.json({ ok: true, reportId: "BA-SUP-QUEUED" }, { status: 202 });
  }

  const key = clientKey(req);
  if (!checkRateLimit(key)) {
    return NextResponse.json(
      { error: "Too many reports from this browser. Please wait a few minutes and try again." },
      { status: 429 },
    );
  }

  const title = truncateText(payload.title, 140);
  const pageUrl = truncateText(payload.pageUrl, MAX_URL);
  const tryingToDo = truncateText(payload.tryingToDo, MAX_LONG_TEXT);
  const actualBehavior = truncateText(payload.actualBehavior, MAX_LONG_TEXT);
  const expectedBehavior = truncateText(payload.expectedBehavior, MAX_LONG_TEXT) || undefined;
  const contactEmail = normalizeContactEmail(payload.contactEmail);
  const consentToDiagnostics = payload.consentToDiagnostics !== false;

  if (title.length < 8) {
    return validationError("Please add a short issue title.");
  }
  if (tryingToDo.length < 10) {
    return validationError("Please describe what you were trying to do.");
  }
  if (actualBehavior.length < 10) {
    return validationError("Please describe what happened.");
  }

  const now = new Date().toISOString();
  const reportId = buildSupportReportId(new Date(now));
  const entry: Omit<SupportReportEntry, "id"> = {
    reportId,
    createdAt: now,
    updatedAt: now,
    status: "new",
    category: normalizeSupportReportCategory(payload.category),
    severity: normalizeSupportReportSeverity(payload.severity),
    title,
    pageUrl,
    tryingToDo,
    actualBehavior,
    ...(expectedBehavior ? { expectedBehavior } : {}),
    reproducibility: normalizeSupportReportReproducibility(payload.reproducibility),
    ...(contactEmail ? { contactEmail } : {}),
    ...(consentToDiagnostics ? { diagnostics: normalizeDiagnostics(payload.diagnostics) } : {}),
    consentToDiagnostics,
    requesterIpHash: key,
    userAgent: truncateText(req.headers.get("user-agent"), 600),
  };

  try {
    const provider = createDataProvider();
    await provider.create<SupportReportEntry>(SUPPORT_REPORT_MODULE, entry);
    await recordObservabilityEvent({
      event: "support_report_created",
      source: "server",
      severity: entry.severity === "urgent" ? "critical" : entry.severity === "high" ? "warning" : "info",
      data: {
        reportId,
        category: entry.category,
        severity: entry.severity,
        pageUrl: entry.pageUrl,
      },
    });
    revalidatePath("/admin");
    return NextResponse.json({ ok: true, reportId, receivedAt: now }, { status: 201 });
  } catch (error) {
    await logServerError("/api/support", "POST", error);
    return NextResponse.json(
      { error: "We could not save the report yet. Please copy your report and try again." },
      { status: 500 },
    );
  }
}
