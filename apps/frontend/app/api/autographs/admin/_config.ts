import { requireAdminApiAccess } from "@/app/api/admin/_auth";

export async function requireAutographAdminUserId(): Promise<string> {
  const result = await requireAdminApiAccess();

  if (!result.ok) {
    throw new Error(result.response.status === 401 ? "AUTH_REQUIRED" : "ADMIN_REQUIRED");
  }

  return result.userId;
}
