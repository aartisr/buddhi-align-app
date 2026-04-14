import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createDataProvider } from "@buddhi-align/data-access";
import {
  deleteAnonymousEntry,
  updateAnonymousEntry,
} from "../../_anonymous-module-store";
import {
  buildModuleRoute,
  isAnonymousRequest,
  isValidPracticeModule,
  parseJsonObjectBody,
  serverErrorResponse,
} from "../../_module-route-utils";

/** PUT /api/[module]/[id] — update an existing entry */
export async function PUT(
  req: NextRequest,
  { params }: { params: { module: string; id: string } },
) {
  if (!isValidPracticeModule(params.module)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let parsedBody: unknown;
  try {
    parsedBody = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsedObject = parseJsonObjectBody(parsedBody);
  if (!parsedObject.ok) {
    return parsedObject.response;
  }

  try {
    if (isAnonymousRequest(req)) {
      const entry = updateAnonymousEntry(params.module, params.id, parsedObject.data);
      return NextResponse.json(entry);
    }

    const session = await auth();
    const entry = await createDataProvider().update(
      params.module,
      params.id,
      parsedObject.data,
      { userId: session?.user?.id },
    );
    return NextResponse.json(entry);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.toLowerCase().includes("not found")) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return serverErrorResponse(buildModuleRoute(params.module, params.id), "PUT", err);
  }
}

/** DELETE /api/[module]/[id] — remove an entry */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { module: string; id: string } },
) {
  if (!isValidPracticeModule(params.module)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    if (isAnonymousRequest(req)) {
      deleteAnonymousEntry(params.module, params.id);
      return new NextResponse(null, { status: 204 });
    }

    const session = await auth();
    await createDataProvider().delete(params.module, params.id, {
      userId: session?.user?.id,
    });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return serverErrorResponse(buildModuleRoute(params.module, params.id), "DELETE", err);
  }
}
