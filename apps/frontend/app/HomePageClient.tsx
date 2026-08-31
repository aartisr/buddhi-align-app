"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import ModuleLayout from "./components/ModuleLayout";
import { MODULE_CATALOG } from "./i18n/config";
import { useI18n, useLocalizedModules } from "./i18n/provider";
import { logEvent } from "./lib/logEvent";

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
    <ModuleLayout
      titleKey="app.dashboard"
      heading={t("dashboard.heading")}
    >
      <div className="max-w-5xl mx-auto space-y-12 pb-16">
        
        {/* Core Journey Section - Sleek Grid */}
        <section aria-label={t("dashboard.flow.aria")} className="space-y-6">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-(--foreground)">{t("dashboard.flow.title")}</h2>
            <p className="text-(--text-muted) max-w-2xl mx-auto text-lg">
              {t("dashboard.flow.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {flowSteps.map((step, index) => (
              <Link 
                key={step.key} 
                href={step.href}
                onClick={() => logEvent(`homepage_${step.key}_clicked`, { destination: step.href })}
                className="group relative flex flex-col p-8 rounded-3xl bg-(--surface-soft) border border-(--border-subtle) hover:bg-(--surface) hover:border-(--border-soft) hover:shadow-sm transition-all duration-300"
              >
                <div className="mb-6 flex justify-between items-start">
                  <span aria-hidden className={`text-4xl ${step.iconClassName}`}>{step.icon}</span>
                  <span className="text-xs font-bold tracking-widest uppercase text-(--text-subtle) opacity-50">
                    {t("dashboard.flow.stepLabel", { step: String(index + 1) })}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-(--foreground) mb-3 group-hover:text-(--primary) transition-colors">
                  {step.title}
                </h3>
                
                <p className="text-(--text-soft) text-sm leading-relaxed flex-1 mb-6">
                  {step.description}
                </p>

                <div className="inline-flex items-center gap-2 text-sm font-semibold text-(--primary)">
                  {step.cta}
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Support Modules - Elegant Pill Layout */}
        <section aria-labelledby="other-modules-heading" className="pt-8 border-t border-(--border-subtle)">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h2 id="other-modules-heading" className="text-xl font-bold text-(--foreground)">
              {t("dashboard.moreWays")}
            </h2>
            <Link 
              href="/motivation-analytics" 
              className="text-sm font-semibold text-(--primary) hover:text-(--accent) transition-colors inline-flex items-center gap-1"
            >
              {t("dashboard.seeMomentum")} <span aria-hidden>→</span>
            </Link>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {supportModules.map((module) => (
              <Link
                key={module.key}
                href={module.href}
                className="inline-flex items-center gap-2.5 rounded-full border border-(--border-subtle) bg-(--surface-soft) px-5 py-3 text-sm font-medium text-(--text-soft) hover:bg-(--surface) hover:text-(--primary) hover:border-(--border-soft) transition-all shadow-sm hover:shadow"
              >
                <span aria-hidden className="text-lg">{module.icon}</span>
                <span>{module.navLabel}</span>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </ModuleLayout>
  );
}
