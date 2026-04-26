import { describe, expect, it } from "vitest";

import { buildSupportPageJsonLd } from "./seo";

type JsonRecord = Record<string, unknown>;

describe("support SEO metadata", () => {
  it("publishes support ContactPage structured data for issue reporting", () => {
    const jsonLd = buildSupportPageJsonLd();
    const graph = (jsonLd?.["@graph"] ?? []) as JsonRecord[];
    const supportNode = graph.find((entry) => entry["@type"] === "ContactPage") as
      | JsonRecord
      | undefined;

    expect(supportNode?.mainEntity).toMatchObject({
      "@type": "ContactPoint",
      contactType: "technical support",
    });
    expect(supportNode?.potentialAction).toMatchObject({
      "@type": "CommunicateAction",
    });
  });
});
