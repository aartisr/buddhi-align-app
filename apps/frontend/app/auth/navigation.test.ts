import { describe, expect, it } from "vitest";

import {
  buildSignInHref,
  getRelativeCallbackUrlFromReferer,
  sanitizeRelativeCallbackUrl,
} from "./navigation";

describe("auth-navigation", () => {
  it("sanitizes callback URL to same-origin relative paths", () => {
    expect(sanitizeRelativeCallbackUrl(undefined)).toBe("/");
    expect(sanitizeRelativeCallbackUrl("https://evil.example.com")).toBe("/");
    expect(sanitizeRelativeCallbackUrl("//evil.example.com")).toBe("/");
    expect(sanitizeRelativeCallbackUrl("/safe-path?x=1")).toBe("/safe-path?x=1");
    expect(sanitizeRelativeCallbackUrl(undefined, "/admin")).toBe("/admin");
    expect(sanitizeRelativeCallbackUrl("/sign-in?callbackUrl=%2Fadmin", "/admin")).toBe("/admin");
    expect(sanitizeRelativeCallbackUrl("/api/auth/signin/google", "/admin")).toBe("/admin");
    expect(
      sanitizeRelativeCallbackUrl("https://buddhi.example/autograph-exchange?from=share", "/", {
        origin: "https://buddhi.example",
      }),
    ).toBe("/autograph-exchange?from=share");
  });

  it("builds sign-in href with callback and optional error", () => {
    expect(buildSignInHref("/admin")).toBe("/sign-in?callbackUrl=%2Fadmin");
    expect(buildSignInHref("/admin", { error: "OIDCRequired" })).toBe(
      "/sign-in?callbackUrl=%2Fadmin&error=OIDCRequired",
    );
  });

  it("uses same-origin referer as a safe callback fallback", () => {
    expect(
      getRelativeCallbackUrlFromReferer(
        "https://buddhi.example/autograph-exchange?source=invite",
        "https://buddhi.example",
      ),
    ).toBe("/autograph-exchange?source=invite");

    expect(
      getRelativeCallbackUrlFromReferer(
        "https://evil.example/autograph-exchange",
        "https://buddhi.example",
        "/dharma-planner",
      ),
    ).toBe("/dharma-planner");
  });
});
