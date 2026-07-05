import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type RGB = { r: number; g: number; b: number };

function parseHex(value: string): RGB {
  const normalized = value.trim().replace("#", "");
  const hex = normalized.length === 3
    ? normalized.split("").map((digit) => digit + digit).join("")
    : normalized;

  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  };
}

function parseRgbaToRgb(value: string): RGB {
  const parts = value
    .replace("rgba(", "")
    .replace(")", "")
    .split(",")
    .map((part) => part.trim());

  return {
    r: Number.parseInt(parts[0], 10),
    g: Number.parseInt(parts[1], 10),
    b: Number.parseInt(parts[2], 10),
  };
}

function relativeLuminance(color: RGB): number {
  const channel = (component: number) => {
    const sRgb = component / 255;
    return sRgb <= 0.03928 ? sRgb / 12.92 : ((sRgb + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
}

function contrastRatio(foreground: RGB, background: RGB): number {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("anonymous banner contrast", () => {
  const stylesheet = readFileSync(require.resolve("./widgets.css"), "utf8");

  it("keeps banner copy text at AA contrast on both gradient endpoints", () => {
    const copyColorMatch = stylesheet.match(/\.app-anonymous-banner-copy\s*\{[\s\S]*?color:\s*(#[0-9a-fA-F]{3,6});/);
    expect(copyColorMatch).toBeTruthy();

    const bannerBackgroundMatch = stylesheet.match(/\.app-anonymous-banner\s*\{[\s\S]*?background:\s*linear-gradient\([^,]+,\s*(rgba\([^)]+\))\s*0%,\s*(rgba\([^)]+\))\s*100%\);/);
    expect(bannerBackgroundMatch).toBeTruthy();

    const textColor = parseHex(copyColorMatch![1]);
    const startColor = parseRgbaToRgb(bannerBackgroundMatch![1]);
    const endColor = parseRgbaToRgb(bannerBackgroundMatch![2]);

    expect(contrastRatio(textColor, startColor)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(textColor, endColor)).toBeGreaterThanOrEqual(4.5);
  });
});
