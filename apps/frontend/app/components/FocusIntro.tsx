import React from "react";
import Link from "next/link";

type FocusIntroProps = {
  title: string;
  summary: string;
  primaryHref?: string;
  primaryLabel?: string;
};

export default function FocusIntro({ title, summary, primaryHref, primaryLabel }: FocusIntroProps) {
  return (
    <section className="app-surface-card max-w-4xl mx-auto mb-5 p-4 sm:p-5" aria-label={title}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="app-panel-title text-lg sm:text-xl font-bold leading-tight">{title}</h2>
          <p className="app-copy-soft text-sm mt-1 max-w-2xl">{summary}</p>
        </div>
        <div className="flex items-center gap-2">
          {primaryHref && primaryLabel ? (
            <Link href={primaryHref} className="app-guided-flow-primary-link">
              {primaryLabel}
            </Link>
          ) : null}
          <Link href="/about" className="app-guided-flow-link whitespace-nowrap">
            About this app
          </Link>
        </div>
      </div>
    </section>
  );
}
