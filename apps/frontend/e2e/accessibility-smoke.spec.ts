import { expect, test } from "@playwright/test";

const publicRoutes = [
  "/",
  "/about",
  "/updates",
  "/share",
  "/support",
  "/community",
  "/karma-yoga",
  "/bhakti-journal",
  "/dhyana-meditation",
  "/jnana-reflection",
  "/vasana-tracker",
  "/dharma-planner",
  "/motivation-analytics",
];

test.describe("public-route accessibility baseline", () => {
  for (const route of publicRoutes) {
    test(`${route} provides a clear, operable document structure`, async ({ page }) => {
      await page.goto(route);

      await expect(page).toHaveTitle(/Buddhi Align/i);
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveCount(1);

      const unnamedButtons = await page.locator("button").evaluateAll((buttons) =>
        buttons.filter((button) => {
          const label = button.getAttribute("aria-label")?.trim();
          const text = button.textContent?.replace(/\s+/g, " ").trim();
          return !label && !text;
        }).length,
      );
      expect(unnamedButtons).toBe(0);

      const invalidLinks = await page.locator("a[href]").evaluateAll((links) =>
        links.filter((link) => {
          const href = link.getAttribute("href")?.trim() ?? "";
          return !href || href.toLowerCase().startsWith("javascript:");
        }).length,
      );
      expect(invalidLinks).toBe(0);

      await expect(page.locator("audio[autoplay], video[autoplay]")).toHaveCount(0);
    });
  }
});
