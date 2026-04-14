import { NextRequest, NextResponse } from "next/server";
import { requireSessionUserId } from "@/app/api/autographs/_session";
import { signAutographRequest } from "@/app/lib/autographs/service";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = await requireSessionUserId();
    const body = await req.json();

    const request = await signAutographRequest(userId, params.id, {
      signatureText: typeof body?.signatureText === "string" ? body.signatureText : "",
    });

    return NextResponse.json(request);
  } catch (error) {
    if (error instanceof Error && error.message === "AUTH_REQUIRED") {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Unable to sign autograph request." }, { status: 500 });
  }
}
