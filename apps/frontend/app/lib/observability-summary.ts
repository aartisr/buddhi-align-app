import type { ObservabilityEventEntry } from "./server-observability";

export type ObservabilityAlertCategory = "auth" | "data" | "personalization";

export interface ObservabilityAlert {
  key: string;
  level: "warning" | "critical";
  category: ObservabilityAlertCategory;
  title: string;
  detail: string;
  owner: string;
  runbook: string;
}

export interface WeeklyTrendPoint {
  day: string;
  count: number;
}

export interface ObservabilitySummary {
  last24hEvents: number;
  authDenials24h: number;
  importIssues24h: number;
  personalizationIssues24h: number;
  weeklyAuthDenials: WeeklyTrendPoint[];
  weeklyImportIssues: WeeklyTrendPoint[];
  alerts: ObservabilityAlert[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

function parseThreshold(name: string, fallback: number): number {
  const raw = process.env[name];
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

function isRecent(at: string | undefined, nowMs: number): boolean {
  if (!at) return false;
  const ts = Date.parse(at);
  if (Number.isNaN(ts)) return false;
  return nowMs - ts <= DAY_MS;
}

function getNormalizedName(event: ObservabilityEventEntry): string {
  return event.event.toLowerCase();
}

function isAuthDenialEvent(name: string): boolean {
  return (
    name.includes("oidc_required_denied")
    || name.includes("stepup_required_denied")
    || name.includes("unauthorized")
    || name.includes("forbidden")
  );
}

function isImportIssueEvent(name: string): boolean {
  return (
    name.startsWith("data_import_")
    && (name.includes("denied") || name.includes("invalid") || name.includes("failed") || name.includes("error"))
  );
}

function isPersonalizationIssueEvent(name: string): boolean {
  return (
    name.startsWith("personalization_")
    && (name.includes("empty") || name.includes("failed") || name.includes("error"))
  );
}

function formatUtcDayLabel(ts: number): string {
  const d = new Date(ts);
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${month}/${day}`;
}

function getUtcDayStartMs(nowMs: number): number {
  const d = new Date(nowMs);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function buildWeeklyTrends(allEvents: ObservabilityEventEntry[], nowMs: number): {
  weeklyAuthDenials: WeeklyTrendPoint[];
  weeklyImportIssues: WeeklyTrendPoint[];
} {
  const todayStart = getUtcDayStartMs(nowMs);
  const buckets = Array.from({ length: 7 }, (_, idx) => {
    const offsetFromToday = 6 - idx;
    const start = todayStart - offsetFromToday * DAY_MS;
    return {
      start,
      end: start + DAY_MS,
      day: formatUtcDayLabel(start),
      authDenials: 0,
      importIssues: 0,
    };
  });

  for (const event of allEvents) {
    const ts = Date.parse(event.at);
    if (Number.isNaN(ts)) continue;
    const bucket = buckets.find((item) => ts >= item.start && ts < item.end);
    if (!bucket) continue;

    const name = getNormalizedName(event);
    if (isAuthDenialEvent(name)) bucket.authDenials++;
    if (isImportIssueEvent(name)) bucket.importIssues++;
  }

  return {
    weeklyAuthDenials: buckets.map((item) => ({ day: item.day, count: item.authDenials })),
    weeklyImportIssues: buckets.map((item) => ({ day: item.day, count: item.importIssues })),
  };
}

function classifyIssueCounts(events: ObservabilityEventEntry[]) {
  let authDenials24h = 0;
  let importIssues24h = 0;
  let personalizationIssues24h = 0;

  for (const event of events) {
    const name = getNormalizedName(event);
    if (isAuthDenialEvent(name)) authDenials24h++;
    if (isImportIssueEvent(name)) importIssues24h++;
    if (isPersonalizationIssueEvent(name)) personalizationIssues24h++;
  }

  return { authDenials24h, importIssues24h, personalizationIssues24h };
}

export function buildObservabilitySummary(
  allEvents: ObservabilityEventEntry[],
  nowMs = Date.now(),
): ObservabilitySummary {
  const recentEvents = allEvents.filter((event) => isRecent(event.at, nowMs));
  const { weeklyAuthDenials, weeklyImportIssues } = buildWeeklyTrends(allEvents, nowMs);
  const { authDenials24h, importIssues24h, personalizationIssues24h } = classifyIssueCounts(recentEvents);

  const authWarn = parseThreshold("OBS_ALERT_AUTH_DENIALS_WARN", 5);
  const authCritical = parseThreshold("OBS_ALERT_AUTH_DENIALS_CRITICAL", 10);
  const importWarn = parseThreshold("OBS_ALERT_IMPORT_ISSUES_WARN", 3);
  const importCritical = parseThreshold("OBS_ALERT_IMPORT_ISSUES_CRITICAL", 6);
  const personalizationWarn = parseThreshold("OBS_ALERT_PERSONALIZATION_ISSUES_WARN", 4);
  const personalizationCritical = parseThreshold("OBS_ALERT_PERSONALIZATION_ISSUES_CRITICAL", 8);

  const alerts: ObservabilityAlert[] = [];

  if (authDenials24h >= authCritical) {
    alerts.push({
      key: "auth-denial-spike",
      level: "critical",
      category: "auth",
      title: "Auth denial spike",
      detail: `${authDenials24h} auth denials in last 24h (critical threshold ${authCritical}).`,
      owner: "Identity & Access",
      runbook: "RB-OBS-AUTH-01",
    });
  } else if (authDenials24h >= authWarn) {
    alerts.push({
      key: "auth-denial-trend",
      level: "warning",
      category: "auth",
      title: "Auth denial trend",
      detail: `${authDenials24h} auth denials in last 24h (warning threshold ${authWarn}).`,
      owner: "Identity & Access",
      runbook: "RB-OBS-AUTH-01",
    });
  }

  if (importIssues24h >= importCritical) {
    alerts.push({
      key: "import-instability",
      level: "critical",
      category: "data",
      title: "Data import instability",
      detail: `${importIssues24h} import issues in last 24h (critical threshold ${importCritical}).`,
      owner: "Data Platform",
      runbook: "RB-OBS-DATA-02",
    });
  } else if (importIssues24h >= importWarn) {
    alerts.push({
      key: "import-issues-rising",
      level: "warning",
      category: "data",
      title: "Data import issues rising",
      detail: `${importIssues24h} import issues in last 24h (warning threshold ${importWarn}).`,
      owner: "Data Platform",
      runbook: "RB-OBS-DATA-02",
    });
  }

  if (personalizationIssues24h >= personalizationCritical) {
    alerts.push({
      key: "personalization-degraded",
      level: "critical",
      category: "personalization",
      title: "Personalization degraded",
      detail: `${personalizationIssues24h} personalization issues in last 24h (critical threshold ${personalizationCritical}).`,
      owner: "Recommendations",
      runbook: "RB-OBS-P13N-03",
    });
  } else if (personalizationIssues24h >= personalizationWarn) {
    alerts.push({
      key: "personalization-confidence-drop",
      level: "warning",
      category: "personalization",
      title: "Personalization confidence drop",
      detail: `${personalizationIssues24h} personalization issues in last 24h (warning threshold ${personalizationWarn}).`,
      owner: "Recommendations",
      runbook: "RB-OBS-P13N-03",
    });
  }

  return {
    last24hEvents: recentEvents.length,
    authDenials24h,
    importIssues24h,
    personalizationIssues24h,
    weeklyAuthDenials,
    weeklyImportIssues,
    alerts,
  };
}
