"use client";

import React from "react";
import { BuddhiDashboard } from "@buddhi-align/shared-ui";
import Link from "next/link";
import ModuleLayout from "./components/ModuleLayout";
import DailyRings from "./components/DailyRings";
import { useI18n, useLocalizedModules } from "./i18n/provider";

export default function Home() {
  const { t } = useI18n();
  const modules = useLocalizedModules();

  return (
    <ModuleLayout titleKey="app.dashboard">
      <DailyRings />
      <section className="app-surface-card max-w-4xl mx-auto mb-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="app-panel-title text-lg sm:text-xl font-bold">New here? Take the 60-second quick tour.</h2>
            <p className="app-copy-soft text-sm">Learn all pages and the full daily flow in one lightweight video.</p>
          </div>
          <Link
            href="/motivation-analytics#quick-tour"
            className="app-button-primary px-4 py-2 rounded-lg whitespace-nowrap"
            aria-label="Watch quick tour video"
          >
            Watch Quick Tour
          </Link>
        </div>
      </section>
      <BuddhiDashboard
        userName={t("dashboard.defaultUser")}
        heading={t("app.dashboard")}
        subtitle={t("dashboard.subtitle")}
        welcomeTemplate={t("dashboard.welcome")}
        modules={modules}
      />
    </ModuleLayout>
  );
}
