import { NextRequest, NextResponse } from 'next/server';
import { ANONYMOUS_COOKIE_NAME, isAnonymousCookie } from '@/app/auth/anonymous';
import { auth } from '@/auth';
import { createDataProvider } from '@buddhi-align/data-access';
import { listAnonymousEntries } from '../../_anonymous-module-store';
import { ANALYTICS_MODULES } from '../../analytics/types';

const ARCHIVE_VERSION = 1;

export interface ArchivePayload {
  version: number;
  exportedAt: string;
  modules: Record<string, unknown[]>;
}

/** GET /api/data/export — Download all entries as a JSON archive */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const isAnon = isAnonymousCookie(req.cookies.get(ANONYMOUS_COOKIE_NAME)?.value);
  const session = isAnon ? null : await auth();
  const modules: Record<string, unknown[]> = {};

  for (const mod of ANALYTICS_MODULES) {
    try {
      modules[mod] = isAnon
        ? listAnonymousEntries(mod)
        : await createDataProvider().list(mod, { userId: session?.user?.id });
    } catch {
      modules[mod] = [];
    }
  }

  const payload: ArchivePayload = {
    version: ARCHIVE_VERSION,
    exportedAt: new Date().toISOString(),
    modules,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="buddhi-align-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}

/** POST /api/data/export — Import entries from a JSON archive */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const isAnon = isAnonymousCookie(req.cookies.get(ANONYMOUS_COOKIE_NAME)?.value);
  const session = isAnon ? null : await auth();
  if (isAnon) {
    return NextResponse.json(
      { error: 'Import is not available in anonymous mode. Sign in to import data.' },
      { status: 403 },
    );
  }

  let archive: ArchivePayload;
  try {
    archive = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!archive || typeof archive !== 'object' || !archive.modules) {
    return NextResponse.json({ error: 'Invalid archive format' }, { status: 400 });
  }

  const provider = createDataProvider();
  const results: Record<string, { imported: number; errors: number }> = {};

  for (const mod of ANALYTICS_MODULES) {
    const entries = archive.modules[mod];
    if (!Array.isArray(entries)) {
      results[mod] = { imported: 0, errors: 0 };
      continue;
    }

    let imported = 0;
    let errors = 0;
    for (const entry of entries) {
      if (typeof entry !== 'object' || entry === null) { errors++; continue; }
      try {
        // Strip id — let the backend assign a new one to avoid collisions
        const data = Object.fromEntries(
          Object.entries(entry as Record<string, unknown>).filter(
            ([key]) => key !== 'id',
          ),
        );
        await provider.create(mod, data, { userId: session?.user?.id });
        imported++;
      } catch {
        errors++;
      }
    }
    results[mod] = { imported, errors };
  }

  return NextResponse.json({ ok: true, results });
}
