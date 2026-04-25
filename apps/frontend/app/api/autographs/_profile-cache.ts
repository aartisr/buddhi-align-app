import { revalidatePath } from "next/cache";

const PROFILE_SURFACE_PATHS = [
  "/admin",
  "/api/autographs/profiles",
  "/autograph-exchange",
  "/profiles",
  "/sitemap.xml",
] as const;

export function revalidateAutographProfileSurfaces(profileId?: string) {
  for (const path of PROFILE_SURFACE_PATHS) {
    revalidatePath(path);
  }

  if (profileId) {
    revalidatePath(`/api/autographs/profiles/${encodeURIComponent(profileId)}`);
    revalidatePath(`/api/autographs/profiles/${encodeURIComponent(profileId)}/avatar`);
    revalidatePath(`/profiles/${encodeURIComponent(profileId)}`);
  }
}
