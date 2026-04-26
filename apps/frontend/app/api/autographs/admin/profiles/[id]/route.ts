import { NextResponse } from "next/server";

import { autographService } from "@/app/lib/autographs/service";
import { isAutographFeatureEnabled } from "@/app/lib/autographs/feature";
import { revalidateAutographProfileSurfaces } from "../../../_profile-cache";
import { requireAutographAdminUserId } from "../../_config";
import { withDisplayAvatarUrl } from "../../../_profile-payload";
import {
  adminProfileErrorResponse,
  normalizeAdminProfileBody,
  readAdminProfileUserId,
  readJsonObject,
} from "../../_profile-admin";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  if (!isAutographFeatureEnabled()) {
    return NextResponse.json({ error: "Autograph exchange is not enabled." }, { status: 404 });
  }

  try {
    await requireAutographAdminUserId();
    const profile = (await autographService.listAutographProfiles()).find((item) => item.id === params.id);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    return adminProfileErrorResponse(error, "Unable to load admin profile.");
  }
}

export async function PUT(request: Request, context: { params: { id: string } }) {
  if (!isAutographFeatureEnabled()) {
    return NextResponse.json({ error: "Autograph exchange is not enabled." }, { status: 404 });
  }

  try {
    await requireAutographAdminUserId();
    const body = await readJsonObject(request);
    const existing = (await autographService.listAutographProfiles()).find((profile) => profile.id === context.params.id);

    if (!existing) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    const profile = await autographService.adminUpsertAutographProfile({
      ...normalizeAdminProfileBody(body),
      userId: readAdminProfileUserId(body) || existing.userId,
      id: context.params.id,
    });
    revalidateAutographProfileSurfaces(profile.id);

    return NextResponse.json(withDisplayAvatarUrl(profile));
  } catch (error) {
    return adminProfileErrorResponse(error, "Unable to update admin profile.");
  }
}

export async function DELETE(_request: Request, context: { params: { id: string } }) {
  if (!isAutographFeatureEnabled()) {
    return NextResponse.json({ error: "Autograph exchange is not enabled." }, { status: 404 });
  }

  try {
    const adminUserId = await requireAutographAdminUserId();
    const profile = await autographService.deleteAutographProfile(adminUserId, context.params.id, {
      canManageAllProfiles: true,
    });
    revalidateAutographProfileSurfaces(profile.id);

    return NextResponse.json(withDisplayAvatarUrl(profile));
  } catch (error) {
    return adminProfileErrorResponse(error, "Unable to delete admin profile.");
  }
}
