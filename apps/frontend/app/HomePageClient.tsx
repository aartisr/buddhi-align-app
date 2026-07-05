"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import ModuleLayout from "./components/ModuleLayout";
import FocusIntro from "./components/FocusIntro";
import { MODULE_CATALOG } from "./i18n/config";
import { useI18n, useLocalizedModules } from "./i18n/provider";

export default function HomePageClient() {
  const { t } = useI18n();
  const modules = useLocalizedModules();
  const moduleByKey = useMemo(
    () => new Map(MODULE_CATALOG.map((item) => [item.key, item])),
    [],
  );
  const flowSteps = useMemo(
    () =>
      [
        {
          key: "plan",
          icon: "📜",
          iconClassName: "app-module-icon--dharma",
          title: t("dashboard.flow.plan.title"),
          description: t("dashboard.flow.plan.description"),
          href: moduleByKey.get("dharma")?.href ?? "/dharma-planner",
          cta: t("dashboard.flow.plan.cta"),
        },
        {
          key: "practice",
          icon: "🙏",
          iconClassName: "app-module-icon--karma",
          title: t("dashboard.flow.practice.title"),
          description: t("dashboard.flow.practice.description"),
          href: moduleByKey.get("karma")?.href ?? "/karma-yoga",
          cta: t("dashboard.flow.practice.cta"),
        },
        {
          key: "reflect",
          icon: "🧘‍♂️",
          iconClassName: "app-module-icon--jnana",
          title: t("dashboard.flow.reflect.title"),
          description: t("dashboard.flow.reflect.description"),
          href: moduleByKey.get("jnana")?.href ?? "/jnana-reflection",
          cta: t("dashboard.flow.reflect.cta"),
        },
      ] as const,
    [moduleByKey, t],
  );
  const coreModuleKeys = useMemo(() => new Set(["dharma", "karma", "jnana"]), []);
  const supportModules = useMemo(
    () => modules.filter((module) => !coreModuleKeys.has(module.key)),
    [coreModuleKeys, modules],
  );

  return (
    <ModuleLayout titleKey="app.dashboard">
      <FocusIntro
        title="Daily clarity, zero clutter"
        summary="Use Copilot to decide your next best step, complete one meaningful action, then move on."
      />

      <section className="app-guided-flow app-surface-card max-w-4xl mx-auto mb-6 p-5 sm:p-7" aria-label={t("dashboard.flow.aria")}>
        <div className="app-guided-flow-header">
          <div>
            <p className="app-guided-flow-kicker">Copilot-first daily loop</p>
            <h2 className="app-panel-title text-xl sm:text-2xl font-bold leading-tight">Decide. Do. Reflect.</h2>
            <p className="app-copy-soft text-sm mt-2 max-w-2xl">
              Skip the noise. Ask Copilot one question, complete one meaningful action, and close your day with a short reflection.
            </p>
          </div>
          <Link href="/dharma-planner" className="app-guided-flow-primary-link">
            Start now
          </Link>
        </div>
        <p className="app-copy-soft text-xs sm:text-sm mb-4">
          Copilot is available in the bottom-right corner across every module.
        </p>
        <div className="app-guided-flow-grid">
          {flowSteps.map((step) => (
            <article key={step.key} className="app-guided-flow-card">
              <p className="app-guided-flow-step">Focus now</p>
              <h3 className="app-guided-flow-card-title">
                <span aria-hidden className={`app-module-icon ${step.iconClassName}`}>{step.icon}</span>
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

      <section className="app-surface-card max-w-4xl mx-auto mb-6 p-4 sm:p-6" aria-labelledby="other-modules-heading">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 id="other-modules-heading" className="app-panel-title text-lg sm:text-xl font-bold leading-tight">
            Everything else, one tap away
          </h2>
          <Link href="/motivation-analytics" className="app-guided-flow-link">
            See momentum
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {supportModules.map((module) => (
            <Link
              key={module.key}
              href={module.href}
              className={`app-module-chip app-module-chip--${module.key} inline-flex items-center gap-2 rounded-full border border-(--border-soft) bg-(--surface-strong) px-3 py-2 text-sm font-semibold text-(--primary)`}
            >
              <span aria-hidden className={`app-module-icon app-module-icon--${module.key}`}>{module.icon}</span>
              <span>{module.navLabel}</span>
            </Link>
          ))}
        </div>
      </section>
    </ModuleLayout>
  );
}
