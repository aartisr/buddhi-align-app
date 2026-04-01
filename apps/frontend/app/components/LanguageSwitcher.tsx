"use client";

import React from "react";
import { useI18n } from "../i18n/provider";
import type { Locale } from "../i18n/config";

export default function LanguageSwitcher() {
  const { locale, locales, setLocale, t } = useI18n();

  return (
    <label className="flex items-center gap-2 text-xs sm:text-sm app-language-switcher">
      <span>{t("app.language")}</span>
      <select
        className="rounded-md px-2 py-1 text-xs sm:text-sm app-language-switcher__select"
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        aria-label={t("app.language")}
      >
        {locales.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
