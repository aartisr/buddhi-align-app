export interface ObservationEvent {
  event: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

const isClientObservabilityEnabled = process.env.NEXT_PUBLIC_OBSERVABILITY_CLIENT === "1";
const rawSampleRate = Number(process.env.NEXT_PUBLIC_OBSERVABILITY_SAMPLE_RATE ?? "1");
const observabilitySampleRate = Number.isFinite(rawSampleRate)
  ? Math.min(Math.max(rawSampleRate, 0), 1)
  : 1;

/**
 * Emit a structured product event.
 * Posts to /api/obs from the browser (best-effort, no throw).
 */
export function logEvent(event: string, data?: Record<string, unknown>): void {
  if (!isClientObservabilityEnabled) {
    return;
  }

  if (observabilitySampleRate < 1 && Math.random() > observabilitySampleRate) {
    return;
  }

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
