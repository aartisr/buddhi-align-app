import { NextRequest, NextResponse } from "next/server";
import { requireSessionUserId } from "../_session";
import { listAutographProfiles, upsertAutographProfile } from "@/app/lib/autographs/service";

export async function GET() {
  try {
    await requireSessionUserId();
    const profiles = await listAutographProfiles();
    return NextResponse.json(profiles);
  } catch (error) {
    if (error instanceof Error && error.message === "AUTH_REQUIRED") {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    return NextResponse.json({ error: "Unable to load profiles." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await requireSessionUserId();
    const body = await req.json();

    const profile = await upsertAutographProfile(userId, {
      displayName: typeof body?.displayName === "string" ? body.displayName : "",
      role: body?.role,
    });

    return NextResponse.json(profile);
  } catch (error) {
    if (error instanceof Error && error.message === "AUTH_REQUIRED") {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Unable to save profile." }, { status: 500 });
  }
}
