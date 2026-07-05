
"use client";

import React from "react";
import Link from "next/link";
import ShishubharatiLogo from "./ShishubharatiLogo";
import PlatinumBadge from "./PlatinumBadge";
import "./site-footer.css";
import { useI18n } from "../i18n/provider";

export default function SiteFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="site-footer__inner">
        <div className="site-footer__orb" aria-hidden="true" />

        <div className="site-footer__grid">
          <section className="site-footer__panel site-footer__panel--brand" aria-label="Brand and dedication">
            <p className="site-footer__kicker">Refined Daily Practice Platform</p>
            <h2 className="site-footer__title">Built for focused spiritual growth.</h2>

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
                <Link href="/support" className="site-footer__link">{t("footer.support")}</Link>
              </li>
              <li>
                <Link href="/community" className="site-footer__link">Community</Link>
              </li>
            </ul>
          </nav>

          <section className="site-footer__panel site-footer__panel--trust" aria-label="Trust and indexing links">
            <h3 className="site-footer__section-heading">Trust and Discovery</h3>
            <ul className="site-footer__link-list">
              <li>
                <a href="/feed.xml" className="site-footer__link">RSS Feed</a>
              </li>
              <li>
                <a href="/sitemap.xml" className="site-footer__link">Sitemap</a>
              </li>
              <li>
                <a href="/llms.txt" className="site-footer__link">LLMs Index</a>
              </li>
              <li>
                <a href="/robots.txt" className="site-footer__link">Crawler Rules</a>
              </li>
            </ul>
          </section>
        </div>

        <div className="site-footer__meta">
          <p className="site-footer__copyright">
            &copy; {year}{" "}
            <a
              href="https://aartisr.foreverlotus.com"
              target="_blank"
              rel="noopener noreferrer"
              className="site-footer__author-link"
            >
              {t("footer.authorName")}
            </a>
            . {t("footer.rights")}
          </p>

          <div className="site-footer__awaricon">
            <p className="site-footer__awaricon-label">Certified Excellence</p>
            <PlatinumBadge size="footer" />
          </div>
        </div>
      </div>
    </footer>
  );
}
