
"use client";

import React from "react";
import ShishubharatiLogo from "./ShishubharatiLogo";
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
          <span className="site-footer__logo-text">Shishubarati</span>
        </a>
        <span className="site-footer__dedication-prefix">.</span>
      </div>
      <div className="site-footer__gratitude">
        {t("footer.gratitude")}
      </div>
      <div className="site-footer__copyright">
        &copy; {new Date().getFullYear()} <a href="https://aartisr.netlify.app/" target="_blank" rel="noopener noreferrer" style={{ color: '#C72C6A', fontWeight: 500, textDecoration: 'none' }}>Aarti Sri Ravikumar</a>. {t("footer.rights")}
      </div>
    </footer>
  );
}
