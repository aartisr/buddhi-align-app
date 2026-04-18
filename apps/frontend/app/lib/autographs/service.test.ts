import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createDataProviderMock,
  reset,
} = vi.hoisted(() => {
  const rows: Record<string, Array<Record<string, unknown>>> = {
    autograph_profiles: [],
    autograph_requests: [],
  };

  const provider = {
    list: vi.fn(async (module: string) => rows[module] ?? []),
    create: vi.fn(async (module: string, payload: Record<string, unknown>) => {
      const entry = {
        id: `${module}-${(rows[module]?.length ?? 0) + 1}`,
        ...payload,
      };
      rows[module] = [...(rows[module] ?? []), entry];
      return entry;
    }),
    update: vi.fn(async (module: string, id: string, payload: Record<string, unknown>) => {
      const current = rows[module] ?? [];
      const target = current.find((item) => item.id === id);
      if (!target) {
        throw new Error("Not found");
      }
      const updated = { ...target, ...payload };
      rows[module] = current.map((item) => (item.id === id ? updated : item));
      return updated;
    }),
  };

  return {
    createDataProviderMock: vi.fn(() => provider),
    provider,
    reset() {
      rows.autograph_profiles = [];
      rows.autograph_requests = [];
      provider.list.mockClear();
      provider.create.mockClear();
      provider.update.mockClear();
    },
    rows,
  };
});

vi.mock("@buddhi-align/data-access", () => ({
  createDataProvider: createDataProviderMock,
}));

import {
  createAutographRequest,
  listAutographProfiles,
  listVisibleAutographRequests,
  signAutographRequest,
  upsertAutographProfile,
} from "./service";

describe("autograph service", () => {
  beforeEach(() => {
    createDataProviderMock.mockClear();
    reset();
  });

  it("requires requester and signer to be different users", async () => {
    await upsertAutographProfile("user-1", {
      displayName: "User One",
      role: "student",
    });

    await expect(
      createAutographRequest("user-1", {
        signerUserId: "user-1",
        message: "Please sign",
      }),
    ).rejects.toThrow("You cannot request your own autograph");
  });

  it("allows only the targeted signer to sign", async () => {
    await upsertAutographProfile("user-1", {
      displayName: "User One",
      role: "student",
    });
    await upsertAutographProfile("user-2", {
      displayName: "User Two",
      role: "teacher",
    });

    const request = await createAutographRequest("user-1", {
      signerUserId: "user-2",
      message: "Your guidance inspires me",
    });

    await expect(
      signAutographRequest("user-3", request.id, {
        signatureText: "Blessings",
      }),
    ).rejects.toThrow("Only the requested signer can sign this autograph");

    const signed = await signAutographRequest("user-2", request.id, {
      signatureText: "Keep shining",
    });

    expect(signed.status).toBe("signed");
    expect(signed.signatureText).toBe("Keep shining");
    expect(signed.visibility).toBe("private");
  });

  it("shows public signed autographs to non-participants", async () => {
    await upsertAutographProfile("student-1", {
      displayName: "Student One",
      role: "student",
    });
    await upsertAutographProfile("teacher-1", {
      displayName: "Teacher One",
      role: "teacher",
    });
    await upsertAutographProfile("observer-1", {
      displayName: "Observer One",
      role: "student",
    });

    const request = await createAutographRequest("student-1", {
      signerUserId: "teacher-1",
      message: "You helped me graduate",
    });

    await signAutographRequest("teacher-1", request.id, {
      signatureText: "Proud of your journey",
      visibility: "public",
    });

    const visibleToObserver = await listVisibleAutographRequests("observer-1");
    expect(visibleToObserver).toHaveLength(1);
    expect(visibleToObserver[0]?.visibility).toBe("public");
  });

  it("deduplicates profiles by user so signers appear once", async () => {
    await upsertAutographProfile("student-1", {
      displayName: "Aarti Ravikumar",
      role: "student",
    });

    await upsertAutographProfile("teacher-1", {
      displayName: "Ravikumar Raman",
      role: "teacher",
    });

    await createDataProviderMock().create("autograph_profiles", {
      userId: "student-1",
      displayName: "Aarti Ravikumar",
      role: "student",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    await createDataProviderMock().create("autograph_profiles", {
      userId: "teacher-1",
      displayName: "Ravikumar Raman",
      role: "teacher",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    const profiles = await listAutographProfiles();

    expect(profiles).toHaveLength(2);
    expect(profiles.filter((profile) => profile.userId === "student-1")).toHaveLength(1);
    expect(profiles.filter((profile) => profile.userId === "teacher-1")).toHaveLength(1);
  });
});
