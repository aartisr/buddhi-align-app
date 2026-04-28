import { describe, expect, it } from "vitest";
import { shouldOpenCommunityLinkInNewTab } from "./CommunityLink";
import {
  buildDiscourseSsoReturnPath,
  buildCommunitySsoLoginHref,
  normalizeCommunityReturnPath,
  shouldUseDocumentNavigationForCommunity,
  shouldWarmCommunityHref,
} from "../lib/community-navigation";

describe("CommunityLink navigation behavior", () => {
  it("keeps same-origin community links in the current tab", () => {
    expect(
      shouldOpenCommunityLinkInNewTab(
        "https://buddhi-align.foreverlotus.com/community/c/karma-yoga",
        "https://buddhi-align.foreverlotus.com",
      ),
    ).toBe(false);
  });

  it("keeps relative community links in the current tab", () => {
    expect(
      shouldOpenCommunityLinkInNewTab(
        "/community/c/bhakti-journal",
        "https://buddhi-align.foreverlotus.com",
      ),
    ).toBe(false);
  });

  it("keeps external community links in the current tab when a provider returns one", () => {
    expect(
      shouldOpenCommunityLinkInNewTab(
        "https://community.foreverlotus.com/c/dhyana-meditation",
        "https://buddhi-align.foreverlotus.com",
      ),
    ).toBe(false);
  });
});

describe("Community route warmup behavior", () => {
  it("uses document navigation for proxied community routes", () => {
    expect(shouldUseDocumentNavigationForCommunity("/community")).toBe(true);
    expect(shouldUseDocumentNavigationForCommunity("/community/c/buddhi-align/bhakti-journal")).toBe(true);
    expect(shouldUseDocumentNavigationForCommunity("/support")).toBe(false);
  });

  it("warms same-origin community routes only", () => {
    expect(
      shouldWarmCommunityHref(
        "https://buddhi-align.foreverlotus.com/community/c/karma-yoga",
        "https://buddhi-align.foreverlotus.com",
      ),
    ).toBe(true);
    expect(shouldWarmCommunityHref("/community/c/bhakti-journal", "https://buddhi-align.foreverlotus.com")).toBe(true);
    expect(
      shouldWarmCommunityHref(
        "https://community.foreverlotus.com/community/c/dhyana-meditation",
        "https://buddhi-align.foreverlotus.com",
      ),
    ).toBe(false);
  });

  it("builds DiscourseConnect login-gate links for community return paths", () => {
    expect(buildCommunitySsoLoginHref("/community")).toBe("/community");
    expect(buildCommunitySsoLoginHref("/community/c/buddhi-align/bhakti-journal/11")).toBe(
      "/api/community/discourse/login?returnPath=%2Fcommunity%2Fc%2Fbuddhi-align%2Fbhakti-journal%2F11",
    );
    expect(
      buildCommunitySsoLoginHref(
        "https://buddhi-align.foreverlotus.com/community/c/buddhi-align/karma-yoga/12",
        "https://buddhi-align.foreverlotus.com",
      ),
    ).toBe("/api/community/discourse/login?returnPath=%2Fcommunity%2Fc%2Fbuddhi-align%2Fkarma-yoga%2F12");
  });

  it("sanitizes unsafe or recursive DiscourseConnect return paths", () => {
    expect(
      normalizeCommunityReturnPath(
        "https://community.foreverlotus.com/community/c/buddhi-align/karma-yoga",
        "https://buddhi-align.foreverlotus.com",
      ),
    ).toBe("/community");
    expect(normalizeCommunityReturnPath("/community/session/sso?return_path=/community")).toBe("/community");
  });

  it("converts app community paths to Discourse-relative SSO return paths", () => {
    expect(buildDiscourseSsoReturnPath("/community")).toBe("/");
    expect(buildDiscourseSsoReturnPath("/community/c/buddhi-align/bhakti-journal/11")).toBe(
      "/c/buddhi-align/bhakti-journal/11",
    );
    expect(buildDiscourseSsoReturnPath("/community/t/settling-into-practice/44")).toBe(
      "/t/settling-into-practice/44",
    );
  });
});
