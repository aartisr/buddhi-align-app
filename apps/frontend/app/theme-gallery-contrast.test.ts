import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type RGB = { r: number; g: number; b: number };

const globalsCss = readFileSync(resolve(__dirname, "globals.css"), "utf8");

function getThemeCardBlock(themeCode: "sattva" | "sunrise" | "midnight"): string {
  const match = globalsCss.match(new RegExp(`\\.app-theme-card--${themeCode}\\s*\\{([\\s\\S]*?)\\}`, "m"));
  if (!match) {
    throw new Error(`Missing .app-theme-card--${themeCode} block`);
  }
  return match[1];
}

function getToken(block: string, token: string): string {
  const match = block.match(new RegExp(`--${token}:\\s*([^;]+);`));
  if (!match) {
    throw new Error(`Missing token --${token}`);
  }
  return match[1].trim();
}

function parseHex(value: string): RGB {
  const hex = value.trim().replace("#", "");
  if (hex.length !== 6) {
    throw new Error(`Expected 6-digit hex, got: ${value}`);
  }
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  };
}

function parseRgba(value: string): { rgb: RGB; alpha: number } {
  const match = value.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/i);
  if (!match) {
    throw new Error(`Expected rgba(), got: ${value}`);
  }
  return {
    rgb: {
      r: Number.parseInt(match[1], 10),
      g: Number.parseInt(match[2], 10),
      b: Number.parseInt(match[3], 10),
    },
    alpha: Number.parseFloat(match[4]),
  };
}

function compositeOver(foreground: RGB, alpha: number, background: RGB): RGB {
  return {
    r: Math.round(foreground.r * alpha + background.r * (1 - alpha)),
    g: Math.round(foreground.g * alpha + background.g * (1 - alpha)),
    b: Math.round(foreground.b * alpha + background.b * (1 - alpha)),
  };
}

function srgbChannelToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(color: RGB): number {
  return (
    0.2126 * srgbChannelToLinear(color.r) +
    0.7152 * srgbChannelToLinear(color.g) +
    0.0722 * srgbChannelToLinear(color.b)
  );
}

function contrastRatio(a: RGB, b: RGB): number {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getGradientStops(block: string): [string, string] {
  const match = block.match(/background:\s*linear-gradient\([^,]+,\s*(rgba\([^)]*\))\s*0%\s*,\s*(rgba\([^)]*\))\s*100%\s*\)/i);
  if (!match) {
    throw new Error("Expected linear-gradient with 0% and 100% rgba stops");
  }
  return [match[1], match[2]];
}

describe("theme gallery contrast guardrails", () => {
  const backgroundBaseByTheme: Record<"sattva" | "sunrise" | "midnight", RGB> = {
    sattva: parseHex("#f2f6f1"),
    sunrise: parseHex("#fbf2e9"),
    midnight: parseHex("#0f1d19"),
  };

  ([
    "sattva",
    "sunrise",
    "midnight",
  ] as const).forEach((themeCode) => {
    it(`keeps title/copy/link text at AA contrast for ${themeCode} theme preview card`, () => {
      const block = getThemeCardBlock(themeCode);
      const title = parseHex(getToken(block, "theme-card-title"));
      const copy = parseHex(getToken(block, "theme-card-copy"));
      const link = parseHex(getToken(block, "theme-card-link"));
      const hoverSurface = parseRgba(getToken(block, "theme-card-link-hover-surface"));
      const [startRgba, endRgba] = getGradientStops(block);
      const start = parseRgba(startRgba);
      const end = parseRgba(endRgba);
      const base = backgroundBaseByTheme[themeCode];

      const effectiveStart = compositeOver(start.rgb, start.alpha, base);
      const effectiveEnd = compositeOver(end.rgb, end.alpha, base);
      const hoverStart = compositeOver(hoverSurface.rgb, hoverSurface.alpha, effectiveStart);
      const hoverEnd = compositeOver(hoverSurface.rgb, hoverSurface.alpha, effectiveEnd);

      for (const foreground of [title, copy, link]) {
        expect(contrastRatio(foreground, effectiveStart)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(foreground, effectiveEnd)).toBeGreaterThanOrEqual(4.5);
      }

      expect(contrastRatio(link, hoverStart)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(link, hoverEnd)).toBeGreaterThanOrEqual(4.5);
    });
  });

  it("styles theme card action links with explicit default and hover/focus tokens", () => {
    expect(globalsCss).toContain(".app-theme-card .app-guided-flow-link {");
    expect(globalsCss).toContain("border: 1px solid var(--theme-card-link-border);");
    expect(globalsCss).toContain("background: var(--theme-card-link-surface);");
    expect(globalsCss).toContain(".app-theme-card .app-guided-flow-link:hover,");
    expect(globalsCss).toContain("background: var(--theme-card-link-hover-surface);");
    expect(globalsCss).toContain("box-shadow: 0 0 0 3px var(--theme-card-link-focus-ring);");
  });
});
