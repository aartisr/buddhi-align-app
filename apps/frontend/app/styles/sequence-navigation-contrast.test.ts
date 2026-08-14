import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const stylesheet = readFileSync(resolve(__dirname, "../globals.css"), "utf8");
const layout = readFileSync(resolve(__dirname, "../components/ModuleLayout.tsx"), "utf8");

describe("sequence navigation contrast and orientation", () => {
  it("uses theme-aware surfaces for previous and next cards", () => {
    expect(stylesheet).toContain("background: linear-gradient(145deg, var(--surface-strong) 0%, var(--surface-soft) 100%);");
    expect(stylesheet).toContain("color-mix(in srgb, var(--surface-strong) 88%, var(--gold))");
    expect(stylesheet).toContain("box-shadow: 0 16px 36px var(--chrome-shadow);");
    expect(stylesheet).toContain("border-color: var(--border-strong);");
  });

  it("makes direction apparent without adding spoken noise", () => {
    expect(layout).toContain('<span aria-hidden="true">←</span>');
    expect(layout).toContain('<span aria-hidden="true">→</span>');
    expect(layout).toContain('aria-label={`${t("nav.previous")}: ${getModuleLabel(previousModule)}`}');
    expect(layout).toContain('aria-label={`${t("nav.next")}: ${getModuleLabel(nextModule)}`}');
  });
});
