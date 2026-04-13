import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { translate, DEFAULT_LOCALE } from "@/app/i18n/config";

export const metadata: Metadata = {
  title: `${translate(DEFAULT_LOCALE, "route.notFound.title")} | Buddhi Align App`,
  description: translate(DEFAULT_LOCALE, "route.notFound.subtitle"),
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
          {translate(DEFAULT_LOCALE, "route.notFound.title")}
        </h1>
        <p className="app-route-loading__subtitle">
          {translate(DEFAULT_LOCALE, "route.notFound.subtitle")}
        </p>
        <div className="flex flex-wrap gap-3 mt-6 justify-center">
          <Link
            href="/"
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-(--primary) text-white hover:bg-(--primary-dark,#24493e) transition"
            aria-label={translate(DEFAULT_LOCALE, "route.notFound.homeAria")}
          >
            {translate(DEFAULT_LOCALE, "route.notFound.home")}
          </Link>
          <Link
            href="/sign-in"
            className="px-5 py-2 rounded-xl text-sm font-semibold border border-(--border-strong) text-(--primary) hover:bg-(--surface-soft) transition"
            aria-label={translate(DEFAULT_LOCALE, "route.notFound.signInAria")}
          >
            {translate(DEFAULT_LOCALE, "route.notFound.signIn")}
          </Link>
        </div>
      </div>
    </div>
  );
}
