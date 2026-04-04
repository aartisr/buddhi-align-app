import { describe, expect, it } from "vitest";

import {
  DEFAULT_LOCALE,
  LOCALE_DEFINITIONS,
  MESSAGES,
  getIntlLocale,
  isLocale,
  resolveLocale,
  translate,
  type TranslationKey,
} from "./config";

describe("i18n config", () => {
  it("keeps every locale aligned to the English keyset", () => {
    const englishKeys = Object.keys(MESSAGES.en).sort();

    for (const locale of LOCALE_DEFINITIONS) {
      expect(Object.keys(MESSAGES[locale.code]).sort()).toEqual(englishKeys);
    }
  });

  it("resolves invalid locale values to the default locale", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("es")).toBe(false);
    expect(resolveLocale("ta")).toBe("ta");
    expect(resolveLocale("es")).toBe(DEFAULT_LOCALE);
    expect(resolveLocale(null)).toBe(DEFAULT_LOCALE);
  });

  it("uses locale-specific html lang metadata", () => {
    expect(getIntlLocale("hi")).toBe("hi-IN");
    expect(getIntlLocale("sa")).toBe("sa-IN");
  });

  it("falls back to English for untranslated keys while keeping interpolation", () => {
    const key: TranslationKey = "dashboard.quickTourTitle";
    expect(MESSAGES.hi[key]).toBe(MESSAGES.en[key]);
    expect(translate("hi", "dashboard.welcome", { name: "Aarti" })).toBe("स्वागत है, Aarti");
    expect(translate("hi", key)).toBe(MESSAGES.en[key]);
  });
});