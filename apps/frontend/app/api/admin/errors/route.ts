import { NextResponse } from 'next/server';
import { createDataProvider } from '@buddhi-align/data-access';
import { requireAdminApiAccess } from '../_auth';
import { APP_ERROR_LOG_MODULE, type AppErrorEntry } from '@/app/lib/server-error-log';

/**
 * GET /api/admin/errors
 *
 * Returns the most recent server-side errors captured by logServerError().
 * Admin-only route — requires valid admin cookie.
 */
export async function GET() {
  const authResult = await requireAdminApiAccess();
  if (!authResult.ok) return authResult.response;

  try {
    const provider = createDataProvider();
    const errors = await provider.list<AppErrorEntry>(APP_ERROR_LOG_MODULE);
    // Return newest first, capped at 100 for the UI.
    const recent = errors.slice(-100).reverse();
    return NextResponse.json({ total: errors.length, recent });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to fetch error log: ${detail}` }, { status: 500 });
  }
}
