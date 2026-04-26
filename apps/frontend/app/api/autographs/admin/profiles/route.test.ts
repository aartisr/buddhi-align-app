import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const {
  requireAdminApiAccessMock,
  isAutographFeatureEnabledMock,
  listAutographProfilesMock,
  adminUpsertAutographProfileMock,
  deleteAutographProfileMock,
  revalidatePathMock,
} = vi.hoisted(() => ({
  requireAdminApiAccessMock: vi.fn(),
  isAutographFeatureEnabledMock: vi.fn(),
  listAutographProfilesMock: vi.fn(),
  adminUpsertAutographProfileMock: vi.fn(),
  deleteAutographProfileMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("@/app/api/admin/_auth", () => ({
  requireAdminApiAccess: requireAdminApiAccessMock,
}));

vi.mock("@/app/lib/autographs/feature", () => ({
  isAutographFeatureEnabled: isAutographFeatureEnabledMock,
}));

vi.mock("@/app/lib/autographs/service", () => ({
  autographService: {
    listAutographProfiles: listAutographProfilesMock,
    adminUpsertAutographProfile: adminUpsertAutographProfileMock,
    deleteAutographProfile: deleteAutographProfileMock,
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

import { GET, POST } from "./route";
import { DELETE as DELETE_PROFILE, GET as GET_PROFILE, PUT as PUT_PROFILE } from "./[id]/route";

const dataAvatar = `data:image/png;base64,${Buffer.from("tiny-avatar").toString("base64")}`;

const sampleProfile = {
  id: "profile-1",
  userId: "teacher@example.com",
  displayName: "Teacher One",
  role: "teacher",
  headline: "Mindful systems mentor",
  avatarUrl: dataAvatar,
  updatedAt: "2026-04-25T12:00:00.000Z",
};

function makeJsonRequest(body: unknown): NextRequest {
  return new Request("http://localhost/api/autographs/admin/profiles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe("/api/autographs/admin/profiles", () => {
  beforeEach(() => {
    requireAdminApiAccessMock.mockReset();
    isAutographFeatureEnabledMock.mockReset();
    listAutographProfilesMock.mockReset();
    adminUpsertAutographProfileMock.mockReset();
    deleteAutographProfileMock.mockReset();
    revalidatePathMock.mockReset();
    isAutographFeatureEnabledMock.mockReturnValue(true);
  });

  it("lists profiles for Buddhi admins and returns display-safe avatar URLs", async () => {
    requireAdminApiAccessMock.mockResolvedValueOnce({ ok: true, userId: "admin-1" });
    listAutographProfilesMock.mockResolvedValueOnce([sampleProfile]);

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toHaveLength(1);
    expect(payload[0].avatarUrl).toBe("/api/autographs/profiles/profile-1/avatar");
    expect(requireAdminApiAccessMock).toHaveBeenCalledTimes(1);
  });

  it("denies profile listing when Buddhi admin access is missing", async () => {
    requireAdminApiAccessMock.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 }),
    });

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload.error).toBe("Administrator access required.");
    expect(listAutographProfilesMock).not.toHaveBeenCalled();
  });

  it("creates profiles through the admin service", async () => {
    requireAdminApiAccessMock.mockResolvedValueOnce({ ok: true, userId: "admin-1" });
    adminUpsertAutographProfileMock.mockResolvedValueOnce(sampleProfile);

    const response = await POST(
      makeJsonRequest({
        userId: "teacher@example.com",
        displayName: "Teacher One",
        role: "teacher",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.avatarUrl).toBe("/api/autographs/profiles/profile-1/avatar");
    expect(adminUpsertAutographProfileMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "teacher@example.com",
        displayName: "Teacher One",
        role: "teacher",
      }),
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/profiles");
    expect(revalidatePathMock).toHaveBeenCalledWith("/autograph-exchange");
    expect(revalidatePathMock).toHaveBeenCalledWith("/api/autographs/profiles/profile-1");
  });

  it("returns a clear validation error when admin create is missing the profile owner", async () => {
    requireAdminApiAccessMock.mockResolvedValueOnce({ ok: true, userId: "admin-1" });

    const response = await POST(
      makeJsonRequest({
        displayName: "Teacher One",
        role: "teacher",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("User ID or email is required.");
    expect(adminUpsertAutographProfileMock).not.toHaveBeenCalled();
  });

  it("rejects malformed admin profile payloads", async () => {
    requireAdminApiAccessMock.mockResolvedValueOnce({ ok: true, userId: "admin-1" });

    const response = await POST(
      new Request("http://localhost/api/autographs/admin/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{not-json",
      }) as unknown as NextRequest,
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Invalid JSON body.");
    expect(adminUpsertAutographProfileMock).not.toHaveBeenCalled();
  });

  it("loads the editable raw profile for an admin", async () => {
    requireAdminApiAccessMock.mockResolvedValueOnce({ ok: true, userId: "admin-1" });
    listAutographProfilesMock.mockResolvedValueOnce([sampleProfile]);

    const response = await GET_PROFILE(makeJsonRequest({}), { params: { id: "profile-1" } });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.avatarUrl).toBe(dataAvatar);
  });

  it("updates an existing profile by id", async () => {
    requireAdminApiAccessMock.mockResolvedValue({ ok: true, userId: "admin-1" });
    listAutographProfilesMock.mockResolvedValueOnce([sampleProfile]);
    adminUpsertAutographProfileMock.mockResolvedValueOnce({ ...sampleProfile, displayName: "Teacher Updated" });

    const response = await PUT_PROFILE(
      makeJsonRequest({
        displayName: "Teacher Updated",
        role: "teacher",
      }),
      { params: { id: "profile-1" } },
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.displayName).toBe("Teacher Updated");
    expect(payload.avatarUrl).toBe("/api/autographs/profiles/profile-1/avatar");
    expect(adminUpsertAutographProfileMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "profile-1",
        userId: "teacher@example.com",
        displayName: "Teacher Updated",
      }),
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/profiles/profile-1");
    expect(revalidatePathMock).toHaveBeenCalledWith("/api/autographs/profiles");
  });

  it("deletes an existing profile by id", async () => {
    requireAdminApiAccessMock.mockResolvedValueOnce({ ok: true, userId: "admin-1" });
    deleteAutographProfileMock.mockResolvedValueOnce(sampleProfile);

    const response = await DELETE_PROFILE(makeJsonRequest({}), { params: { id: "profile-1" } });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.avatarUrl).toBe("/api/autographs/profiles/profile-1/avatar");
    expect(deleteAutographProfileMock).toHaveBeenCalledWith("admin-1", "profile-1", {
      canManageAllProfiles: true,
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/profiles/profile-1");
    expect(revalidatePathMock).toHaveBeenCalledWith("/api/autographs/profiles/profile-1/avatar");
  });

  it("returns not found when an admin deletes a missing profile", async () => {
    requireAdminApiAccessMock.mockResolvedValueOnce({ ok: true, userId: "admin-1" });
    deleteAutographProfileMock.mockRejectedValueOnce(new Error("Profile not found."));

    const response = await DELETE_PROFILE(makeJsonRequest({}), { params: { id: "missing-profile" } });
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.error).toBe("Profile not found.");
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});
