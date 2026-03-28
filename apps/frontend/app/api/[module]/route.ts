import { NextRequest, NextResponse } from 'next/server';
import { ANONYMOUS_COOKIE_NAME, isAnonymousCookie } from '@/app/auth/anonymous';
import { createDataProvider } from '@buddhi-align/data-access';
import {
  createAnonymousEntry,
  listAnonymousEntries,
} from '../_anonymous-module-store';

const VALID_MODULES = new Set([
  'karma',
  'bhakti',
  'jnana',
  'dhyana',
  'vasana',
  'dharma',
]);

/** GET /api/[module] — list all entries */
export async function GET(
  req: NextRequest,
  { params }: { params: { module: string } },
) {
  if (!VALID_MODULES.has(params.module)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (isAnonymousCookie(req.cookies.get(ANONYMOUS_COOKIE_NAME)?.value)) {
    return NextResponse.json(listAnonymousEntries(params.module));
  }

  try {
    const data = await createDataProvider().list(params.module);
    return NextResponse.json(data);
  } catch (err) {
    console.error(`GET /api/${params.module}`, err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** POST /api/[module] — create a new entry */
export async function POST(
  req: NextRequest,
  { params }: { params: { module: string } },
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

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json(
      { error: 'Request body must be a non-null object' },
      { status: 400 },
    );
  }

  if (isAnonymousCookie(req.cookies.get(ANONYMOUS_COOKIE_NAME)?.value)) {
    const entry = createAnonymousEntry(params.module, body);
    return NextResponse.json(entry, { status: 201 });
  }

  try {
    const entry = await createDataProvider().create(params.module, body);
    return NextResponse.json(entry, { status: 201 });
  } catch (err) {
    console.error(`POST /api/${params.module}`, err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
