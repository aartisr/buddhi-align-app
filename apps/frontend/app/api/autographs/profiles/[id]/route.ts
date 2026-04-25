import { NextResponse } from "next/server";
import { createAutographProfilePutHandler } from "@aartisr/autograph-core";
import { autographRouteConfig } from "../../_config";
import { isAutographFeatureEnabled } from "@/app/lib/autographs/feature";
import { autographService } from "@/app/lib/autographs/service";
import { revalidateAutographProfileSurfaces } from "../../_profile-cache";
import { withDisplayAvatarUrl } from "../../_profile-payload";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const putProfile = createAutographProfilePutHandler(autographRouteConfig);

function noStore<T extends Response>(response: T): T {
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  if (!isAutographFeatureEnabled()) {
    return noStore(NextResponse.json({ error: "Autograph exchange is not enabled." }, { status: 404 }));
  }

  try {
    const profile = await autographService.getPublicAutographProfile(params.id);
    if (!profile) {
      return noStore(NextResponse.json({ error: "Profile not found." }, { status: 404 }));
    }

    return noStore(NextResponse.json(withDisplayAvatarUrl(profile)));
  } catch {
    return noStore(NextResponse.json({ error: "Unable to load profile." }, { status: 500 }));
  }
}

export async function PUT(request: Request, context: { params: { id: string } }) {
  const response = await putProfile(request as Parameters<typeof putProfile>[0], context);

  if (response.ok) {
    const profile = (await response.clone().json().catch(() => null)) as { id?: unknown } | null;
    revalidateAutographProfileSurfaces(typeof profile?.id === "string" ? profile.id : context.params.id);
  }

  return noStore(response);
}
