import { describe, expect, it } from "vitest";
import { shouldOpenCommunityLinkInNewTab } from "./CommunityLink";

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

  it("opens external community links in a new tab", () => {
    expect(
      shouldOpenCommunityLinkInNewTab(
        "https://community.foreverlotus.com/c/dhyana-meditation",
        "https://buddhi-align.foreverlotus.com",
      ),
    ).toBe(true);
  });
});
