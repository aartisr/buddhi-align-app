import { normalizeThemeName, resolveDefaultTheme, type ThemeName } from "./theme";

type SocialThemePalette = {
  heroGradient: string;
  canvasGradient: string;
  panelBackground: string;
  panelText: string;
  chipBorder: string;
  chipText: string;
  accent: string;
  brandAccent: string;
  bodyText: string;
};

const SOCIAL_THEME_PALETTES: Record<ThemeName, SocialThemePalette> = {
  sattva: {
    heroGradient: "linear-gradient(160deg, #174437 0%, #244d42 62%, #a85b6a 100%)",
    canvasGradient: "linear-gradient(135deg, #fbfdf8 0%, #fff6e3 52%, #e9f4ef 100%)",
    panelBackground: "#fbfdf8",
    panelText: "#17362d",
    chipBorder: "rgba(36, 77, 66, 0.22)",
    chipText: "#244d42",
    accent: "#dec48f",
    brandAccent: "#a85b6a",
    bodyText: "#31463f",
  },
  sunrise: {
    heroGradient: "linear-gradient(160deg, #7b2f14 0%, #8a3f1f 58%, #c17a2e 100%)",
    canvasGradient: "linear-gradient(135deg, #fff8ef 0%, #ffe8cb 48%, #f4ead5 100%)",
    panelBackground: "#fff7ee",
    panelText: "#3a2a1f",
    chipBorder: "rgba(138, 63, 31, 0.24)",
    chipText: "#8a3f1f",
    accent: "#d6a85b",
    brandAccent: "#bc6c25",
    bodyText: "#5b4332",
  },
  midnight: {
    heroGradient: "linear-gradient(160deg, #0f1d19 0%, #1d3a31 58%, #2e6754 100%)",
    canvasGradient: "linear-gradient(135deg, #0f1d19 0%, #152c24 50%, #1a3a30 100%)",
    panelBackground: "#101f1a",
    panelText: "#deebe5",
    chipBorder: "rgba(159, 211, 188, 0.32)",
    chipText: "#9fd3bc",
    accent: "#e5cf9f",
    brandAccent: "#d0a39a",
    bodyText: "#cdddd5",
  },
};

export function resolveSocialImageTheme(theme: string | null | undefined): ThemeName {
  return normalizeThemeName(theme) ?? resolveDefaultTheme();
}

export function getSocialThemePalette(theme: ThemeName): SocialThemePalette {
  return SOCIAL_THEME_PALETTES[theme];
}

export function themedOpenGraphImagePath(theme: ThemeName): string {
  return `/og/${theme}/opengraph-image`;
}

export function themedTwitterImagePath(theme: ThemeName): string {
  return `/social/twitter/${theme}/twitter-image`;
}