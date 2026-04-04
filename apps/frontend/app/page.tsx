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
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 className="app-panel-title text-lg sm:text-xl font-bold leading-tight">{t("dashboard.quickTourTitle")}</h2>
            <details>
              <summary className="app-copy-soft text-sm cursor-pointer select-none underline underline-offset-2">
                {t("dashboard.quickTourMoreDetails")}
              </summary>
              <p className="app-copy-soft text-sm mt-2 max-w-xl">{t("dashboard.quickTourDescription")}</p>
            </details>
          </div>
          <Link
            href="/motivation-analytics#quick-tour"
            className="app-button-primary px-4 py-2 rounded-lg whitespace-nowrap"
            aria-label={t("dashboard.quickTourButton")}
          >
            {t("dashboard.quickTourButton")}
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
