"use client";

// Route-level error boundary — wraps every page segment.
// Preserves the shell (header/footer) while showing a friendly recovery UI.

import React, { useEffect } from "react";
import Link from "next/link";
import { translate, DEFAULT_LOCALE } from "@/app/i18n/config";

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
        <p className="app-route-loading__title">{translate(DEFAULT_LOCALE, "route.error.title")}</p>
        <p className="app-route-loading__subtitle">
          {translate(DEFAULT_LOCALE, "route.error.subtitle")}
        </p>
        {error.digest && (
          <p className="app-route-loading__subtitle mt-1 opacity-60 text-xs">
            {translate(DEFAULT_LOCALE, "route.error.reference")}{" "}
            <code>{error.digest}</code>
          </p>
        )}
        <div className="flex flex-wrap gap-3 mt-6 justify-center">
          <button
            type="button"
            onClick={reset}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-(--primary) text-white hover:bg-(--primary-dark,#24493e) transition"
            aria-label={translate(DEFAULT_LOCALE, "route.error.retryAria")}
          >
            {translate(DEFAULT_LOCALE, "route.error.retry")}
          </button>
          <Link
            href="/"
            className="px-5 py-2 rounded-xl text-sm font-semibold border border-(--border-strong) text-(--primary) hover:bg-(--surface-soft) transition"
            aria-label={translate(DEFAULT_LOCALE, "route.error.homeAria")}
          >
            {translate(DEFAULT_LOCALE, "route.error.home")}
          </Link>
        </div>
      </div>
    </div>
  );
}
