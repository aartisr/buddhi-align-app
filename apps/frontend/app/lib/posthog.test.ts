import { afterEach, describe, expect, it } from "vitest";

import { getPostHogConfig, resetPostHogForTests } from "./posthog";

afterEach(() => {
  resetPostHogForTests();
});

describe("PostHog configuration", () => {
  it("stays disabled until a public project key is configured", () => {
    expect(getPostHogConfig({})).toBeNull();
  });

  it("uses the US ingestion host by default", () => {
    expect(getPostHogConfig({ NEXT_PUBLIC_POSTHOG_KEY: "phc_test" })).toEqual({
      apiKey: "phc_test",
      host: "https://us.i.posthog.com",
    });
  });

  it("accepts an HTTPS regional host and rejects unsafe hosts", () => {
    expect(getPostHogConfig({
      NEXT_PUBLIC_POSTHOG_KEY: "phc_test",
      NEXT_PUBLIC_POSTHOG_HOST: "https://eu.i.posthog.com/",
    })).toEqual({ apiKey: "phc_test", host: "https://eu.i.posthog.com" });
    expect(getPostHogConfig({
      NEXT_PUBLIC_POSTHOG_KEY: "phc_test",
      NEXT_PUBLIC_POSTHOG_HOST: "http://localhost:8000",
    })).toBeNull();
  });
});
