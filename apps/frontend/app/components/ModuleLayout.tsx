"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import { ANONYMOUS_COOKIE_NAME, ANONYMOUS_COOKIE_VALUE } from "@/app/auth/anonymous";

import UserMenu from "./UserMenu";
import BuddhiAlignLogo from "./BuddhiAlignLogo";
import PreferencesMenu from "./PreferencesMenu";
import { MODULE_CATALOG, type TranslationKey } from "../i18n/config";
import { useI18n } from "../i18n/provider";

export default function ModuleLayout({ titleKey, children }: { titleKey: TranslationKey; children: React.ReactNode }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const icon = MODULE_CATALOG.find((item) => item.titleKey === titleKey)?.icon ?? "";
  const moduleByKey = new Map(MODULE_CATALOG.map((item) => [item.key, item]));
  const menuGroups = [
    {
      key: "home",
      icon: "🏠",
      label: t("nav.group.home"),
      items: [
        { key: "dashboard", icon: "🏠", href: "/", label: t("app.dashboard") },
      ],
    },
    {
      key: "practice",
      icon: "🧘",
      label: t("nav.group.practice"),
      items: (["karma", "bhakti", "dhyana"] as const).map((moduleKey) => {
        const item = moduleByKey.get(moduleKey)!;
        return {
          key: item.key,
          icon: item.icon,
          href: item.href,
          label: t(item.navKey ?? item.titleKey),
        };
      }),
    },
    {
      key: "reflection",
      icon: "💭",
      label: t("nav.group.reflection"),
      items: (["jnana", "vasana"] as const).map((moduleKey) => {
        const item = moduleByKey.get(moduleKey)!;
        return {
          key: item.key,
          icon: item.icon,
          href: item.href,
          label: t(item.navKey ?? item.titleKey),
        };
      }),
    },
    {
      key: "insights",
      icon: "📊",
      label: t("nav.group.insights"),
      items: (["dharma", "motivation"] as const).map((moduleKey) => {
        const item = moduleByKey.get(moduleKey)!;
        return {
          key: item.key,
          icon: item.icon,
          href: item.href,
          label: t(item.navKey ?? item.titleKey),
        };
      }),
    },
  ] as const;
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [desktopOpenGroup, setDesktopOpenGroup] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    setIsAnonymous(document.cookie.includes(`${ANONYMOUS_COOKIE_NAME}=${ANONYMOUS_COOKIE_VALUE}`));
  }, []);

  useEffect(() => {
    setDesktopOpenGroup(null);
    setMobileNavOpen(false);
  }, [pathname]);

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

  useEffect(() => {
    if (!desktopOpenGroup) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDesktopOpenGroup(null);
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [desktopOpenGroup]);

  const isPathActive = (href: string) => {
    if (!pathname) return href === "/";
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const closeNav = () => setMobileNavOpen(false);
  const signInHref = `/sign-in?callbackUrl=${encodeURIComponent(pathname || "/")}`;

  return (
    <div className="app-shell relative font-sans">
      {/* Skip-to-content: WCAG 2.4.1 Bypass Blocks (Level A) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-9999 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-(--primary) focus:text-white focus:font-semibold focus:text-sm"
      >
        {t("nav.skipToMain")}
      </a>
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
        <header className="app-header-panel w-full px-4 sm:px-6 py-3 sm:py-4 grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-3 relative z-40">
          <h1>
            <Link href="/" className="inline-flex items-center" aria-label={t("app.brand")}>
              <BuddhiAlignLogo className="h-10 sm:h-11 w-auto" />
            </Link>
          </h1>
          {/* Desktop centered nav */}
          <nav className="hidden md:flex items-center justify-center gap-2 text-sm font-medium app-copy app-top-nav" aria-label={t("nav.mainAria")}>
            {menuGroups.map((group) => (
              <div
                key={group.key}
                className={`app-nav-group${desktopOpenGroup === group.key ? " is-open" : ""}${group.items.some((item) => isPathActive(item.href)) ? " is-active" : ""}`}
                onMouseEnter={() => setDesktopOpenGroup(group.key)}
                onMouseLeave={() => setDesktopOpenGroup((current) => (current === group.key ? null : current))}
              >
                <button
                  type="button"
                  className="app-nav-group-trigger"
                  onClick={() => setDesktopOpenGroup((current) => (current === group.key ? null : group.key))}
                >
                  <span className="app-nav-item-icon" aria-hidden>{group.icon}</span>
                  {group.label}
                </button>
                <div className="app-nav-submenu" aria-label={group.label}>
                  {group.items.map((item) => (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={`app-nav-submenu-link${isPathActive(item.href) ? " is-active" : ""}`}
                      aria-current={isPathActive(item.href) ? "page" : undefined}
                    >
                      <span className="app-nav-item-icon" aria-hidden>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <PreferencesMenu />
            </div>
            <UserMenu />
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileNavOpen(true)}
              className="app-mobile-menu-btn md:hidden"
              aria-label={t("nav.openMenuAria")}
              aria-controls="mobile-nav-drawer"
            >
              <span className="app-hamburger-bar" />
              <span className="app-hamburger-bar" />
              <span className="app-hamburger-bar" />
            </button>
          </div>
        </header>

        {isAnonymous && (
          <div className="app-anonymous-banner px-4 sm:px-6 py-3 relative z-20" role="status" aria-live="polite">
            <div className="app-anonymous-banner-inner">
              <p className="app-anonymous-banner-copy">
                <span className="app-anonymous-banner-strong">{t("auth.anonymousBannerTitle")}</span>{" "}
                {t("auth.persistHint")}
              </p>
              <Link href={signInHref} className="app-anonymous-banner-cta">
                {t("auth.signInToSave")}
              </Link>
            </div>
          </div>
        )}

        {/* ── Mobile nav backdrop ── */}
        {mobileNavOpen && (
          <div
            className="app-mobile-nav-overlay md:hidden"
            onClick={closeNav}
            aria-hidden="true"
          />
        )}

        {/* ── Mobile nav drawer ── */}
        <nav
          id="mobile-nav-drawer"
          className={`app-mobile-nav-drawer md:hidden${mobileNavOpen ? " app-mobile-nav-drawer--open" : ""}`}
          aria-label={t("nav.siteAria")}
        >
          <div className="app-mobile-nav-header">
            <BuddhiAlignLogo className="h-9 w-auto" />
            <button onClick={closeNav} className="app-mobile-nav-close" aria-label={t("nav.closeMenuAria")}>✕</button>
          </div>
          <ul className="app-mobile-nav-list">
            <li className="app-mobile-nav-quick-links">
              <Link
                href="/"
                className={`app-mobile-nav-chip${isPathActive("/") ? " is-active" : ""}`}
                onClick={closeNav}
                aria-current={isPathActive("/") ? "page" : undefined}
              >
                <span aria-hidden>🏠</span>
                <span>{t("app.dashboard")}</span>
              </Link>
              <Link
                href="/settings"
                className={`app-mobile-nav-chip${isPathActive("/settings") ? " is-active" : ""}`}
                onClick={closeNav}
                aria-current={isPathActive("/settings") ? "page" : undefined}
              >
                <span aria-hidden>⚙️</span>
                <span>{t("app.settings.link")}</span>
              </Link>
            </li>
            {menuGroups.map((group) => (
              <li key={group.key} className="app-mobile-nav-group">
                <p className="app-mobile-nav-group-title">{group.label}</p>
                <div>
                  {group.items.map((item) => (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={`app-mobile-nav-link${isPathActive(item.href) ? " is-active" : ""}`}
                      onClick={closeNav}
                      aria-current={isPathActive(item.href) ? "page" : undefined}
                    >
                      <span className="app-nav-item-icon" aria-hidden>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </li>
            ))}
            <li className="app-mobile-nav-group app-mobile-nav-group--preferences">
              <p className="app-mobile-nav-group-title">{t("preferences.title")}</p>
              <div className="app-mobile-nav-preferences">
                <PreferencesMenu showTrigger={false} />
              </div>
            </li>
          </ul>
        </nav>

        {/* ── Main content ── */}
        <main id="main-content" className="app-main-content" tabIndex={-1}>
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
