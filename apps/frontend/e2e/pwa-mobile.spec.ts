import { devices, expect, test } from "@playwright/test";

test.use({ ...devices["Pixel 5"] });

test.describe("mobile PWA baseline", () => {
  test("publishes an installable manifest and provides an offline fallback", async ({ page, context }) => {
    const manifestResponse = await page.goto("/manifest.webmanifest");
    expect(manifestResponse?.ok()).toBe(true);
    const manifest = await manifestResponse?.json();
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons.some((icon: { purpose?: string }) => icon.purpose === "maskable")).toBe(true);
    expect(manifest.shortcuts.some((shortcut: { url: string }) => shortcut.url === "/dharma-planner")).toBe(true);

    await page.goto("/");
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

    const registration = await page.evaluate(async () => {
      const worker = await navigator.serviceWorker.getRegistration();
      return { active: Boolean(worker?.active), scope: worker?.scope };
    });
    expect(registration.active).toBe(true);
    expect(registration.scope).toContain("127.0.0.1:3100/");

    await context.setOffline(true);
    await page.goto("/pwa-offline-verification", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "A quiet pause, not a dead end." })).toBeVisible();
  });
});
