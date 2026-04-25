import {
  createAutographProfilesGetHandler,
  createAutographProfilesPutHandler,
} from "@aartisr/autograph-core";
import { autographRouteConfig } from "../_config";
import { revalidateAutographProfileSurfaces } from "../_profile-cache";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const getProfiles = createAutographProfilesGetHandler(autographRouteConfig);
const putProfiles = createAutographProfilesPutHandler(autographRouteConfig);

function noStore<T extends Response>(response: T): T {
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

export async function GET() {
  return noStore(await getProfiles());
}

export async function PUT(request: Request) {
  const response = await putProfiles(request as Parameters<typeof putProfiles>[0]);

  if (response.ok) {
    const profile = (await response.clone().json().catch(() => null)) as { id?: unknown } | null;
    revalidateAutographProfileSurfaces(typeof profile?.id === "string" ? profile.id : undefined);
  }

  return noStore(response);
}
