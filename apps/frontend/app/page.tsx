"use client";

import React from "react";
import { BuddhiDashboard } from "@buddhi-align/shared-ui";
import Link from "next/link";
import ModuleLayout from "./components/ModuleLayout";
import DailyRings from "./components/DailyRings";
import { MODULE_CATALOG } from "./i18n/config";
import { useI18n, useLocalizedModules } from "./i18n/provider";

export default function Home() {
  const { t } = useI18n();
  const modules = useLocalizedModules();
  const moduleByKey = new Map(MODULE_CATALOG.map((item) => [item.key, item]));
  const flowSteps = [
    {
      key: "plan",
      icon: "📜",
      title: t("dashboard.flow.plan.title"),
      description: t("dashboard.flow.plan.description"),
      href: moduleByKey.get("dharma")?.href ?? "/dharma-planner",
      cta: t("dashboard.flow.plan.cta"),
    },
    {
      key: "practice",
      icon: "🙏",
      title: t("dashboard.flow.practice.title"),
      description: t("dashboard.flow.practice.description"),
      href: moduleByKey.get("karma")?.href ?? "/karma-yoga",
      cta: t("dashboard.flow.practice.cta"),
    },
    {
      key: "reflect",
      icon: "🧘‍♂️",
      title: t("dashboard.flow.reflect.title"),
      description: t("dashboard.flow.reflect.description"),
      href: moduleByKey.get("jnana")?.href ?? "/jnana-reflection",
      cta: t("dashboard.flow.reflect.cta"),
    },
  ] as const;

  return (
    <ModuleLayout titleKey="app.dashboard">
      <DailyRings />
      <section className="app-guided-flow app-surface-card max-w-5xl mx-auto mb-6 p-4 sm:p-6" aria-label={t("dashboard.flow.aria")}>
        <div className="app-guided-flow-header">
          <div>
            <p className="app-guided-flow-kicker">{t("dashboard.flow.kicker")}</p>
            <h2 className="app-panel-title text-lg sm:text-xl font-bold leading-tight">{t("dashboard.flow.title")}</h2>
            <p className="app-copy-soft text-sm mt-1">{t("dashboard.flow.subtitle")}</p>
          </div>
          <Link href="/dharma-planner" className="app-guided-flow-primary-link">
            {t("dashboard.flow.primaryCta")}
          </Link>
        </div>
        <div className="app-guided-flow-grid">
          {flowSteps.map((step, index) => (
            <article key={step.key} className="app-guided-flow-card">
              <p className="app-guided-flow-step">{t("dashboard.flow.stepLabel", { step: index + 1 })}</p>
              <h3 className="app-guided-flow-card-title">
                <span aria-hidden>{step.icon}</span>
                <span>{step.title}</span>
              </h3>
              <p className="app-copy-soft text-sm">{step.description}</p>
              <Link href={step.href} className="app-guided-flow-link">
                {step.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>
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
