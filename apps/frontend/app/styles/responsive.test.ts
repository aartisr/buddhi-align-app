import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const stylesheet = readFileSync(resolve(__dirname, "responsive.css"), "utf8");

describe("responsive app shell styles", () => {
  it("prevents page-level horizontal overflow on narrow screens", () => {
    expect(stylesheet).toContain("overflow-x: clip;");
    expect(stylesheet).toContain("text-size-adjust: 100%;");
    expect(stylesheet).toContain(".app-main-content");
    expect(stylesheet).toContain("width: min(100%, 46rem);");
  });

  it("uses fluid grids and wrapping for app cards, records, and community surfaces", () => {
    expect(stylesheet).toContain("grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));");
    expect(stylesheet).toContain("grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));");
    expect(stylesheet).toContain("overflow-wrap: anywhere;");
    expect(stylesheet).toContain(".app-community-post-header,");
    expect(stylesheet).toContain(".app-record-card__header {");
    expect(stylesheet).toContain("flex-wrap: wrap;");
  });

  it("keeps mobile navigation and preference controls within the viewport", () => {
    expect(stylesheet).toContain("width: min(24rem, calc(100vw - env(safe-area-inset-left, 0px)));");
    expect(stylesheet).toContain("max-width: min(18rem, calc(100vw - 2rem));");
    expect(stylesheet).toContain("@media (pointer: coarse)");
    expect(stylesheet).toContain("min-height: 2.75rem;");
    expect(stylesheet).toContain(".app-mobile-nav-quick-links,");
    expect(stylesheet).toContain("grid-template-columns: 1fr;");
  });
});
