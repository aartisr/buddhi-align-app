import { NextResponse } from "next/server";

import { isAutographFeatureEnabled } from "@/app/lib/autographs/feature";
import { autographService } from "@/app/lib/autographs/service";
import { revalidateAutographProfileSurfaces } from "../../_profile-cache";
import { withDisplayAvatarUrl, withDisplayAvatarUrls } from "../../_profile-payload";
import { requireAutographAdminUserId } from "../_config";
import {
  adminProfileErrorResponse,
  normalizeAdminProfileBody,
  readAdminProfileUserId,
  readJsonObject,
} from "../_profile-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAutographFeatureEnabled()) {
    return NextResponse.json({ error: "Autograph exchange is not enabled." }, { status: 404 });
  }

  try {
    await requireAutographAdminUserId();
    const profiles = await autographService.listAutographProfiles();
    return NextResponse.json(withDisplayAvatarUrls(profiles));
  } catch (error) {
    return adminProfileErrorResponse(error, "Unable to load admin profiles.");
  }
}

export async function POST(request: Request) {
  if (!isAutographFeatureEnabled()) {
    return NextResponse.json({ error: "Autograph exchange is not enabled." }, { status: 404 });
  }

  try {
    await requireAutographAdminUserId();
    const body = await readJsonObject(request);
    const userId = readAdminProfileUserId(body);

    if (!userId) {
      return NextResponse.json({ error: "User ID or email is required." }, { status: 400 });
    }

    const profile = await autographService.adminUpsertAutographProfile({
      ...normalizeAdminProfileBody(body),
      userId,
    });
    revalidateAutographProfileSurfaces(profile.id);

    return NextResponse.json(withDisplayAvatarUrl(profile), { status: 201 });
  } catch (error) {
    return adminProfileErrorResponse(error, "Unable to create admin profile.");
  }
}
