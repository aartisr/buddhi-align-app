import { NextResponse } from "next/server";
import type { AdminUpsertAutographProfileInput, UpsertAutographProfileInput } from "@aartisr/autograph-contract";

type JsonObject = Record<string, unknown>;

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export async function readJsonObject(request: Request): Promise<JsonObject> {
  try {
    const body = await request.json();
    if (body && typeof body === "object" && !Array.isArray(body)) {
      return body as JsonObject;
    }
  } catch {
    throw new Error("INVALID_JSON_BODY");
  }

  throw new Error("INVALID_JSON_BODY");
}

export function readAdminProfileUserId(body: JsonObject): string {
  return typeof body.userId === "string" ? body.userId.trim() : "";
}

export function normalizeAdminProfileBody(
  body: JsonObject,
): Omit<AdminUpsertAutographProfileInput, "userId"> {
  return {
    displayName: typeof body.displayName === "string" ? body.displayName : "",
    role: body.role as UpsertAutographProfileInput["role"],
    headline: typeof body.headline === "string" ? body.headline : undefined,
    bio: typeof body.bio === "string" ? body.bio : undefined,
    avatarUrl: typeof body.avatarUrl === "string" ? body.avatarUrl : undefined,
    affiliation: typeof body.affiliation === "string" ? body.affiliation : undefined,
    location: typeof body.location === "string" ? body.location : undefined,
    subjects: normalizeStringArray(body.subjects),
    interests: normalizeStringArray(body.interests),
    signaturePrompt: typeof body.signaturePrompt === "string" ? body.signaturePrompt : undefined,
  };
}

export function adminProfileErrorResponse(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message === "AUTH_REQUIRED") {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (error instanceof Error && error.message === "ADMIN_REQUIRED") {
    return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  }

  if (error instanceof Error && error.message === "INVALID_JSON_BODY") {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (error instanceof Error && error.message === "Profile not found.") {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
