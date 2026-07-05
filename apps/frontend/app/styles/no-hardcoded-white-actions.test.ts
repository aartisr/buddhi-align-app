import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const files = [
  "../globals.css",
  "navigation.css",
  "auth-ui.css",
  "records.css",
  "widgets.css",
  "../components/copilot/copilot.css",
  "feedback-ui.css",
];

describe("action styles avoid hardcoded white text", () => {
  for (const file of files) {
    it(`avoids #fff text color literals in ${file}`, () => {
      const css = readFileSync(resolve(__dirname, file), "utf8");
      expect(css).not.toMatch(/color:\s*#fff(?:fff)?\b/i);
    });
  }
});

describe("nav/button hover states use semantic tokens not hardcoded white", () => {
  // Specifically target hover/active states that need strong contrast
  const navigationCss = readFileSync(resolve(__dirname, "navigation.css"), "utf8");
  
  it("mobile menu button uses semantic tokens", () => {
    expect(navigationCss).not.toMatch(/\.app-mobile-menu-btn\s*{[^}]*background:\s*rgba\(\s*255\s*,\s*255\s*,\s*255/);
  });

  it("top nav menu uses semantic tokens", () => {
    expect(navigationCss).not.toMatch(/\.app-top-nav\s*{[^}]*background:\s*linear-gradient\([^)]*rgba\(\s*255\s*,\s*255\s*,\s*255[^)]*\)/);
  });

  it("nav group hover uses semantic tokens", () => {
    expect(navigationCss).not.toMatch(/\.app-nav-group:hover.*background:\s*rgba\(\s*255\s*,\s*255\s*,\s*255/);
  });
});
