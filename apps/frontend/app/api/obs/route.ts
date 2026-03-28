import { NextRequest, NextResponse } from "next/server";

interface ObservationEvent {
  event: string;
  data?: Record<string, unknown>;
  timestamp?: string;
}

/**
 * Lightweight observability collector.
 * This intentionally logs server-side for now; wire to your preferred
 * sink (OpenTelemetry, Datadog, etc.) when production infra is ready.
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

  // eslint-disable-next-line no-console
  console.info("[obs:api]", {
    event: payload.event,
    data: payload.data ?? {},
    timestamp: payload.timestamp ?? new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
