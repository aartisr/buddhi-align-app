import { describe, expect, it } from "vitest";
import {
  buildDiscourseSsoRedirectUrl,
  buildDiscourseSsoResponsePayload,
  isValidDiscourseSsoSignature,
  parseDiscourseSsoRequest,
} from "./discourse-sso";

describe("discourse-sso", () => {
  it("parses a valid request payload", () => {
    const raw = "nonce=abc123&return_sso_url=https%3A%2F%2Fcommunity.example.org%2Fsession%2Fsso_login";
    const encoded = Buffer.from(raw, "utf8").toString("base64");
    const parsed = parseDiscourseSsoRequest(encoded);

    expect(parsed).toEqual({
      nonce: "abc123",
      returnSsoUrl: "https://community.example.org/session/sso_login",
    });
  });

  it("rejects malformed request payload", () => {
    const encoded = Buffer.from("nonce=missing-return", "utf8").toString("base64");
    expect(parseDiscourseSsoRequest(encoded)).toBeNull();
  });

  it("builds and validates signed redirect payload", () => {
    const request = {
      nonce: "abc123",
      returnSsoUrl: "https://community.example.org/session/sso_login",
    };
    const secret = "test-secret";

    const ssoPayload = buildDiscourseSsoResponsePayload(request, {
      externalId: "user-1",
      email: "user@example.org",
      username: "User Name",
      name: "User Name",
    });

    const url = buildDiscourseSsoRedirectUrl(
      request,
      {
        externalId: "user-1",
        email: "user@example.org",
        username: "User Name",
        name: "User Name",
      },
      secret,
    );

    const parsed = new URL(url);
    expect(parsed.searchParams.get("sso")).toBeTruthy();
    expect(parsed.searchParams.get("sig")).toBeTruthy();

    expect(
      isValidDiscourseSsoSignature(
        ssoPayload,
        parsed.searchParams.get("sig") ?? "",
        secret,
      ),
    ).toBe(true);
  });

  it("adds deduped and sanitized add_groups to payload", () => {
    const request = {
      nonce: "abc123",
      returnSsoUrl: "https://community.example.org/session/sso_login",
    };

    const payload = buildDiscourseSsoResponsePayload(request, {
      externalId: "user-1",
      email: "user@example.org",
      addGroups: ["community-members", "Community Members", "practice guides", ""],
    });

    const decoded = Buffer.from(payload, "base64").toString("utf8");
    const params = new URLSearchParams(decoded);
    expect(params.get("add_groups")).toBe("community-members,practice-guides");
  });

  it("adds deduped and sanitized groups to payload for sync mode", () => {
    const request = {
      nonce: "abc123",
      returnSsoUrl: "https://community.example.org/session/sso_login",
    };

    const payload = buildDiscourseSsoResponsePayload(request, {
      externalId: "user-1",
      email: "user@example.org",
      groups: ["community-members", "Community Members", "practice guides", ""],
    });

    const decoded = Buffer.from(payload, "base64").toString("utf8");
    const params = new URLSearchParams(decoded);
    expect(params.get("groups")).toBe("community-members,practice-guides");
  });
});
