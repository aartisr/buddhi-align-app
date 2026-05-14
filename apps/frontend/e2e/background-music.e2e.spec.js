const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("buddhi-align-music-control-visible", "true");

    Object.defineProperty(HTMLMediaElement.prototype, "play", {
      configurable: true,
      writable: true,
      value: function playStub() {
        this.dispatchEvent(new Event("play"));
        return Promise.resolve();
      },
    });

    Object.defineProperty(HTMLMediaElement.prototype, "pause", {
      configurable: true,
      writable: true,
      value: function pauseStub() {
        this.dispatchEvent(new Event("pause"));
      },
    });
  });
});

test("uses configured track and supports play/pause flow", async ({ page }) => {
  await page.goto("/");

  const panel = page.locator(".app-music-panel");
  await expect(panel).toBeVisible();

  const audio = panel.locator("audio");
  await expect(audio).toHaveAttribute("src", /\/audio\/e2e-track\.mp3$/);

  const button = panel.locator(".app-music-button");
  const status = panel.locator(".app-music-status");

  await expect(status).toContainText(/Playing|Loading audio\.\.\./);

  await button.click();
  await expect(status).toContainText("Paused");

  await button.click();
  await expect(status).toContainText("Playing");
});
