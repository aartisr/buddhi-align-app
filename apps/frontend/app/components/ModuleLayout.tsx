"use client";

import Link from "next/link";
import React from "react";

import LanguageSwitcher from "./LanguageSwitcher";
import UserMenu from "./UserMenu";
import { MODULE_CATALOG, type TranslationKey } from "../i18n/config";
import { useI18n } from "../i18n/provider";

export default function ModuleLayout({ titleKey, children }: { titleKey: TranslationKey; children: React.ReactNode }) {
  const { t } = useI18n();
  const icon = MODULE_CATALOG.find((item) => item.titleKey === titleKey)?.icon ?? "";

  const navItems = MODULE_CATALOG.filter((item) => item.navKey);

  return (
    <div className="app-shell relative font-sans">
      <div className="relative">
        {icon && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
            aria-hidden
          >
            <span className="buddhi-bg-icon">{icon}</span>
          </div>
        )}
        <header className="app-header-panel w-full px-6 py-4 flex items-center justify-between relative z-10">
          <h1 className="app-page-title text-2xl font-bold tracking-tight">
            <Link href="/">{t("app.brand")}</Link>
          </h1>
          <div className="flex items-center gap-4">
            <nav className="hidden xl:flex gap-4 text-sm font-medium app-copy">
              <Link href="/" className="hover:underline">{t("layout.home")}</Link>
              {navItems.map((item) => (
                <Link key={item.key} href={item.href} className="hover:underline">
                  {t(item.navKey!)}
                </Link>
              ))}
            </nav>
            <LanguageSwitcher />
            <UserMenu />
          </div>
        </header>
        <main className="max-w-2xl mx-auto py-12 px-4 sm:px-8 relative z-10">
          <h2 className="app-panel-title text-3xl font-semibold mb-8 text-center">
            {t(titleKey)}
          </h2>
          {children}
        </main>
      </div>
      <div className="app-backdrop-panel" />
    </div>
  );
}
