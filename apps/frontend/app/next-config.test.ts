import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const config = readFileSync(resolve(__dirname, "../next.config.js"), "utf8");

describe("production media caching", () => {
  it("caches large public media at the edge while allowing timely releases", () => {
    expect(config).toContain("source: '/videos/:path*'");
    expect(config).toContain("source: '/audio/:path*'");
    expect(config).toContain("s-maxage=86400");
    expect(config).toContain("stale-while-revalidate=604800");
  });
});
