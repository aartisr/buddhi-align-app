import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found | Buddhi Align App",
  description: "This page could not be found. Return to the Buddhi Align dashboard.",
};

export default function NotFound() {
  return (
    <div
      className="app-route-loading"
      role="main"
      aria-labelledby="not-found-heading"
    >
      <div className="app-route-loading__panel">
        <div
          className="text-6xl mb-4 select-none leading-none"
          aria-hidden="true"
        >
          🕊️
        </div>
        <h1
          id="not-found-heading"
          className="app-route-loading__title"
        >
          Page not found
        </h1>
        <p className="app-route-loading__subtitle">
          This path doesn&rsquo;t exist or has been moved. Let&rsquo;s get you
          back on track.
        </p>
        <div className="flex flex-wrap gap-3 mt-6 justify-center">
          <Link
            href="/"
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-(--primary) text-white hover:bg-(--primary-dark,#24493e) transition"
            aria-label="Return to the Buddhi Align dashboard"
          >
            Back to dashboard
          </Link>
          <Link
            href="/sign-in"
            className="px-5 py-2 rounded-xl text-sm font-semibold border border-(--border-strong) text-(--primary) hover:bg-(--surface-soft) transition"
            aria-label="Go to the sign-in page"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
