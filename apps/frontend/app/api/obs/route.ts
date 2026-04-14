import { NextRequest, NextResponse } from "next/server";
import { inferObservabilitySeverity, recordObservabilityEvent } from "@/app/lib/server-observability";

interface ObservationEvent {
  event: string;
  data?: Record<string, unknown>;
  timestamp?: string;
}

/**
 * Lightweight observability collector.
 * Accepts best-effort client telemetry without emitting console logs.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let payload: ObservationEvent;

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!payload || typeof payload.event !== "string" || payload.event.length === 0) {
    return NextResponse.json({ error: "Invalid event payload" }, { status: 400 });
  }

  await recordObservabilityEvent({
    event: payload.event,
    source: "client",
    severity: inferObservabilitySeverity(payload.event),
    data: payload.data,
    at: payload.timestamp,
  });

  return NextResponse.json({ ok: true });
}
