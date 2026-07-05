import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type ThemeName = "sattva" | "sunrise" | "midnight";
type RGB = { r: number; g: number; b: number };

const stylesheet = readFileSync(resolve(__dirname, "theme-base.css"), "utf8");

function getBlock(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = stylesheet.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\n\\}`, "m"));
  if (!match) {
    throw new Error(`Missing theme block for selector: ${selector}`);
  }
  return match[1];
}

function parseVars(block: string): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const match of block.matchAll(/--([a-z0-9-]+):\s*([^;]+);/gi)) {
    vars[match[1]] = match[2].trim();
  }
  return vars;
}

function resolveThemeTokens(theme: ThemeName): Record<string, string> {
  const rootVars = parseVars(getBlock(":root"));
  if (theme === "sattva") {
    return rootVars;
  }

  const overrideVars = parseVars(getBlock(`:root[data-theme=\"${theme}\"]`));
  return { ...rootVars, ...overrideVars };
}

function parseHex(hex: string): RGB {
  const normalized = hex.trim().replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(normalized)) {
    throw new Error(`Expected 6-digit hex token, received: ${hex}`);
  }

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function srgbToLinear(value: number): number {
  const channel = value / 255;
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function luminance(color: RGB): number {
  return 0.2126 * srgbToLinear(color.r) + 0.7152 * srgbToLinear(color.g) + 0.0722 * srgbToLinear(color.b);
}

function contrastRatio(foreground: RGB, background: RGB): number {
  const fg = luminance(foreground);
  const bg = luminance(background);
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("theme token contrast guardrails", () => {
  const themes: ThemeName[] = ["sattva", "sunrise", "midnight"];

  const checks: Array<{ foreground: string; background: string; min: number }> = [
    { foreground: "foreground", background: "background", min: 4.5 },
    { foreground: "text-muted", background: "surface", min: 4.5 },
    { foreground: "text-soft", background: "surface", min: 4.5 },
    { foreground: "text-subtle", background: "surface", min: 4.5 },
    { foreground: "primary", background: "surface", min: 4.5 },
    { foreground: "accent", background: "surface", min: 4.5 },
    { foreground: "on-primary", background: "primary", min: 4.5 },
    { foreground: "on-primary", background: "accent", min: 4.5 },
    { foreground: "on-accent", background: "accent", min: 4.5 },
    { foreground: "on-danger", background: "danger", min: 4.5 },
    { foreground: "warning-text", background: "warning-surface", min: 4.5 },
  ];

  for (const theme of themes) {
    it(`keeps semantic text tokens AA-compliant in ${theme}`, () => {
      const tokens = resolveThemeTokens(theme);

      for (const check of checks) {
        const fg = tokens[check.foreground];
        const bg = tokens[check.background];

        expect(fg, `Missing token --${check.foreground} for ${theme}`).toBeDefined();
        expect(bg, `Missing token --${check.background} for ${theme}`).toBeDefined();

        const ratio = contrastRatio(parseHex(fg), parseHex(bg));
        expect(
          ratio,
          `Expected ${theme} contrast for --${check.foreground} on --${check.background} to be >= ${check.min}, got ${ratio.toFixed(2)}`,
        ).toBeGreaterThanOrEqual(check.min);
      }
    });
  }
});
