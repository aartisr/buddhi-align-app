"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { ANONYMOUS_COOKIE_NAME, ANONYMOUS_COOKIE_VALUE } from "@/app/auth/anonymous";
import { logEvent } from "@/app/lib/logEvent";

import UserMenu from "./UserMenu";
import BuddhiAlignLogo from "./BuddhiAlignLogo";
import PlatinumBadge from "./PlatinumBadge";
import PreferencesMenu from "./PreferencesMenu";
import CommunityLink from "./CommunityLink";
import { MODULE_CATALOG, type TranslationKey } from "../i18n/config";
import { useI18n } from "../i18n/provider";
import {
  getAdjacentModuleKeys,
  MODULE_BY_KEY,
  MODULE_KEYS_BY_GROUP,
  RECOMMENDED_SEQUENCE,
  type RecommendedModuleKey,
} from "@/app/lib/module-navigation";

type ModuleItem = (typeof MODULE_CATALOG)[number];
type Translate = ReturnType<typeof useI18n>["t"];

type MenuItem = {
  key: string;
  icon: string;
  href: string;
  label: string;
};

type MenuGroup = {
  key: string;
  icon: string;
  label: string;
  items: MenuItem[];
};

type PathActive = (href: string) => boolean;

function DesktopNavigation({
  groups,
  desktopOpenGroup,
  setDesktopOpenGroup,
  isPathActive,
  mainAria,
}: {
  groups: MenuGroup[];
  desktopOpenGroup: string | null;
  setDesktopOpenGroup: React.Dispatch<React.SetStateAction<string | null>>;
  isPathActive: PathActive;
  mainAria: string;
}) {
  return (
    <nav className="hidden md:flex items-center justify-center gap-2 text-sm font-medium app-copy app-top-nav" aria-label={mainAria}>
      {groups.map((group) => (
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
  );
}

function AnonymousModeBanner({ t, signInHref }: { t: Translate; signInHref: string }) {
  return (
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
  );
}

function InviteArrivalBanner({
  t,
  moduleLabel,
  moduleKey,
  startHref,
}: {
  t: Translate;
  moduleLabel?: string;
  moduleKey?: string;
  startHref?: string;
}) {
  return (
    <div className="px-4 sm:px-6 py-3 relative z-20" role="status" aria-live="polite">
      <div className="app-surface-card max-w-4xl mx-auto p-3 sm:p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold app-copy">{t("invite.welcomeTitle")}</p>
          <p className="text-xs app-copy-soft mt-1">
            {moduleLabel
              ? t("invite.welcomeBodyWithModule", { module: moduleLabel })
              : t("invite.welcomeBody")}
          </p>
        </div>
        {startHref ? (
          <Link
            href={startHref}
            className="app-anonymous-banner-cta self-start sm:self-auto"
            onClick={() => {
              logEvent("invite_start_now_clicked", {
                module: moduleKey,
                startHref,
              });
            }}
          >
            {t("invite.startNow")}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function MobileNavigation({
  t,
  mobileNavOpen,
  closeNav,
  groups,
  isPathActive,
}: {
  t: Translate;
  mobileNavOpen: boolean;
  closeNav: () => void;
  groups: MenuGroup[];
  isPathActive: PathActive;
}) {
  return (
    <>
      {mobileNavOpen && (
        <div className="app-mobile-nav-overlay md:hidden" onClick={closeNav} aria-hidden="true" />
      )}
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
          {groups.map((group) => (
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
            <p className="app-mobile-nav-group-title">{t("app.settings.link")}</p>
            <div className="app-mobile-nav-preferences">
              <PreferencesMenu showTrigger={false} />
            </div>
          </li>
        </ul>
      </nav>
    </>
  );
}

function FlowRail({
  t,
  currentModule,
  getModuleLabel,
}: {
  t: Translate;
  currentModule: ModuleItem | null;
  getModuleLabel: (moduleItem: ModuleItem) => string;
}) {
  return (
    <nav className="app-flow-rail" aria-label={t("nav.flowRailAria")}>
      <p className="app-flow-rail-label">{t("nav.flowRailLabel")}</p>
      <div className="app-flow-rail-track">
        {RECOMMENDED_SEQUENCE.map((moduleKey, index) => {
          const moduleItem = MODULE_BY_KEY.get(moduleKey);
          if (!moduleItem) return null;
          const isCurrent = moduleItem.key === currentModule?.key;

          return (
            <Link
              key={moduleItem.key}
              href={moduleItem.href}
              className={`app-flow-rail-chip${isCurrent ? " is-current" : ""}`}
              aria-current={isCurrent ? "page" : undefined}
            >
              <span className="app-flow-rail-chip-index" aria-hidden>{index + 1}</span>
              <span aria-hidden>{moduleItem.icon}</span>
              <span>{getModuleLabel(moduleItem)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function SequenceNavigation({
  t,
  sequenceIndex,
  previousModule,
  nextModule,
  getModuleLabel,
}: {
  t: Translate;
  sequenceIndex: number;
  previousModule: ModuleItem | null;
  nextModule: ModuleItem | null;
  getModuleLabel: (moduleItem: ModuleItem) => string;
}) {
  return (
    <nav className="app-sequence-nav" aria-label={t("nav.sequenceAria")}>
      <div className="app-sequence-nav-header">
        <p className="app-sequence-nav-eyebrow">{t("nav.sequenceLabel")}</p>
        <div className="app-sequence-nav-copy">
          <p>{t("nav.sequenceHint")}</p>
          <p>{t("nav.sequenceProgress", { current: sequenceIndex + 1, total: RECOMMENDED_SEQUENCE.length })}</p>
        </div>
      </div>
      <div className="app-sequence-nav-grid">
        {previousModule ? (
          <Link
            href={previousModule.href}
            className="app-sequence-card"
            aria-label={`${t("nav.previous")}: ${getModuleLabel(previousModule)}`}
          >
            <span className="app-sequence-card-label">{t("nav.previous")}</span>
            <span className="app-sequence-card-title">
              <span aria-hidden>{previousModule.icon}</span>
              <span>{getModuleLabel(previousModule)}</span>
            </span>
            <span className="app-sequence-card-description">{t(previousModule.descriptionKey)}</span>
          </Link>
        ) : (
          <div className="app-sequence-card app-sequence-card--placeholder" aria-hidden="true" />
        )}
        {nextModule ? (
          <Link
            href={nextModule.href}
            className="app-sequence-card app-sequence-card--next"
            aria-label={`${t("nav.next")}: ${getModuleLabel(nextModule)}`}
          >
            <span className="app-sequence-card-label">{t("nav.next")}</span>
            <span className="app-sequence-card-title">
              <span aria-hidden>{nextModule.icon}</span>
              <span>{getModuleLabel(nextModule)}</span>
            </span>
            <span className="app-sequence-card-description">{t(nextModule.descriptionKey)}</span>
          </Link>
        ) : (
          <div className="app-sequence-card app-sequence-card--placeholder" aria-hidden="true" />
        )}
      </div>
    </nav>
  );
}

export default function ModuleLayout({ titleKey, children }: { titleKey: TranslationKey; children: React.ReactNode }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentModule = MODULE_CATALOG.find((item) => item.titleKey === titleKey) ?? null;
  const icon = currentModule?.icon ?? "";
  const { sequenceIndex, previousModuleKey, nextModuleKey } = getAdjacentModuleKeys(currentModule?.key);
  const previousModule = previousModuleKey ? MODULE_BY_KEY.get(previousModuleKey) ?? null : null;
  const nextModule = nextModuleKey ? MODULE_BY_KEY.get(nextModuleKey) ?? null : null;

  const menuGroups = useMemo(() => {
    const mapModuleLinks = (keys: readonly RecommendedModuleKey[]) =>
      keys
        .map((moduleKey) => MODULE_BY_KEY.get(moduleKey))
        .filter((item): item is ModuleItem => Boolean(item))
        .map((item) => ({
          key: item.key,
          icon: item.icon,
          href: item.href,
          label: t(item.navKey ?? item.titleKey),
        }));

    return [
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
        items: mapModuleLinks(MODULE_KEYS_BY_GROUP.practice),
      },
      {
        key: "reflection",
        icon: "💭",
        label: t("nav.group.reflection"),
        items: mapModuleLinks(MODULE_KEYS_BY_GROUP.reflection),
      },
      {
        key: "insights",
        icon: "📊",
        label: t("nav.group.insights"),
        items: mapModuleLinks(MODULE_KEYS_BY_GROUP.insights),
      },
    ] as MenuGroup[];
  }, [t]);
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

  const isPathActive = useCallback((href: string) => {
    if (!pathname) return href === "/";
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }, [pathname]);

  const getModuleLabel = (moduleItem: ModuleItem) => t(moduleItem.navKey ?? moduleItem.titleKey);

  const closeNav = () => setMobileNavOpen(false);
  const currentPathWithSearch = `${pathname || "/"}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
  const signInHref = `/sign-in?callbackUrl=${encodeURIComponent(currentPathWithSearch)}`;
  const isInviteArrival = searchParams?.get("source") === "invite";
  const inviteModule = searchParams?.get("module")?.trim();
  const inviteModuleItem = inviteModule
    ? MODULE_BY_KEY.get(inviteModule as RecommendedModuleKey)
    : null;
  const inviteStartModule = inviteModuleItem ?? currentModule;
  const inviteStartHref = inviteStartModule ? `${inviteStartModule.href}#quick-start-form` : undefined;

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
          <div className="app-brand-lockup">
            <h1>
              <Link href="/" className="inline-flex items-center" aria-label={t("app.brand")}>
                <BuddhiAlignLogo className="h-10 sm:h-11 w-auto" />
              </Link>
            </h1>
            <PlatinumBadge />
          </div>
          <DesktopNavigation
            groups={menuGroups}
            desktopOpenGroup={desktopOpenGroup}
            setDesktopOpenGroup={setDesktopOpenGroup}
            isPathActive={isPathActive}
            mainAria={t("nav.mainAria")}
          />
          <div className="flex items-center gap-1.5 sm:gap-3 justify-self-end min-w-0">
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

        {isAnonymous ? <AnonymousModeBanner t={t} signInHref={signInHref} /> : null}
        {isInviteArrival ? (
          <InviteArrivalBanner
            t={t}
            moduleLabel={inviteStartModule ? getModuleLabel(inviteStartModule) : undefined}
            moduleKey={inviteStartModule?.key}
            startHref={inviteStartHref}
          />
        ) : null}

        <MobileNavigation
          t={t}
          mobileNavOpen={mobileNavOpen}
          closeNav={closeNav}
          groups={menuGroups}
          isPathActive={isPathActive}
        />

        {/* ── Main content ── */}
        <main id="main-content" className="app-main-content" tabIndex={-1}>
          <h2 className="app-panel-title text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8 text-center px-2">
            {t(titleKey)}
          </h2>
          {currentModule ? (
            <div className="flex justify-center mb-4">
              <CommunityLink moduleKey={currentModule.key} />
            </div>
          ) : null}
          {sequenceIndex >= 0 ? (
            <FlowRail t={t} currentModule={currentModule} getModuleLabel={getModuleLabel} />
          ) : null}
          {children}
          {sequenceIndex >= 0 && (previousModule || nextModule) ? (
            <SequenceNavigation
              t={t}
              sequenceIndex={sequenceIndex}
              previousModule={previousModule}
              nextModule={nextModule}
              getModuleLabel={getModuleLabel}
            />
          ) : null}
        </main>
      </div>
      <div className="app-backdrop-panel" />
    </div>
  );
}
