import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(__dirname, "contrast-overrides.css"), "utf8");
const widgetsCss = readFileSync(resolve(__dirname, "widgets.css"), "utf8");

describe("global accessible interaction defaults", () => {
  it("gives every keyboard-operable control an explicit focus treatment", () => {
    expect(css).toContain(":focus-visible");
    expect(css).toContain("outline: 3px solid var(--focus-ring) !important;");
    expect(css).toContain("box-shadow: 0 0 0 5px var(--focus-ring-offset) !important;");
  });

  it("honors higher-contrast and reduced-motion preferences", () => {
    expect(css).toContain("@media (prefers-contrast: more)");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("animation-duration: 0.01ms !important;");
  });

  it("uses semantic high-contrast colors for compact completion indicators", () => {
    expect(widgetsCss).toContain(".app-daily-ring-check {");
    expect(widgetsCss).toContain("background: var(--emerald);");
    expect(widgetsCss).toContain("color: var(--on-emerald);");
    expect(widgetsCss).toContain(".app-daily-ring-label {");
    expect(widgetsCss).toContain("color: var(--text-subtle) !important;");
  });
});
