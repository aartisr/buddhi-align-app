import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { createDataProvider } from "@buddhi-align/data-access";

type PreferenceEntry = {
  id: string;
  userId?: string;
  locale?: string;
  musicControlVisible?: boolean;
  updatedAt?: string;
};

const PREFERENCES_MODULE = "preferences";
const PREFERENCES_FALLBACK_LOG_INTERVAL_MS = 60_000;

let lastPreferencesFallbackLogAt = 0;

function maybeLogPreferencesFallback(err: unknown) {
  const now = Date.now();
  if (now - lastPreferencesFallbackLogAt < PREFERENCES_FALLBACK_LOG_INTERVAL_MS) {
    return;
  }

  lastPreferencesFallbackLogAt = now;
  const reason = err instanceof Error ? err.message : "unknown error";
  console.warn(`GET /api/preferences using defaults (backing store unavailable): ${reason}`);
}

function toPublicPreferences(entry: PreferenceEntry | null) {
  if (!entry) {
    return {
      locale: undefined,
      musicControlVisible: false,
    };
  }

  return {
    locale: entry.locale,
    musicControlVisible:
      typeof entry.musicControlVisible === "boolean"
        ? entry.musicControlVisible
        : false,
  };
}

export async function GET(_req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const entries = await createDataProvider().list<PreferenceEntry>(
      PREFERENCES_MODULE,
      { userId },
    );
    const mine = entries.filter((entry) => entry.userId === userId || entry.userId === undefined);
    const latest = mine.length > 0 ? mine[mine.length - 1] : null;

    return NextResponse.json(toPublicPreferences(latest));
  } catch (err) {
    // Preferences are non-critical for page render. If backing storage has
    // a transient connectivity issue, return safe defaults instead of 500.
    maybeLogPreferencesFallback(err);
    return NextResponse.json(toPublicPreferences(null));
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const locale = typeof body.locale === "string" ? body.locale : undefined;
  const musicControlVisible =
    typeof body.musicControlVisible === "boolean"
      ? body.musicControlVisible
      : undefined;

  if (locale === undefined && musicControlVisible === undefined) {
    return NextResponse.json(
      { error: "At least one preference field is required" },
      { status: 400 },
    );
  }

  try {
    const provider = createDataProvider();
    const entries = await provider.list<PreferenceEntry>(PREFERENCES_MODULE, { userId });
    const mine = entries.filter((entry) => entry.userId === userId || entry.userId === undefined);
    const latest = mine.length > 0 ? mine[mine.length - 1] : null;

    const patch: Omit<PreferenceEntry, "id"> = {
      userId,
      updatedAt: new Date().toISOString(),
    };

    if (locale !== undefined) patch.locale = locale;
    if (musicControlVisible !== undefined) {
      patch.musicControlVisible = musicControlVisible;
    }

    const saved = latest
      ? await provider.update<PreferenceEntry>(PREFERENCES_MODULE, latest.id, patch, { userId })
      : await provider.create<PreferenceEntry>(PREFERENCES_MODULE, patch, { userId });

    return NextResponse.json(toPublicPreferences(saved));
  } catch (err) {
    console.error("PUT /api/preferences", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
