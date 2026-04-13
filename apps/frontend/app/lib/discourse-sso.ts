import { createHmac, timingSafeEqual } from "node:crypto";

export interface DiscourseSsoRequest {
  nonce: string;
  returnSsoUrl: string;
}

export interface DiscourseSsoResponseUser {
  externalId: string;
  email: string;
  username?: string;
  name?: string;
  avatarUrl?: string;
  bio?: string;
  admin?: boolean;
  moderator?: boolean;
  addGroups?: string[];
  groups?: string[];
}

function base64Decode(value: string): string {
  const normalized = value.replace(/ /g, "+");
  return Buffer.from(normalized, "base64").toString("utf8");
}

function base64Encode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64");
}

function signPayload(ssoPayload: string, secret: string): string {
  return createHmac("sha256", secret).update(ssoPayload).digest("hex");
}

function safeEqualHex(leftHex: string, rightHex: string): boolean {
  try {
    const left = Buffer.from(leftHex, "hex");
    const right = Buffer.from(rightHex, "hex");
    if (left.length !== right.length) return false;
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

export function isValidDiscourseSsoSignature(
  ssoPayload: string,
  signature: string,
  secret: string,
): boolean {
  const expected = signPayload(ssoPayload, secret);
  return safeEqualHex(expected, signature);
}

export function parseDiscourseSsoRequest(ssoPayload: string): DiscourseSsoRequest | null {
  let decoded: string;
  try {
    decoded = base64Decode(ssoPayload);
  } catch {
    return null;
  }

  const params = new URLSearchParams(decoded);
  const nonce = params.get("nonce")?.trim();
  const returnSsoUrl = params.get("return_sso_url")?.trim();

  if (!nonce || !returnSsoUrl) {
    return null;
  }

  try {
    const parsedReturn = new URL(returnSsoUrl);
    if (!parsedReturn.protocol.startsWith("http")) {
      return null;
    }
  } catch {
    return null;
  }

  return {
    nonce,
    returnSsoUrl,
  };
}

function sanitizeUsername(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned.length > 0 ? cleaned.slice(0, 60) : undefined;
}

function sanitizeGroupName(value: string): string | undefined {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_.-]+/g, "")
    .replace(/^-+|-+$/g, "");
  return cleaned ? cleaned.slice(0, 60) : undefined;
}

function buildAddGroups(groups: string[] | undefined): string | undefined {
  if (!groups || groups.length === 0) return undefined;
  const deduped = new Set<string>();

  for (const group of groups) {
    const sanitized = sanitizeGroupName(group);
    if (sanitized) deduped.add(sanitized);
  }

  if (deduped.size === 0) return undefined;
  return Array.from(deduped).join(",");
}

export function buildDiscourseSsoResponsePayload(
  request: DiscourseSsoRequest,
  user: DiscourseSsoResponseUser,
): string {
  const params = new URLSearchParams();
  params.set("nonce", request.nonce);
  params.set("external_id", user.externalId);
  params.set("email", user.email);

  const username = sanitizeUsername(user.username);
  if (username) params.set("username", username);
  if (user.name?.trim()) params.set("name", user.name.trim());
  if (user.avatarUrl?.trim()) params.set("avatar_url", user.avatarUrl.trim());
  if (user.bio?.trim()) params.set("bio", user.bio.trim());
  if (typeof user.admin === "boolean") params.set("admin", user.admin ? "true" : "false");
  if (typeof user.moderator === "boolean") params.set("moderator", user.moderator ? "true" : "false");
  const groups = buildAddGroups(user.groups);
  if (groups) params.set("groups", groups);
  const addGroups = buildAddGroups(user.addGroups);
  if (addGroups) params.set("add_groups", addGroups);

  return base64Encode(params.toString());
}

export function buildDiscourseSsoRedirectUrl(
  request: DiscourseSsoRequest,
  user: DiscourseSsoResponseUser,
  secret: string,
): string {
  const sso = buildDiscourseSsoResponsePayload(request, user);
  const sig = signPayload(sso, secret);
  const redirect = new URL(request.returnSsoUrl);
  redirect.searchParams.set("sso", sso);
  redirect.searchParams.set("sig", sig);
  return redirect.toString();
}
