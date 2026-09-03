
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ShishubharatiLogo from "./ShishubharatiLogo";
import PlatinumBadge from "./PlatinumBadge";
import "./site-footer.css";
import { useI18n } from "../i18n/provider";
import { PWA_REQUEST_INSTALL_EVENT, PWA_STATE_EVENT } from "./pwa/PwaProvider";

type PwaFooterState = {
  canInstall: boolean;
  isStandalone: boolean;
};

const INITIAL_PWA_STATE: PwaFooterState = { canInstall: false, isStandalone: false };

function isAppleMobile() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export default function SiteFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  const [pwa, setPwa] = useState<PwaFooterState>(INITIAL_PWA_STATE);
  const [guideOpen, setGuideOpen] = useState(false);
  const [appleMobile, setAppleMobile] = useState(false);

  useEffect(() => {
    setAppleMobile(isAppleMobile());
    setPwa((current) => ({
      ...current,
      isStandalone: window.matchMedia("(display-mode: standalone)").matches
        || (window.navigator as Navigator & { standalone?: boolean }).standalone === true,
    }));
    const onPwaState = (event: Event) => {
      setPwa((event as CustomEvent<PwaFooterState>).detail);
    };
    window.addEventListener(PWA_STATE_EVENT, onPwaState);
    return () => window.removeEventListener(PWA_STATE_EVENT, onPwaState);
  }, []);

  const requestInstall = () => {
    if (pwa.canInstall) {
      window.dispatchEvent(new Event(PWA_REQUEST_INSTALL_EVENT));
      return;
    }
    setGuideOpen(true);
  };

  const closeInstallGuideOnEscape = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") setGuideOpen(false);
  };

  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="site-footer__inner">
        <div className="site-footer__orb" aria-hidden="true" />

        <div className="site-footer__grid">
          <section className="site-footer__panel site-footer__panel--brand" aria-label="Brand and dedication">
            <p className="site-footer__kicker">A welcoming space for daily practice</p>
            <h2 className="site-footer__title">A gentle companion for reflection, service, and shared growth.</h2>

            <p className="site-footer__dedication-line">
              <span className="site-footer__dedication-prefix">{t("footer.dedicatedTo")}</span>
              <a
                href="https://www.shishubharati.net/"
                target="_blank"
                rel="noopener noreferrer"
                className="site-footer__logo-link"
              >
                <ShishubharatiLogo alt={t("footer.logoAlt")} />
                <span className="site-footer__logo-text">{t("footer.schoolName")}</span>
              </a>
            </p>

            <p className="site-footer__gratitude">
              <Link href="/autograph-exchange" className="site-footer__author-link">
                {t("footer.gratitude")}
              </Link>
            </p>
          </section>

          <nav className="site-footer__panel site-footer__panel--nav" aria-label="Footer quick links">
            <h3 className="site-footer__section-heading">Explore</h3>
            <ul className="site-footer__link-list">
              <li>
                <Link href="/about" className="site-footer__link">About</Link>
              </li>
              <li>
                <Link href="/updates" className="site-footer__link">Updates</Link>
              </li>
              <li>
                <Link href="/practice-guide" className="site-footer__link">7-Day Practice Guide</Link>
              </li>
              <li>
                <Link href="/resources" className="site-footer__link">Free Resources</Link>
              </li>
              <li>
                <Link href="/support" className="site-footer__link">{t("footer.support")}</Link>
              </li>
              <li>
                <Link href="/community" className="site-footer__link">Community</Link>
              </li>
            </ul>
          </nav>

          <section className="site-footer__panel site-footer__panel--install" aria-labelledby="footer-install-title">
            <div className="site-footer__install-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 17.5v1A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5v-1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="site-footer__install-copy">
              <p className="site-footer__kicker">Your practice, within reach</p>
              <h3 id="footer-install-title" className="site-footer__install-title">
                {pwa.isStandalone ? "Buddhi Align is installed" : "Install Buddhi Align"}
              </h3>
              <p className="site-footer__install-description">
                {pwa.isStandalone
                  ? "You’re enjoying the focused app experience."
                  : "Keep a calm, full-screen practice space one tap away — with offline support when you need it."}
              </p>
            </div>
            {!pwa.isStandalone ? (
              <button type="button" className="site-footer__install-button" onClick={requestInstall}>
                <span>{pwa.canInstall ? "Install app" : "How to Install in Safari"}</span>
                <span aria-hidden="true">→</span>
              </button>
            ) : <span className="site-footer__installed-status">Installed</span>}
          </section>

        </div>

        <div className="site-footer__meta">
          <p className="site-footer__copyright">
            &copy; {year}{" "}
            <a
              href="https://ai-aarti.com"
              target="_blank"
              rel="noopener noreferrer"
              className="site-footer__author-link"
            >
              {t("footer.authorName")}
            </a>
            . {t("footer.rights")}
          </p>

          <details className="site-footer__utility">
            <summary>Technical resources</summary>
            <div className="site-footer__utility-links">
              <a href="/feed.xml">RSS feed</a>
              <a href="/sitemap.xml">Sitemap</a>
              <a href="/llms.txt">LLMs index</a>
              <a href="/robots.txt">Crawler rules</a>
            </div>
          </details>

          <div className="site-footer__awaricon">
            <p className="site-footer__awaricon-label">Certified Excellence</p>
            <PlatinumBadge size="footer" />
          </div>

          <div className="site-footer__badge-cluster" aria-label="External product badges">
            <a
              className="site-footer__product-hunt"
              href="https://www.producthunt.com/products/a-gentle-practice-for-today?embed=true&amp;utm_source=badge-featured&amp;utm_medium=badge&amp;utm_campaign=badge-a-gentle-practice-for-today"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="A gentle practice for today on Product Hunt"
            >
              <img
                alt="A gentle practice for today - Decide. Do. Reflect. | Product Hunt"
                width="250"
                height="54"
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1237397&amp;theme=light&amp;t=1788270937596"
              />
            </a>

            <a
              className="site-footer__launchnest"
              href="https://launchnest.io/p/buddhi-align"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Buddhi Align on LaunchNest"
            >
              <img
                src="https://launchnest.io/badge/buddhi-align.svg?variant=listed"
                alt="Buddhi Align on LaunchNest"
                width="220"
                height="56"
              />
            </a>
          </div>
        </div>
      </div>

      {guideOpen ? (
        <div className="site-footer__install-dialog-backdrop" role="presentation" onMouseDown={() => setGuideOpen(false)}>
          <section
            className="site-footer__install-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-guide-title"
            onMouseDown={(event) => event.stopPropagation()}
            onKeyDown={closeInstallGuideOnEscape}
          >
            <button type="button" autoFocus className="site-footer__install-dialog-close" onClick={() => setGuideOpen(false)} aria-label="Close install instructions">×</button>
            <p className="site-footer__kicker">Install Buddhi Align</p>
            <h2 id="install-guide-title">A focused space is one tap away.</h2>
            {appleMobile ? (
              <ol>
                <li>Tap the Share button in Safari.</li>
                <li>Choose <strong>Add to Home Screen</strong>.</li>
                <li>Tap <strong>Add</strong> to keep Buddhi Align close.</li>
              </ol>
            ) : (
              <ol>
                <li>Open your browser menu (⋮ or ⋯).</li>
                <li>Select <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
                <li>Confirm to add Buddhi Align to your device.</li>
              </ol>
            )}
            <p className="site-footer__install-dialog-note">Once installed, Buddhi Align opens in its own calm, app-like window.</p>
            <button type="button" className="site-footer__install-dialog-done" onClick={() => setGuideOpen(false)}>Done</button>
          </section>
        </div>
      ) : null}
    </footer>
  );
}
