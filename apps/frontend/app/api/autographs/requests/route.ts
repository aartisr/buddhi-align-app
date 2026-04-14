import { NextRequest, NextResponse } from "next/server";
import { requireSessionUserId } from "../_session";
import {
  createAutographRequest,
  listVisibleAutographRequests,
} from "@/app/lib/autographs/service";

export async function GET() {
  try {
    const userId = await requireSessionUserId();
    const requests = await listVisibleAutographRequests(userId);
    return NextResponse.json(requests);
  } catch (error) {
    if (error instanceof Error && error.message === "AUTH_REQUIRED") {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    return NextResponse.json({ error: "Unable to load autograph requests." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireSessionUserId();
    const body = await req.json();

    const request = await createAutographRequest(userId, {
      signerUserId: typeof body?.signerUserId === "string" ? body.signerUserId : "",
      message: typeof body?.message === "string" ? body.message : "",
    });

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "AUTH_REQUIRED") {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Unable to create autograph request." }, { status: 500 });
  }
}
