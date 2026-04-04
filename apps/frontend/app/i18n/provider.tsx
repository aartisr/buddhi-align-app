"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_LOCALE,
  getIntlLocale,
  LOCALE_OPTIONS,
  MODULE_CATALOG,
  type Locale,
  resolveLocale,
  type TranslationKey,
  translate,
} from "./config";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  locales: typeof LOCALE_OPTIONS;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "buddhi-align-locale";

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  return resolveLocale(window.localStorage.getItem(STORAGE_KEY));
}

function syncDocumentLanguage(locale: Locale) {
  document.documentElement.lang = getIntlLocale(locale);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const storedLocale = readStoredLocale();
    setLocaleState(storedLocale);
    syncDocumentLanguage(storedLocale);
  }, []);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
      syncDocumentLanguage(nextLocale);
    }
  };

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, vars) => translate(locale, key, vars),
      locales: LOCALE_OPTIONS,
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}

export function useLocalizedModules() {
  const { t } = useI18n();
  return MODULE_CATALOG.map((item) => ({
    key: item.key,
    icon: item.icon,
    href: item.href,
    title: t(item.titleKey),
    description: t(item.descriptionKey),
    navLabel: item.navKey ? t(item.navKey) : t(item.titleKey),
  }));
}
