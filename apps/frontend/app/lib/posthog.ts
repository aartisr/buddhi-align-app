export type PostHogEvent = {
  event: string;
  properties?: Record<string, unknown>;
  timestamp: string;
};

export type PostHogConfig = {
  apiKey: string;
  host: string;
};

const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";
const SESSION_ID_KEY = "buddhi-align-posthog-session-id";
const FLUSH_DELAY_MS = 750;
const MAX_BATCH_SIZE = 20;

let queue: PostHogEvent[] = [];
let flushTimer: number | undefined;
let pageLifecycleBound = false;

function normalizeHost(value: string | undefined): string | null {
  const candidate = (value || DEFAULT_POSTHOG_HOST).trim().replace(/\/$/, "");

  try {
    const url = new URL(candidate);
    return url.protocol === "https:" ? url.toString().replace(/\/$/, "") : null;
  } catch {
    return null;
  }
}

export function getPostHogConfig(env: Record<string, string | undefined> = process.env): PostHogConfig | null {
  const apiKey = env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  const host = normalizeHost(env.NEXT_PUBLIC_POSTHOG_HOST);

  return apiKey && host ? { apiKey, host } : null;
}

function getSessionId(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const existing = window.sessionStorage.getItem(SESSION_ID_KEY);
    if (existing) return existing;

    const id = crypto.randomUUID?.() ?? `ph-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    window.sessionStorage.setItem(SESSION_ID_KEY, id);
    return id;
  } catch {
    return null;
  }
}

function buildPayload(config: PostHogConfig, events: PostHogEvent[]) {
  const distinctId = getSessionId();

  return JSON.stringify({
    api_key: config.apiKey,
    batch: events.map((event) => ({
      event: event.event,
      properties: {
        ...event.properties,
        $distinct_id: distinctId ?? undefined,
        $current_url: typeof window === "undefined" ? undefined : window.location.href,
        $lib: "buddhi-align",
        $lib_version: "1",
      },
      timestamp: event.timestamp,
    })),
  });
}

function sendBatch(config: PostHogConfig, events: PostHogEvent[], preferBeacon = false) {
  if (events.length === 0 || typeof window === "undefined") return;

  const payload = buildPayload(config, events);
  const endpoint = `${config.host}/batch/`;

  try {
    if (preferBeacon && navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([payload], { type: "application/json" }));
      return;
    }

    void fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
      credentials: "omit",
    });
  } catch {
    // Analytics must never affect the user journey.
  }
}

function flush(preferBeacon = false) {
  const config = getPostHogConfig();
  flushTimer = undefined;

  if (!config) return;

  while (queue.length > 0) {
    sendBatch(config, queue.splice(0, MAX_BATCH_SIZE), preferBeacon);
  }
}

function bindPageLifecycle() {
  if (pageLifecycleBound || typeof window === "undefined") return;
  pageLifecycleBound = true;

  window.addEventListener("pagehide", () => flush(true));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush(true);
  });
}

/**
 * Queues only curated product events. The integration stays dormant until
 * NEXT_PUBLIC_POSTHOG_KEY is configured; it does not enable replay,
 * autocapture, or person profiles by default.
 */
export function capturePostHog(event: PostHogEvent): void {
  if (!getPostHogConfig() || typeof window === "undefined") return;

  queue.push(event);
  bindPageLifecycle();

  if (queue.length >= MAX_BATCH_SIZE) {
    flush();
    return;
  }

  if (flushTimer === undefined) {
    flushTimer = window.setTimeout(() => flush(), FLUSH_DELAY_MS);
  }
}

export function resetPostHogForTests() {
  queue = [];
  if (flushTimer !== undefined && typeof window !== "undefined") {
    window.clearTimeout(flushTimer);
  }
  flushTimer = undefined;
  pageLifecycleBound = false;
}
