import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import AutographExchangePage from "./page";

const mockHook = vi.fn();

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: {
        id: "u-1",
        name: "Asha",
        email: "asha@example.com",
        image: null,
      },
    },
    status: "authenticated",
  }),
}));

vi.mock("@/app/i18n/provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/app/components/ModuleLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("../hooks/useAutographExchange", () => ({
  useAutographExchange: () => mockHook(),
}));

describe("AutographExchangePage", () => {
  beforeEach(() => {
    mockHook.mockReset();
    mockHook.mockReturnValue({
      myProfile: { userId: "u-1", displayName: "Asha", role: "student" },
      availableSigners: [
        { userId: "s-1", displayName: "Mira", role: "teacher" },
      ],
      inbox: [
        {
          id: "pending-1",
          requesterUserId: "r-1",
          signerUserId: "u-1",
          requesterDisplayName: "Mira",
          signerDisplayName: "Asha",
          requesterRole: "teacher",
          signerRole: "student",
          message: "Keep your practice steady.",
          signatureText: null,
          status: "pending",
          createdAt: new Date("2026-01-10T10:00:00.000Z").toISOString(),
          signedAt: null,
        },
      ],
      archive: [
        {
          id: "signed-1",
          requesterUserId: "r-2",
          signerUserId: "u-1",
          requesterDisplayName: "Sana",
          signerDisplayName: "Asha",
          requesterRole: "teacher",
          signerRole: "student",
          message: "Remember your center.",
          signatureText: "With blessings and focus.",
          status: "signed",
          createdAt: new Date("2026-01-09T08:00:00.000Z").toISOString(),
          signedAt: new Date("2026-01-10T08:00:00.000Z").toISOString(),
        },
        {
          id: "signed-2",
          requesterUserId: "r-3",
          signerUserId: "u-1",
          requesterDisplayName: "Ishan",
          signerDisplayName: "Asha",
          requesterRole: "teacher",
          signerRole: "student",
          message: "Practice with compassion.",
          signatureText: "Proud of your discipline.",
          status: "signed",
          createdAt: new Date("2026-01-08T08:00:00.000Z").toISOString(),
          signedAt: new Date("2026-01-11T08:00:00.000Z").toISOString(),
        },
      ],
      outbox: [
        {
          id: "out-1",
          requesterUserId: "u-1",
          signerUserId: "s-1",
          requesterDisplayName: "Asha",
          signerDisplayName: "Dev",
          requesterRole: "student",
          signerRole: "teacher",
          message: "Please sign my journal page.",
          signatureText: null,
          status: "pending",
          createdAt: new Date("2026-01-12T09:00:00.000Z").toISOString(),
          signedAt: null,
        },
      ],
      loading: false,
      error: null,
      saveProfile: vi.fn(),
      requestAutograph: vi.fn(),
      signAutograph: vi.fn().mockResolvedValue({ ok: true }),
      busyAction: null,
    });
  });

  it("renders lane workspace and hero summary", () => {
    render(<AutographExchangePage />);

    expect(screen.getByTestId("autograph-lanes")).toBeInTheDocument();
    expect(screen.getByText("Autograph Exchange")).toBeInTheDocument();
    expect(screen.getByText("Requests you sent")).toBeInTheDocument();
    expect(screen.getByText("Signed autographs")).toBeInTheDocument();
  });

  it("opens sign editor for pending request", () => {
    render(<AutographExchangePage />);

    const card = screen.getByTestId("pending-request-card");
    expect(card).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Open signing form/i }));

    expect(screen.getByTestId("sign-editor")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm signature" })).toBeInTheDocument();
  });

  it("filters signed archive by search text", () => {
    render(<AutographExchangePage />);

    expect(screen.getByText("Remember your center.")).toBeInTheDocument();
    expect(screen.getByText("Practice with compassion.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Filter signed autographs"), {
      target: { value: "center" },
    });

    expect(screen.getByText("Remember your center.")).toBeInTheDocument();
    expect(screen.queryByText("Practice with compassion.")).not.toBeInTheDocument();
  });

  it("allows changing archive sort without errors", () => {
    render(<AutographExchangePage />);

    fireEvent.change(screen.getByLabelText("Sort signed autographs"), {
      target: { value: "oldest" },
    });

    expect(screen.getAllByTestId("signed-request-card").length).toBeGreaterThan(0);
  });

  it("renders outgoing section cards", () => {
    render(<AutographExchangePage />);

    expect(screen.getByText("autograph.outbox.title")).toBeInTheDocument();
    expect(screen.getByText("Please sign my journal page.")).toBeInTheDocument();
    expect(screen.getByText("Dev")).toBeInTheDocument();
  });
});
