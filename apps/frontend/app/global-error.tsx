"use client";

// Root-level error boundary — wraps the entire application including the layout.
// Must render its own <html> and <body> since the normal layout is unavailable.
//
// IMPORTANT: Inline styles are used intentionally here because Next.js does NOT
// apply layout-level CSS (Tailwind/global imports) when GlobalError is active.
// See: https://nextjs.org/docs/app/api-reference/file-conventions/error#global-errorjs
// Using inline styles ensures meaningful fallback UI regardless of bundled CSS state.

import React, { useEffect } from "react";
import { translate, DEFAULT_LOCALE } from "@/app/i18n/config";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]", error.message, error.digest ?? "");
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          background: "Canvas",
          color: "CanvasText",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "1rem",
          boxSizing: "border-box",
        }}
      >
        <div role="alert" style={{ textAlign: "center", maxWidth: "28rem" }}>
          <div
            style={{ fontSize: "3.5rem", marginBottom: "1.25rem", lineHeight: 1 }}
            aria-hidden="true"
          >
            🙏
          </div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              margin: "0 0 0.5rem",
              color: "CanvasText",
            }}
          >
            {translate(DEFAULT_LOCALE, "route.globalError.title")}
          </h1>
          <p
            style={{
              fontSize: "0.95rem",
              color: "CanvasText",
              margin: "0 0 1.5rem",
              lineHeight: 1.6,
              opacity: 0.85,
            }}
          >
            {translate(DEFAULT_LOCALE, "route.globalError.subtitle")}
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: "0.75rem",
                color: "CanvasText",
                marginBottom: "1.5rem",
                fontFamily: "monospace",
                opacity: 0.7,
              }}
            >
              {translate(DEFAULT_LOCALE, "route.globalError.reference")} {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              background: "ButtonFace",
              color: "ButtonText",
              border: "1px solid ButtonBorder",
              borderRadius: "0.875rem",
              padding: "0.65rem 1.75rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseOver={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.filter = "brightness(0.96)")
            }
            onMouseOut={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.filter = "none")
            }
            aria-label={translate(DEFAULT_LOCALE, "route.globalError.reloadAria")}
          >
            {translate(DEFAULT_LOCALE, "route.globalError.reload")}
          </button>
        </div>
      </body>
    </html>
  );
}
