export interface ObservationEvent {
  event: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Emit a structured product event.
 * Posts to /api/obs from the browser (best-effort, no throw).
 */
export function logEvent(event: string, data?: Record<string, unknown>): void {
  const payload: ObservationEvent = {
    event,
    data,
    timestamp: new Date().toISOString(),
  };

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
}
