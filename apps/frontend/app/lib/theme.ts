export const THEME_OPTIONS = [
  { code: "sattva", label: "Sattva Grove" },
  { code: "sunrise", label: "Sunrise Sand" },
  { code: "midnight", label: "Midnight Lotus" },
] as const;

export type ThemeName = (typeof THEME_OPTIONS)[number]["code"];

export const DEFAULT_THEME: ThemeName = "sattva";
export const DEFAULT_THEME_ENV = process.env.NEXT_PUBLIC_DEFAULT_THEME;

const THEME_SET = new Set<ThemeName>(THEME_OPTIONS.map((item) => item.code));

export function isThemeName(value: string): value is ThemeName {
  return THEME_SET.has(value as ThemeName);
}

export function normalizeThemeName(value: string | null | undefined): ThemeName | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return isThemeName(normalized) ? normalized : null;
}

export function resolveDefaultTheme(): ThemeName {
  return normalizeThemeName(DEFAULT_THEME_ENV) ?? DEFAULT_THEME;
}

export function themeColorScheme(theme: ThemeName): "light" | "dark" {
  return theme === "midnight" ? "dark" : "light";
}