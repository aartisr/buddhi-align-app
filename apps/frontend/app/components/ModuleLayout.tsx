"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";

import LanguageSwitcher from "./LanguageSwitcher";
import UserMenu from "./UserMenu";
import BuddhiAlignLogo from "./BuddhiAlignLogo";
import { MODULE_CATALOG, type TranslationKey } from "../i18n/config";
import { useI18n } from "../i18n/provider";

export default function ModuleLayout({ titleKey, children }: { titleKey: TranslationKey; children: React.ReactNode }) {
  const { t } = useI18n();
  const icon = MODULE_CATALOG.find((item) => item.titleKey === titleKey)?.icon ?? "";
  const navItems = MODULE_CATALOG.filter((item) => item.navKey);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close drawer on Escape key
  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileNavOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileNavOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileNavOpen]);

  const closeNav = () => setMobileNavOpen(false);

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

        {/* ── Header ── */}
        <header className="app-header-panel w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between relative z-20">
          <h1>
            <Link href="/" className="inline-flex items-center" aria-label={t("app.brand")}>
              <BuddhiAlignLogo className="h-10 sm:h-11 w-auto" />
            </Link>
          </h1>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop nav */}
            <nav className="hidden lg:flex gap-4 text-sm font-medium app-copy" aria-label="Main navigation">
              <Link href="/" className="hover:underline">{t("layout.home")}</Link>
              {navItems.map((item) => (
                <Link key={item.key} href={item.href} className="hover:underline">
                  {t(item.navKey!)}
                </Link>
              ))}
            </nav>
            <LanguageSwitcher />
            <UserMenu />
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileNavOpen(true)}
              className="app-mobile-menu-btn lg:hidden"
              aria-label="Open menu"
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-nav-drawer"
            >
              <span className="app-hamburger-bar" />
              <span className="app-hamburger-bar" />
              <span className="app-hamburger-bar" />
            </button>
          </div>
        </header>

        {/* ── Mobile nav backdrop ── */}
        {mobileNavOpen && (
          <div
            className="app-mobile-nav-overlay lg:hidden"
            onClick={closeNav}
            aria-hidden="true"
          />
        )}

        {/* ── Mobile nav drawer ── */}
        <nav
          id="mobile-nav-drawer"
          className={`app-mobile-nav-drawer lg:hidden${mobileNavOpen ? " app-mobile-nav-drawer--open" : ""}`}
          aria-label="Site navigation"
          aria-hidden={!mobileNavOpen}
        >
          <div className="app-mobile-nav-header">
            <BuddhiAlignLogo className="h-9 w-auto" />
            <button onClick={closeNav} className="app-mobile-nav-close" aria-label="Close menu">✕</button>
          </div>
          <ul className="app-mobile-nav-list">
            <li>
              <Link href="/" className="app-mobile-nav-link" onClick={closeNav}>🏠 {t("layout.home")}</Link>
            </li>
            {MODULE_CATALOG.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className="app-mobile-nav-link" onClick={closeNav}>
                  {item.icon} {t(item.titleKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Main content ── */}
        <main className="app-main-content">
          <h2 className="app-panel-title text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8 text-center px-2">
            {t(titleKey)}
          </h2>
          {children}
        </main>
      </div>
      <div className="app-backdrop-panel" />
    </div>
  );
}
