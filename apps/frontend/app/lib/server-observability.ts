import { createDataProvider } from "@buddhi-align/data-access";

export const OBSERVABILITY_EVENT_MODULE = "__obs_event";

export type ObservabilitySource = "client" | "server";
export type ObservabilitySeverity = "info" | "warning" | "critical";

export interface ObservabilityEventEntry {
  id: string;
  at: string;
  event: string;
  source: ObservabilitySource;
  severity: ObservabilitySeverity;
  statusCode?: number;
  userId?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface RecordObservabilityEventInput {
  event: string;
  source: ObservabilitySource;
  severity?: ObservabilitySeverity;
  statusCode?: number;
  userId?: string;
  data?: Record<string, unknown>;
  at?: string;
}

export function inferObservabilitySeverity(eventName: string): ObservabilitySeverity {
  const normalized = eventName.trim().toLowerCase();
  if (
    normalized.includes("critical")
    || normalized.includes("denied")
    || normalized.includes("forbidden")
    || normalized.includes("unauthorized")
    || normalized.includes("failed")
    || normalized.includes("error")
  ) {
    return "warning";
  }

  return "info";
}

/**
 * Best-effort event sink used by server routes and server actions.
 * This helper must never throw so it cannot break primary request handling.
 */
export async function recordObservabilityEvent(input: RecordObservabilityEventInput): Promise<void> {
  try {
    const provider = createDataProvider();
    await provider.create<ObservabilityEventEntry>(OBSERVABILITY_EVENT_MODULE, {
      at: input.at ?? new Date().toISOString(),
      event: input.event,
      source: input.source,
      severity: input.severity ?? inferObservabilitySeverity(input.event),
      ...(typeof input.statusCode === "number" ? { statusCode: input.statusCode } : {}),
      ...(input.userId ? { userId: input.userId } : {}),
      ...(input.data ? { data: input.data } : {}),
    });
  } catch {
    // Swallow errors to keep observability non-blocking.
  }
}
