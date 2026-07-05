export const THEME_OPTIONS = [
  { code: "sattva", label: "Sattva Grove" },
  { code: "sunrise", label: "Sunrise Sand" },
  { code: "midnight", label: "Midnight Lotus" },
] as const;

export const SEASONAL_THEME_OPTIONS = [
  { code: "vernal", label: "Vernal Bloom" },
  { code: "solstice", label: "Solstice Glow" },
  { code: "harvest", label: "Harvest Ember" },
  { code: "stillness", label: "Stillness Night" },
] as const;

export type ThemeName = (typeof THEME_OPTIONS)[number]["code"];
export type SeasonalThemeName = (typeof SEASONAL_THEME_OPTIONS)[number]["code"];

export const DEFAULT_THEME: ThemeName = "sattva";
export const DEFAULT_THEME_ENV = process.env.NEXT_PUBLIC_DEFAULT_THEME;
export const DEFAULT_SEASONAL_THEME_ENV = process.env.NEXT_PUBLIC_SEASONAL_THEME_VARIANT;

const THEME_SET = new Set<ThemeName>(THEME_OPTIONS.map((item) => item.code));
const SEASONAL_THEME_SET = new Set<SeasonalThemeName>(SEASONAL_THEME_OPTIONS.map((item) => item.code));

export function isThemeName(value: string): value is ThemeName {
  return THEME_SET.has(value as ThemeName);
}

export function isSeasonalThemeName(value: string): value is SeasonalThemeName {
  return SEASONAL_THEME_SET.has(value as SeasonalThemeName);
}

export function normalizeThemeName(value: string | null | undefined): ThemeName | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return isThemeName(normalized) ? normalized : null;
}

export function normalizeSeasonalThemeName(value: string | null | undefined): SeasonalThemeName | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return isSeasonalThemeName(normalized) ? normalized : null;
}

export function resolveDefaultTheme(): ThemeName {
  return normalizeThemeName(DEFAULT_THEME_ENV) ?? DEFAULT_THEME;
}

export function resolveSeasonalThemeByDate(now = new Date()): SeasonalThemeName {
  const month = now.getMonth() + 1;
  if (month >= 3 && month <= 5) return "vernal";
  if (month >= 6 && month <= 8) return "solstice";
  if (month >= 9 && month <= 11) return "harvest";
  return "stillness";
}

export function resolveDefaultSeasonalTheme(now = new Date()): SeasonalThemeName | null {
  const env = DEFAULT_SEASONAL_THEME_ENV?.trim().toLowerCase();
  if (!env || env === "auto") {
    return resolveSeasonalThemeByDate(now);
  }

  if (env === "off" || env === "none") {
    return null;
  }

  return normalizeSeasonalThemeName(env) ?? resolveSeasonalThemeByDate(now);
}

export function themeColorScheme(theme: ThemeName): "light" | "dark" {
  return theme === "midnight" ? "dark" : "light";
}