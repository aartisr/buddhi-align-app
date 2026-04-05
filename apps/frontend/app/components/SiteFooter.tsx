
"use client";

import React from "react";
import ShishubharatiLogo from "./ShishubharatiLogo";
import PlatinumBadge from "./PlatinumBadge";
import "./site-footer.css";
import { useI18n } from "../i18n/provider";

export default function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="site-footer">
      <div className="site-footer__dedication">
        <span className="site-footer__dedication-prefix">{t("footer.dedicatedTo")}</span>
        <a
          href="https://www.shishubharati.net/"
          target="_blank"
          rel="noopener noreferrer"
          className="site-footer__logo-link"
        >
          <ShishubharatiLogo alt={t("footer.logoAlt")} />
          <span className="site-footer__logo-text">Shishubharati</span>
        </a>
        <span className="site-footer__dedication-prefix">.</span>
      </div>
      <div className="site-footer__gratitude">
        {t("footer.gratitude")}
      </div>
      <div className="site-footer__copyright">
        &copy; {new Date().getFullYear()} <a href="https://aartisr.netlify.app/" target="_blank" rel="noopener noreferrer" className="site-footer__author-link">Aarti Sri Ravikumar</a>. {t("footer.rights")}
      </div>
      <div className="site-footer__awaricon">
        <PlatinumBadge size="footer" />
        <p className="site-footer__awaricon-label">Awaricon Gold Certified</p>
      </div>
    </footer>
  );
}
