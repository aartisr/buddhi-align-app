/**
 * server-error-log.ts
 *
 * Best-effort structured error logger for server-side API routes.
 *
 * Errors are stored in the same `module_entries` table using a private
 * module name so no additional SQL migration is required.  Admins can
 * view them at /admin (Errors panel) or via GET /api/admin/errors.
 *
 * Security: this module should only be imported in server code (Route
 * Handlers, Server Actions, Server Components).  It never exposes the
 * error payload to the client.
 */

import { createDataProvider } from '@buddhi-align/data-access';

/** Internal module name — not in VALID_MODULES so it cannot be reached by users. */
export const APP_ERROR_LOG_MODULE = '__app_error_log';

export interface AppErrorEntry {
  id: string;
  at: string;
  route: string;
  method: string;
  errorName: string;
  errorMessage: string;
  userId?: string;
  [key: string]: unknown;
}

/**
 * Persist a server-side error to the error log.
 *
 * This is intentionally fire-and-forget — it must never throw so that
 * the original error handler can proceed normally.
 */
export async function logServerError(
  route: string,
  method: string,
  error: unknown,
  userId?: string,
): Promise<void> {
  try {
    const err = error instanceof Error ? error : new Error(String(error));
    const provider = createDataProvider();
    await provider.create<AppErrorEntry>(APP_ERROR_LOG_MODULE, {
      at: new Date().toISOString(),
      route,
      method,
      errorName: err.name,
      errorMessage: err.message,
      ...(userId ? { userId } : {}),
    });
  } catch {
    // Swallow — error logging must never cause a secondary failure.
  }
}
