import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const stylesheet = readFileSync(resolve(__dirname, "responsive.css"), "utf8");
const copilotStylesheet = readFileSync(resolve(__dirname, "../components/copilot/copilot.css"), "utf8");

describe("responsive app shell styles", () => {
  it("prevents page-level horizontal overflow on narrow screens", () => {
    expect(stylesheet).toContain("overflow-x: clip;");
    expect(stylesheet).toContain("text-size-adjust: 100%;");
    expect(stylesheet).toContain("max-width: 100%;");
    expect(stylesheet).toContain(".app-main-content");
    expect(stylesheet).toContain("width: min(100%, 46rem);");
  });

  it("forces media and long-form content to remain inside viewport", () => {
    expect(stylesheet).toContain("img,");
    expect(stylesheet).toContain("video,");
    expect(stylesheet).toContain("iframe {");
    expect(stylesheet).toContain("max-width: 100%;");
    expect(stylesheet).toContain("overflow-wrap: anywhere;");
    expect(stylesheet).toContain("white-space: pre-wrap;");
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

  it("adds tiny-screen and landscape-phone safeguards", () => {
    expect(stylesheet).toContain("@media (max-width: 360px)");
    expect(stylesheet).toContain(".app-module-chip {");
    expect(stylesheet).toContain("width: 100%;");
    expect(stylesheet).toContain("@media (max-height: 640px) and (max-width: 960px) and (orientation: landscape)");
    expect(stylesheet).toContain(".app-header-panel {");
    expect(stylesheet).toContain("position: static;");
  });

  it("includes embedded-webview guardrails for 320px and ultra-short screens", () => {
    expect(stylesheet).toContain("@media (max-width: 320px)");
    expect(stylesheet).toContain("grid-auto-columns: minmax(8.5rem, 1fr);");
    expect(stylesheet).toContain(".app-support-grid,");
    expect(stylesheet).toContain(".app-support-severity-grid,");
    expect(stylesheet).toContain("@media (max-height: 560px) and (max-width: 420px)");
    expect(stylesheet).toContain("padding-bottom: 2.25rem;");
  });

  it("keeps the copilot panel usable on phone and short viewports", () => {
    expect(copilotStylesheet).toContain("calc(100dvh - 9rem)");
    expect(copilotStylesheet).toContain("env(safe-area-inset-bottom, 0px)");
    expect(copilotStylesheet).toContain("grid-template-rows: auto minmax(0, 1fr) auto auto;");
    expect(copilotStylesheet).toContain("overflow-wrap: anywhere;");
    expect(copilotStylesheet).toContain("font-size: 16px;");
    expect(copilotStylesheet).toContain(".app-copilot--open .app-copilot-launcher");
    expect(copilotStylesheet).toContain("@media (max-height: 620px) and (max-width: 640px)");
  });
});
