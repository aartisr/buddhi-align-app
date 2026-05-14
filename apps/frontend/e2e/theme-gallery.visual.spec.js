const { test, expect } = require("@playwright/test");

const activeThemes = ["sattva", "sunrise", "midnight"];

test.describe("theme gallery visual regression", () => {
  for (const activeTheme of activeThemes) {
    test(`matches theme gallery for active ${activeTheme} theme`, async ({ page }) => {
      await page.goto(`/?theme=${activeTheme}`);

      await page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation: none !important;
            transition: none !important;
            caret-color: transparent !important;
          }
        `,
      });

      const gallery = page.locator(".app-theme-gallery");
      await expect(gallery).toBeVisible();

      await expect(gallery).toHaveScreenshot(`theme-gallery-${activeTheme}.png`, {
        animations: "disabled",
        caret: "hide",
      });
    });

    test(`matches interactive state for active ${activeTheme} theme`, async ({ page }) => {
      await page.goto(`/?theme=${activeTheme}`);

      await page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation: none !important;
            transition: none !important;
            caret-color: transparent !important;
          }
        `,
      });

      const gallery = page.locator(".app-theme-gallery");
      await expect(gallery).toBeVisible();

      const midnightLink = page.locator(".app-theme-card--midnight .app-guided-flow-link").first();
      await midnightLink.hover();
      await midnightLink.focus();

      await expect(gallery).toHaveScreenshot(`theme-gallery-${activeTheme}-interactive.png`, {
        animations: "disabled",
        caret: "hide",
      });
    });
  }
});
