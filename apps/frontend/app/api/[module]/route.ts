import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createDataProvider } from "@buddhi-align/data-access";
import {
  createAnonymousEntry,
  listAnonymousEntries,
} from "../_anonymous-module-store";
import {
  buildModuleRoute,
  isAnonymousRequest,
  isValidPracticeModule,
  parseJsonObjectBody,
  serverErrorResponse,
} from "../_module-route-utils";

/** GET /api/[module] — list all entries */
export async function GET(
  req: NextRequest,
  { params }: { params: { module: string } },
) {
  if (!isValidPracticeModule(params.module)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (isAnonymousRequest(req)) {
    return NextResponse.json(listAnonymousEntries(params.module));
  }

  try {
    const session = await auth();
    const data = await createDataProvider().list(params.module, {
      userId: session?.user?.id,
    });
    return NextResponse.json(data);
  } catch (err) {
    return serverErrorResponse(buildModuleRoute(params.module), "GET", err);
  }
}

/** POST /api/[module] — create a new entry */
export async function POST(
  req: NextRequest,
  { params }: { params: { module: string } },
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

  if (isAnonymousRequest(req)) {
    const entry = createAnonymousEntry(params.module, parsedObject.data);
    return NextResponse.json(entry, { status: 201 });
  }

  try {
    const session = await auth();
    const entry = await createDataProvider().create(params.module, parsedObject.data, {
      userId: session?.user?.id,
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (err) {
    return serverErrorResponse(buildModuleRoute(params.module), "POST", err);
  }
}
