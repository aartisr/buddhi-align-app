import { NextRequest, NextResponse } from 'next/server';
import { createDataProvider } from '@buddhi-align/data-access';

const VALID_MODULES = new Set([
  'karma',
  'bhakti',
  'jnana',
  'dhyana',
  'vasana',
  'dharma',
]);

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
    const entry = await createDataProvider().update(
      params.module,
      params.id,
      body,
    );
    return NextResponse.json(entry);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.toLowerCase().includes('not found')) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    console.error(`PUT /api/${params.module}/${params.id}`, err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** DELETE /api/[module]/[id] — remove an entry */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { module: string; id: string } },
) {
  if (!VALID_MODULES.has(params.module)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    await createDataProvider().delete(params.module, params.id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error(`DELETE /api/${params.module}/${params.id}`, err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
