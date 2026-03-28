export interface ObservationEvent {
  event: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Emit a structured product event.
 * In development, this logs to console for quick debugging.
 * In production, this posts to /api/obs (best-effort, no throw).
 */
export function logEvent(event: string, data?: Record<string, unknown>): void {
  const payload: ObservationEvent = {
    event,
    data,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.info("[obs]", payload);
    return;
  }

  // Browser-side best effort delivery.
  if (typeof window !== "undefined") {
    try {
      const body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/obs", body);
        return;
      }
      void fetch("/api/obs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
      return;
    } catch {
      return;
    }
  }

  // Server-side fallback.
  void fetch("http://localhost:3000/api/obs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => undefined);
}
