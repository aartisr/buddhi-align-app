import { NextRequest, NextResponse } from 'next/server';
import { ANONYMOUS_COOKIE_NAME, isAnonymousCookie } from '@/app/auth/anonymous';
import { auth } from '@/auth';
import { createDataProvider } from '@buddhi-align/data-access';
import {
  deleteAnonymousEntry,
  updateAnonymousEntry,
} from '../../_anonymous-module-store';
import { ANALYTICS_MODULES } from '../../analytics/types';
import { logServerError } from '@/app/lib/server-error-log';

// Single source of truth — matches the set in [module]/route.ts.
const VALID_MODULES = new Set<string>(ANALYTICS_MODULES);

/** PUT /api/[module]/[id] — update an existing entry */
export async function PUT(
  req: NextRequest,
  { params }: { params: { module: string; id: string } },
) {
  if (!VALID_MODULES.has(params.module)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    if (isAnonymousCookie(req.cookies.get(ANONYMOUS_COOKIE_NAME)?.value)) {
      const entry = updateAnonymousEntry(params.module, params.id, body);
      return NextResponse.json(entry);
    }

    const session = await auth();
    const entry = await createDataProvider().update(
      params.module,
      params.id,
      body,
      { userId: session?.user?.id },
    );
    return NextResponse.json(entry);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.toLowerCase().includes('not found')) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    void logServerError(`/api/${params.module}/${params.id}`, 'PUT', err);
    console.error(`PUT /api/${params.module}/${params.id}`, err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** DELETE /api/[module]/[id] — remove an entry */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { module: string; id: string } },
) {
  if (!VALID_MODULES.has(params.module)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    if (isAnonymousCookie(req.cookies.get(ANONYMOUS_COOKIE_NAME)?.value)) {
      deleteAnonymousEntry(params.module, params.id);
      return new NextResponse(null, { status: 204 });
    }

    const session = await auth();
    await createDataProvider().delete(params.module, params.id, {
      userId: session?.user?.id,
    });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    void logServerError(`/api/${params.module}/${params.id}`, 'DELETE', err);
    console.error(`DELETE /api/${params.module}/${params.id}`, err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
