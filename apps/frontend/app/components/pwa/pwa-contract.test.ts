import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { pwaManifest } from "../../manifest";
import { PWA_MANIFEST_PATH } from "../../lib/pwa";

const publicDirectory = resolve(__dirname, "../../../public");
const serviceWorker = readFileSync(resolve(publicDirectory, "sw.js"), "utf8");
const footer = readFileSync(resolve(__dirname, "../SiteFooter.tsx"), "utf8");

describe("PWA public contract", () => {
  it("publishes installable, app-like manifest metadata", () => {
    expect(pwaManifest.display).toBe("standalone");
    expect(pwaManifest.display_override).toContain("standalone");
    expect(pwaManifest.prefer_related_applications).toBe(false);
    expect(pwaManifest.icons?.some((icon) => icon.purpose?.includes("maskable"))).toBe(true);
    expect(pwaManifest.icons).toContainEqual(expect.objectContaining({
      src: "/buddhi-align-icon-512.png",
      sizes: "512x512",
      type: "image/png",
    }));
    expect(pwaManifest.icons).toContainEqual(expect.objectContaining({
      src: "/buddhi-align-icon-maskable-512.png",
      purpose: "maskable",
      type: "image/png",
    }));
    expect(pwaManifest.shortcuts?.map((shortcut) => shortcut.url)).toContain("/dharma-planner");
    expect(PWA_MANIFEST_PATH).toBe("/manifest.webmanifest");
  });

  it("keeps offline behavior safe for authenticated and dynamic data", () => {
    expect(serviceWorker).toContain('"/offline.html"');
    expect(serviceWorker).toContain("isApiOrPrivateRoute");
    expect(serviceWorker).toContain("/(api|auth|admin|settings)");
    expect(serviceWorker).toContain("SKIP_WAITING");
  });

  it("connects the footer install surface to the native prompt with a browser-safe fallback", () => {
    expect(footer).toContain("Install Buddhi Align");
    expect(footer).toContain("PWA_REQUEST_INSTALL_EVENT");
    expect(footer).toContain("How to Install in Safari");
    expect(footer).toContain("Add to Home Screen");
    expect(footer).toContain('aria-modal="true"');
  });
});
