import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfilesPage from "./page";
import ProfilePage from "./[id]/page";

const {
  authMock,
  directorySpy,
  listAutographProfilesMock,
  listPublicAutographProfilesMock,
  getPublicAutographProfileMock,
  showcaseSpy,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  directorySpy: vi.fn(),
  listAutographProfilesMock: vi.fn(),
  listPublicAutographProfilesMock: vi.fn(),
  getPublicAutographProfileMock: vi.fn(),
  showcaseSpy: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: authMock,
}));

vi.mock("@/app/lib/autographs/service", () => ({
  autographService: {
    getPublicAutographProfile: getPublicAutographProfileMock,
    listAutographProfiles: listAutographProfilesMock,
    listPublicAutographProfiles: listPublicAutographProfilesMock,
  },
}));

vi.mock("@/app/components/ModuleLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <main data-testid="module-layout">{children}</main>,
}));

vi.mock("@aartisr/autograph-feature/profile-components", () => ({
  AutographProfileDirectory: (props: Record<string, unknown>) => {
    directorySpy(props);
    return <section data-testid="profile-directory" />;
  },
  AutographProfileShowcase: (props: Record<string, unknown>) => {
    showcaseSpy(props);
    return <section data-testid="profile-showcase" />;
  },
}));

describe("Buddhi Align autograph profile pages", () => {
  beforeEach(() => {
    authMock.mockReset();
    directorySpy.mockReset();
    showcaseSpy.mockReset();
    listAutographProfilesMock.mockReset();
    listPublicAutographProfilesMock.mockReset();
    getPublicAutographProfileMock.mockReset();
  });

  it("renders the native profile directory with Buddhi-local navigation links", async () => {
    listPublicAutographProfilesMock.mockResolvedValue([
      {
        id: "profile-1",
        displayName: "Teacher One",
        role: "teacher",
        headline: "Guides reflective practice",
        avatarUrl: "data:image/png;base64,AA==",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ]);

    render(await ProfilesPage());

    expect(screen.getByTestId("profile-directory")).toBeInTheDocument();
    expect(directorySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        exchangeHomeHref: "/autograph-exchange",
        exchangeReturnHref: "/autograph-exchange#autograph-request-composer",
        profilesHref: "/profiles",
        profiles: [
          expect.objectContaining({
            id: "profile-1",
            avatarUrl: "/api/autographs/profiles/profile-1/avatar",
          }),
        ],
      }),
    );
  });

  it("renders a native profile detail page and detects the viewer's own profile", async () => {
    getPublicAutographProfileMock.mockResolvedValue({
      id: "profile-2",
      displayName: "Teacher Two",
      role: "teacher",
      headline: "Keeps the practice grounded",
      avatarUrl: "data:image/png;base64,AA==",
      subjects: ["dhyana"],
      interests: ["reflection"],
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    listAutographProfilesMock.mockResolvedValue([
      {
        id: "profile-2",
        userId: "teacher-2",
        displayName: "Teacher Two",
        role: "teacher",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
    authMock.mockResolvedValue({
      user: {
        id: "teacher-2",
        email: "teacher@example.com",
      },
    });

    render(await ProfilePage({ params: { id: "profile-2" } }));

    expect(screen.getByTestId("profile-showcase")).toBeInTheDocument();
    expect(showcaseSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        canEdit: true,
        exchangeHomeHref: "/autograph-exchange",
        exchangeReturnHref: "/autograph-exchange#autograph-request-composer",
        outboxHref: "/autograph-exchange#autograph-requests-sent",
        profileSetupHref: "/autograph-exchange#autograph-profile-setup",
        profilesHref: "/profiles",
        viewer: {
          id: "teacher-2",
          email: "teacher@example.com",
        },
        viewerHasProfile: true,
        profile: expect.objectContaining({
          id: "profile-2",
          avatarUrl: "/api/autographs/profiles/profile-2/avatar",
        }),
      }),
    );
  });
});
