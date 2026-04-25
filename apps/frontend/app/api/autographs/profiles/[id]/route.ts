import { NextResponse } from "next/server";
import { createAutographProfilePutHandler } from "@aartisr/autograph-core";
import { autographRouteConfig } from "../../_config";
import { isAutographFeatureEnabled } from "@/app/lib/autographs/feature";
import { autographService } from "@/app/lib/autographs/service";
import { withDisplayAvatarUrl } from "../../_profile-payload";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  if (!isAutographFeatureEnabled()) {
    return NextResponse.json({ error: "Autograph exchange is not enabled." }, { status: 404 });
  }

  try {
    const profile = await autographService.getPublicAutographProfile(params.id);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    return NextResponse.json(withDisplayAvatarUrl(profile));
  } catch {
    return NextResponse.json({ error: "Unable to load profile." }, { status: 500 });
  }
}

export const PUT = createAutographProfilePutHandler(autographRouteConfig);
