import { NextRequest, NextResponse } from 'next/server';
import { ANONYMOUS_COOKIE_NAME, isAnonymousCookie } from '@/app/auth/anonymous';
import { hasOidcConfidence } from '@/app/auth/auth-confidence';
import { hasRecentStepUp } from '@/app/auth/step-up';
import { auth } from '@/auth';
import { createDataProvider } from '@buddhi-align/data-access';
import { listAnonymousEntries } from '../../_anonymous-module-store';
import { ANALYTICS_MODULES } from '../../analytics/types';
import { recordObservabilityEvent } from '@/app/lib/server-observability';

const ARCHIVE_VERSION = 1;

type SessionLike = { user?: { id?: string; authAt?: string | number } } | null;

interface ImportAccess {
  session: SessionLike;
  deniedResponse: NextResponse | null;
}

export interface ArchivePayload {
  version: number;
  exportedAt: string;
  modules: Record<string, unknown[]>;
}

function isArchivePayload(value: unknown): value is ArchivePayload {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<ArchivePayload>;
  return typeof candidate.modules === 'object' && candidate.modules !== null;
}

async function getImportAccess(req: NextRequest): Promise<ImportAccess> {
  const isAnon = isAnonymousCookie(req.cookies.get(ANONYMOUS_COOKIE_NAME)?.value);
  const session: SessionLike = isAnon ? null : (await auth()) as SessionLike;

  if (isAnon) {
    await recordObservabilityEvent({
      event: 'data_import_anonymous_denied',
      source: 'server',
      severity: 'warning',
      statusCode: 403,
    });
    return {
      session,
      deniedResponse: NextResponse.json(
        { error: 'Import is not available in anonymous mode. Sign in to import data.' },
        { status: 403 },
      ),
    };
  }

  if (!hasOidcConfidence(session)) {
    await recordObservabilityEvent({
      event: 'data_import_oidc_required_denied',
      source: 'server',
      severity: 'warning',
      statusCode: 403,
      userId: session?.user?.id,
    });
    return {
      session,
      deniedResponse: NextResponse.json(
        { error: 'OIDC authentication required for data import.' },
        { status: 403 },
      ),
    };
  }

  if (!hasRecentStepUp(session)) {
    await recordObservabilityEvent({
      event: 'data_import_stepup_required_denied',
      source: 'server',
      severity: 'warning',
      statusCode: 403,
      userId: session?.user?.id,
    });
    return {
      session,
      deniedResponse: NextResponse.json(
        { error: 'Recent re-authentication required for data import.' },
        { status: 403 },
      ),
    };
  }

  return { session, deniedResponse: null };
}

async function parseArchive(req: NextRequest, userId?: string): Promise<ArchivePayload | NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    await recordObservabilityEvent({
      event: 'data_import_invalid_json',
      source: 'server',
      severity: 'warning',
      statusCode: 400,
      userId,
    });
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!isArchivePayload(body)) {
    await recordObservabilityEvent({
      event: 'data_import_invalid_archive',
      source: 'server',
      severity: 'warning',
      statusCode: 400,
      userId,
    });
    return NextResponse.json({ error: 'Invalid archive format' }, { status: 400 });
  }

  return body;
}

async function importModuleEntries(
  moduleName: string,
  entries: unknown,
  userId: string | undefined,
): Promise<{ imported: number; errors: number }> {
  if (!Array.isArray(entries)) {
    return { imported: 0, errors: 0 };
  }

  const provider = createDataProvider();
  let imported = 0;
  let errors = 0;

  for (const entry of entries) {
    if (typeof entry !== 'object' || entry === null) {
      errors++;
      continue;
    }

    try {
      const data = Object.fromEntries(
        Object.entries(entry as Record<string, unknown>).filter(([key]) => key !== 'id'),
      );
      await provider.create(moduleName, data, { userId });
      imported++;
    } catch {
      errors++;
    }
  }

  return { imported, errors };
}

/** GET /api/data/export — Download all entries as a JSON archive */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const isAnon = isAnonymousCookie(req.cookies.get(ANONYMOUS_COOKIE_NAME)?.value);
  const session = isAnon ? null : await auth();
  if (!isAnon && !hasOidcConfidence(session)) {
    await recordObservabilityEvent({
      event: 'data_export_oidc_required_denied',
      source: 'server',
      severity: 'warning',
      statusCode: 403,
      userId: session?.user?.id,
    });
    return NextResponse.json(
      { error: 'OIDC authentication required for data export.' },
      { status: 403 },
    );
  }
  if (!isAnon && !hasRecentStepUp(session as { user?: { authAt?: string | number } } | null)) {
    await recordObservabilityEvent({
      event: 'data_export_stepup_required_denied',
      source: 'server',
      severity: 'warning',
      statusCode: 403,
      userId: session?.user?.id,
    });
    return NextResponse.json(
      { error: 'Recent re-authentication required for data export.' },
      { status: 403 },
    );
  }
  const modules: Record<string, unknown[]> = {};

  // Fetch all modules in parallel.
  const provider = isAnon ? null : createDataProvider();
  const modResults = await Promise.all(
    ANALYTICS_MODULES.map(async (mod) => {
      try {
        const entries = isAnon
          ? listAnonymousEntries(mod)
          : await provider!.list(mod, { userId: session?.user?.id });
        return [mod, entries] as const;
      } catch {
        return [mod, [] as unknown[]] as const;
      }
    }),
  );
  for (const [mod, entries] of modResults) {
    modules[mod] = entries;
  }

  const payload: ArchivePayload = {
    version: ARCHIVE_VERSION,
    exportedAt: new Date().toISOString(),
    modules,
  };

  await recordObservabilityEvent({
    event: 'data_export_completed',
    source: 'server',
    statusCode: 200,
    userId: session?.user?.id,
    data: {
      isAnonymous: isAnon,
      modules: Object.keys(modules).length,
      totalEntries: Object.values(modules).reduce((sum, entries) => sum + entries.length, 0),
    },
  });

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
  const { session, deniedResponse } = await getImportAccess(req);
  if (deniedResponse) return deniedResponse;

  const archiveResult = await parseArchive(req, session?.user?.id);
  if (archiveResult instanceof NextResponse) return archiveResult;

  const archive = archiveResult;
  const results: Record<string, { imported: number; errors: number }> = {};

  for (const mod of ANALYTICS_MODULES) {
    results[mod] = await importModuleEntries(mod, archive.modules[mod], session?.user?.id);
  }

  const summary = Object.values(results).reduce(
    (acc, item) => ({
      imported: acc.imported + item.imported,
      errors: acc.errors + item.errors,
    }),
    { imported: 0, errors: 0 },
  );

  await recordObservabilityEvent({
    event: 'data_import_completed',
    source: 'server',
    severity: summary.errors > 0 ? 'warning' : 'info',
    statusCode: 200,
    userId: session?.user?.id,
    data: summary,
  });

  return NextResponse.json({ ok: true, results });
}
