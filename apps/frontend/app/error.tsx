"use client";

// Route-level error boundary — wraps every page segment.
// Preserves the shell (header/footer) while showing a friendly recovery UI.

import React, { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console; swap for your telemetry/error-reporting service here.
    console.error("[Route Error]", error.message, error.digest ?? "");
  }, [error]);

  return (
    <div
      className="app-route-loading"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="app-route-loading__panel">
        <div className="text-5xl mb-4 select-none" aria-hidden="true">
          🙏
        </div>
        <p className="app-route-loading__title">Something went wrong</p>
        <p className="app-route-loading__subtitle">
          An unexpected error occurred in this section. You can try again or
          return to the dashboard.
        </p>
        {error.digest && (
          <p className="app-route-loading__subtitle mt-1 opacity-60 text-xs">
            Reference:{" "}
            <code>{error.digest}</code>
          </p>
        )}
        <div className="flex flex-wrap gap-3 mt-6 justify-center">
          <button
            type="button"
            onClick={reset}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-(--primary) text-white hover:bg-(--primary-dark,#24493e) transition"
            aria-label="Try loading this section again"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-5 py-2 rounded-xl text-sm font-semibold border border-(--border-strong) text-(--primary) hover:bg-(--surface-soft) transition"
            aria-label="Return to dashboard"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
