import { describe, expect, it } from "vitest";
import {
  getDiscourseConfig,
  isDiscourseEnabled,
  validateDiscourseConfig,
} from "./discourse-config";

describe("discourse-config", () => {
  it("keeps integration disabled by default", () => {
    const config = getDiscourseConfig({});

    expect(config.enabled).toBe(false);
    expect(config.requestTimeoutMs).toBe(4000);
    expect(validateDiscourseConfig(config)).toEqual({
      ok: true,
      errors: [],
      warnings: [],
    });
  });

  it("parses and normalizes enabled config", () => {
    const config = getDiscourseConfig({
      DISCOURSE_INTEGRATION_ENABLED: "true",
      DISCOURSE_BASE_URL: "https://community.example.org/",
      NEXT_PUBLIC_DISCOURSE_COMMUNITY_URL: "https://community.example.org/c/practice",
      DISCOURSE_PARENT_CATEGORY_SLUG: "Buddhi-Align",
      DISCOURSE_API_USERNAME: "system",
      DISCOURSE_API_KEY: "secret",
      DISCOURSE_SSO_DEFAULT_GROUPS: "community-members, seekers ",
      DISCOURSE_SSO_ADMIN_GROUPS: "core-admins",
      DISCOURSE_SSO_MODERATOR_GROUPS: "practice-guides",
      DISCOURSE_SSO_ALLOWED_GROUPS: "community-members,core-admins",
      DISCOURSE_SSO_DENIED_GROUPS: "practice-guides",
      DISCOURSE_SSO_GRANT_ADMIN_FROM_APP_ADMIN: "true",
      DISCOURSE_SSO_GRANT_MODERATOR_FROM_APP_ADMIN: "1",
      DISCOURSE_SSO_GROUP_SYNC_MODE: "sync",
      DISCOURSE_DEFAULT_CATEGORY_SLUG: "practice",
      DISCOURSE_REQUEST_TIMEOUT_MS: "7500",
    });

    expect(config.enabled).toBe(true);
    expect(config.baseUrl).toBe("https://community.example.org");
    expect(config.communityUrl).toBe("https://community.example.org/c/practice");
    expect(config.parentCategorySlug).toBe("buddhi-align");
    expect(config.apiUsername).toBe("system");
    expect(config.apiKey).toBe("secret");
    expect(config.ssoDefaultGroups).toEqual(["community-members", "seekers"]);
    expect(config.ssoAdminGroups).toEqual(["core-admins"]);
    expect(config.ssoModeratorGroups).toEqual(["practice-guides"]);
    expect(config.ssoAllowedGroups).toEqual(["community-members", "core-admins"]);
    expect(config.ssoDeniedGroups).toEqual(["practice-guides"]);
    expect(config.ssoGrantAdminFromAppAdmin).toBe(true);
    expect(config.ssoGrantModeratorFromAppAdmin).toBe(true);
    expect(config.ssoGroupSyncMode).toBe("sync");
    expect(config.defaultCategorySlug).toBe("practice");
    expect(config.requestTimeoutMs).toBe(7500);
    expect(isDiscourseEnabled({ DISCOURSE_INTEGRATION_ENABLED: "yes" })).toBe(true);
  });

  it("returns validation errors when enabled config is incomplete", () => {
    const config = getDiscourseConfig({
      DISCOURSE_INTEGRATION_ENABLED: "1",
    });

    const result = validateDiscourseConfig(config);

    expect(result.ok).toBe(false);
    expect(result.errors).toContain(
      "DISCOURSE_BASE_URL is required when discourse integration is enabled.",
    );
    expect(result.warnings).toContain(
      "NEXT_PUBLIC_DISCOURSE_COMMUNITY_URL is not set; client-side community links will be unavailable.",
    );
    expect(result.warnings).toContain(
      "DISCOURSE_API_USERNAME is not set; server API calls may be limited.",
    );
    expect(result.warnings).toContain(
      "DISCOURSE_API_KEY is not set; server API calls may be limited.",
    );
  });

  it("falls back for invalid timeout values", () => {
    const config = getDiscourseConfig({
      DISCOURSE_REQUEST_TIMEOUT_MS: "-10",
      DISCOURSE_SSO_GROUP_SYNC_MODE: "invalid-mode",
    });

    expect(config.requestTimeoutMs).toBe(4000);
    expect(config.ssoGroupSyncMode).toBe("add");
  });
});
