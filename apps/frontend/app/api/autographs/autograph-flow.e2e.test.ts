import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

type GenericEntry = Record<string, unknown> & { id: string };

const {
  authMock,
  createDataProviderMock,
  setCurrentUser,
  resetStore,
} = vi.hoisted(() => {
  const store: Record<string, GenericEntry[]> = {
    autograph_profiles: [],
    autograph_requests: [],
  };

  let currentUserId: string | null = null;

  const authMock = vi.fn(async () => {
    if (!currentUserId) {
      return null;
    }

    return {
      user: {
        id: currentUserId,
      },
    };
  });

  const provider = {
    list: vi.fn(async (module: string, where?: Record<string, unknown>) => {
      const rows = [...(store[module] ?? [])];
      if (!where || Object.keys(where).length === 0) {
        return rows;
      }

      return rows.filter((row) =>
        Object.entries(where).every(([key, value]) => row[key] === value),
      );
    }),
    create: vi.fn(async (module: string, payload: Record<string, unknown>) => {
      const nextId = `${module}-${(store[module]?.length ?? 0) + 1}`;
      const { id: _ignored, ...rest } = payload;
      const entry: GenericEntry = { ...rest, id: nextId };
      store[module] = [...(store[module] ?? []), entry];
      return entry;
    }),
    update: vi.fn(async (module: string, id: string, payload: Record<string, unknown>) => {
      const current = store[module] ?? [];
      const found = current.find((item) => item.id === id);

      if (!found) {
        throw new Error("Not found");
      }

      const updated = { ...found, ...payload };
      store[module] = current.map((item) => (item.id === id ? updated : item));
      return updated;
    }),
  };

  const createDataProviderMock = vi.fn(() => provider);

  return {
    authMock,
    createDataProviderMock,
    setCurrentUser(userId: string | null) {
      currentUserId = userId;
    },
    resetStore() {
      store.autograph_profiles = [];
      store.autograph_requests = [];
      currentUserId = null;
      authMock.mockClear();
      createDataProviderMock.mockClear();
      provider.list.mockClear();
      provider.create.mockClear();
      provider.update.mockClear();
    },
  };
});

vi.mock("@/auth", () => ({
  auth: authMock,
}));

vi.mock("@buddhi-align/data-access", () => ({
  createDataProvider: createDataProviderMock,
}));

import { GET as getProfiles, PUT as putProfiles } from "./profiles/route";
import { GET as getRequests, POST as createRequest } from "./requests/route";
import { POST as signRequest } from "./requests/[id]/sign/route";

function makeJsonRequest(body: unknown): NextRequest {
  return new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe("autograph exchange API end-to-end flow", () => {
  beforeEach(() => {
    resetStore();
  });

  it("supports full request -> inbox -> sign -> signed archive flow for both users", async () => {
    setCurrentUser("student-1");
    const studentProfile = await putProfiles(makeJsonRequest({
      displayName: "Student One",
      role: "student",
    }));
    expect(studentProfile.status).toBe(200);

    setCurrentUser("teacher-1");
    const teacherProfile = await putProfiles(makeJsonRequest({
      displayName: "Teacher One",
      role: "teacher",
    }));
    expect(teacherProfile.status).toBe(200);

    setCurrentUser("student-1");
    const createRes = await createRequest(
      makeJsonRequest({
        signerUserId: "teacher-1",
        message: "Please autograph my journal.",
      }),
    );
    const createdPayload = await createRes.json();

    expect(createRes.status).toBe(201);
    expect(createdPayload.status).toBe("pending");
    expect(createdPayload.requesterUserId).toBe("student-1");
    expect(createdPayload.signerUserId).toBe("teacher-1");

    setCurrentUser("teacher-1");
    const teacherInboxRes = await getRequests();
    const teacherInbox = await teacherInboxRes.json();

    expect(teacherInboxRes.status).toBe(200);
    expect(teacherInbox).toHaveLength(1);
    expect(teacherInbox[0].status).toBe("pending");
    expect(teacherInbox[0].signerUserId).toBe("teacher-1");

    const signRes = await signRequest(
      makeJsonRequest({ signatureText: "Blessings and strength.", visibility: "public" }),
      { params: { id: createdPayload.id } },
    );
    const signedPayload = await signRes.json();

    expect(signRes.status).toBe(200);
    expect(signedPayload.status).toBe("signed");
    expect(signedPayload.signatureText).toBe("Blessings and strength.");
    expect(signedPayload.visibility).toBe("public");
    expect(typeof signedPayload.signedAt).toBe("string");

    const teacherSignedRes = await getRequests();
    const teacherSigned = await teacherSignedRes.json();

    expect(teacherSignedRes.status).toBe(200);
    expect(teacherSigned).toHaveLength(1);
    expect(teacherSigned[0].status).toBe("signed");

    setCurrentUser("student-1");
    const studentSignedRes = await getRequests();
    const studentSigned = await studentSignedRes.json();

    expect(studentSignedRes.status).toBe(200);
    expect(studentSigned).toHaveLength(1);
    expect(studentSigned[0].status).toBe("signed");
    expect(studentSigned[0].signatureText).toBe("Blessings and strength.");
  });

  it("blocks unauthenticated access for profiles and requests", async () => {
    setCurrentUser(null);

    const profilesRes = await getProfiles();
    const profilesPayload = await profilesRes.json();

    expect(profilesRes.status).toBe(401);
    expect(profilesPayload.error).toContain("Authentication required");

    const requestsRes = await getRequests();
    const requestsPayload = await requestsRes.json();

    expect(requestsRes.status).toBe(401);
    expect(requestsPayload.error).toContain("Authentication required");
  });

  it("rejects signer mismatch and double-sign attempts", async () => {
    setCurrentUser("student-1");
    await putProfiles(makeJsonRequest({ displayName: "Student One", role: "student" }));

    setCurrentUser("teacher-1");
    await putProfiles(makeJsonRequest({ displayName: "Teacher One", role: "teacher" }));

    setCurrentUser("student-1");
    const createRes = await createRequest(
      makeJsonRequest({
        signerUserId: "teacher-1",
        message: "Please sign this.",
      }),
    );
    const created = await createRes.json();

    setCurrentUser("teacher-2");
    const wrongSignerRes = await signRequest(
      makeJsonRequest({ signatureText: "Not allowed" }),
      { params: { id: created.id } },
    );
    const wrongSignerPayload = await wrongSignerRes.json();

    expect(wrongSignerRes.status).toBe(400);
    expect(wrongSignerPayload.error).toContain("Only the requested signer");

    setCurrentUser("teacher-1");
    const firstSignRes = await signRequest(
      makeJsonRequest({ signatureText: "Approved" }),
      { params: { id: created.id } },
    );
    expect(firstSignRes.status).toBe(200);

    const secondSignRes = await signRequest(
      makeJsonRequest({ signatureText: "Second attempt" }),
      { params: { id: created.id } },
    );
    const secondSignPayload = await secondSignRes.json();

    expect(secondSignRes.status).toBe(400);
    expect(secondSignPayload.error).toContain("already been signed");
  });

  it("enforces profile prerequisites and self-request guardrails", async () => {
    setCurrentUser("student-1");
    await putProfiles(makeJsonRequest({ displayName: "Student One", role: "student" }));

    const selfRequestRes = await createRequest(
      makeJsonRequest({
        signerUserId: "student-1",
        message: "Sign myself",
      }),
    );
    const selfRequestPayload = await selfRequestRes.json();

    expect(selfRequestRes.status).toBe(400);
    expect(selfRequestPayload.error).toContain("cannot request your own autograph");

    const missingSignerProfileRes = await createRequest(
      makeJsonRequest({
        signerUserId: "teacher-99",
        message: "Please sign",
      }),
    );
    const missingSignerProfilePayload = await missingSignerProfileRes.json();

    expect(missingSignerProfileRes.status).toBe(400);
    expect(missingSignerProfilePayload.error).toContain("does not have an autograph profile");
  });

  it("returns one visible profile per user even when duplicate rows exist", async () => {
    setCurrentUser("student-1");
    await putProfiles(makeJsonRequest({ displayName: "Aarti Ravikumar", role: "student" }));

    setCurrentUser("teacher-1");
    await putProfiles(makeJsonRequest({ displayName: "Ravikumar Raman", role: "teacher" }));

    const provider = createDataProviderMock();
    await provider.create("autograph_profiles", {
      userId: "student-1",
      displayName: "Aarti Ravikumar",
      role: "student",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    await provider.create("autograph_profiles", {
      userId: "teacher-1",
      displayName: "Ravikumar Raman",
      role: "teacher",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    setCurrentUser("student-1");
    const profilesRes = await getProfiles();
    const profilesPayload = await profilesRes.json();

    expect(profilesRes.status).toBe(200);
    expect(profilesPayload.filter((profile: { userId: string }) => profile.userId === "student-1")).toHaveLength(1);
    expect(profilesPayload.filter((profile: { userId: string }) => profile.userId === "teacher-1")).toHaveLength(1);
  });
});
