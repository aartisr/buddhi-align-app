import { NextResponse } from "next/server";

import { AUTOGRAPH_PROFILES_MODULE, AUTOGRAPH_REQUESTS_MODULE } from "@aartisr/autograph-contract";
import { createDataProvider } from "@buddhi-align/data-access";
import { getAutographFeatureStatus } from "@/app/lib/autographs/feature";
import { requireAdminApiAccess } from "../../_auth";

type JwtPayload = {
  role?: string;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const json = Buffer.from(parts[1], "base64url").toString("utf8");
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function readSupabaseProjectRef(url?: string): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    const projectRef = host.split(".")[0];
    return projectRef || null;
  } catch {
    return null;
  }
}

// eslint-disable-next-line complexity
export async function GET() {
  const authResult = await requireAdminApiAccess();
  if (!authResult.ok) return authResult.response;

  const feature = getAutographFeatureStatus();
  const providerType = (process.env.DATA_PROVIDER ?? "supabase").toLowerCase();
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const authSecret = process.env.AUTH_SECRET;

  const payload = serviceRoleKey ? decodeJwtPayload(serviceRoleKey) : null;
  const serviceRoleClaim = typeof payload?.role === "string" ? payload.role : null;

  const issues: string[] = [];
  const warnings: string[] = [];

  if (!feature.enabled) {
    warnings.push("Autograph feature flag is disabled.");
  }

  if (!authSecret) {
    issues.push("AUTH_SECRET is missing.");
  }

  if (providerType !== "supabase") {
    warnings.push(`DATA_PROVIDER is \"${providerType}\" (expected \"supabase\" in production).`);
  }

  if (providerType === "supabase") {
    if (!supabaseUrl) issues.push("SUPABASE_URL is missing.");
    if (!serviceRoleKey) issues.push("SUPABASE_SERVICE_ROLE_KEY is missing.");
    if (serviceRoleKey && serviceRoleClaim !== "service_role") {
      issues.push("SUPABASE_SERVICE_ROLE_KEY is not a service_role key.");
    }
  }

  let providerInitialization: { ok: boolean; error?: string } = { ok: true };
  let storageProbe: { ok: boolean; profileReadOk?: boolean; requestReadOk?: boolean; error?: string } = {
    ok: true,
    profileReadOk: false,
    requestReadOk: false,
  };

  try {
    const provider = createDataProvider();

    try {
      await provider.list(AUTOGRAPH_PROFILES_MODULE, { userId: authResult.userId });
      storageProbe.profileReadOk = true;

      await provider.list(AUTOGRAPH_REQUESTS_MODULE, { userId: authResult.userId });
      storageProbe.requestReadOk = true;
      storageProbe.ok = true;
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown storage probe error";
      storageProbe = {
        ok: false,
        error: detail,
      };
      issues.push(`Autograph storage read probe failed: ${detail}`);
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown provider init error";
    providerInitialization = {
      ok: false,
      error: detail,
    };
    storageProbe = {
      ok: false,
      error: "Provider initialization failed; storage probe skipped.",
    };
    issues.push(`Data provider initialization failed: ${detail}`);
  }

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    userId: authResult.userId,
    autographFeature: feature,
    runtime: {
      nodeEnv: process.env.NODE_ENV ?? "unknown",
      dataProvider: providerType,
      projectRef: readSupabaseProjectRef(supabaseUrl),
    },
    checks: {
      authSecretConfigured: Boolean(authSecret),
      supabaseUrlConfigured: Boolean(supabaseUrl),
      supabaseServiceRoleKeyConfigured: Boolean(serviceRoleKey),
      supabaseServiceRoleClaim: serviceRoleClaim,
      providerInitialization,
      storageProbe,
    },
    summary: {
      ok: issues.length === 0,
      issues,
      warnings,
    },
  });
}
