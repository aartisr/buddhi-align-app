import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AutographExchangePage from "./page";

const mockSession: {
  data:
    | {
        user: {
          id: string;
          name: string;
          email: string;
          image: null;
        };
      }
    | null;
  status: "loading" | "authenticated" | "unauthenticated";
} = {
  data: {
    user: {
      id: "u-1",
      name: "Asha",
      email: "asha@example.com",
      image: null,
    },
  },
  status: "authenticated",
};

const autographFeatureSpy = vi.fn();

vi.mock("next-auth/react", () => ({
  useSession: () => mockSession,
}));

vi.mock("@/app/i18n/provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/app/components/ModuleLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="module-layout">{children}</div>,
}));

vi.mock("@autograph-exchange/feature", () => ({
  AutographExchangeFeature: (props: Record<string, unknown>) => {
    autographFeatureSpy(props);
    return <div data-testid="autograph-feature-root">{String(props.authStatus)}</div>;
  },
}));

describe("AutographExchangePage", () => {
  beforeEach(() => {
    autographFeatureSpy.mockReset();
    mockSession.data = {
      user: {
        id: "u-1",
        name: "Asha",
        email: "asha@example.com",
        image: null,
      },
    };
    mockSession.status = "authenticated";
  });

  it("passes authenticated viewer state into the packaged autograph feature", () => {
    render(<AutographExchangePage />);

    expect(screen.getByTestId("autograph-feature-root")).toHaveTextContent("authenticated");
    expect(autographFeatureSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        authStatus: "authenticated",
        viewer: {
          id: "u-1",
          name: "Asha",
          email: "asha@example.com",
        },
        loadingMessage: "user.loadingSession",
        signedOutMessage: "auth.persistHint",
        signInLabel: "auth.signInToSave",
        signInHref: "/sign-in",
      }),
    );
  });

  it("passes unauthenticated state so the packaged feature can show its public landing screen", () => {
    mockSession.data = null;
    mockSession.status = "unauthenticated";

    render(<AutographExchangePage />);

    expect(screen.getByTestId("autograph-feature-root")).toHaveTextContent("unauthenticated");
    expect(autographFeatureSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        authStatus: "unauthenticated",
        viewer: null,
      }),
    );
  });

  it("passes loading state through to the packaged feature", () => {
    mockSession.status = "loading";

    render(<AutographExchangePage />);

    expect(screen.getByTestId("autograph-feature-root")).toHaveTextContent("loading");
    expect(autographFeatureSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        authStatus: "loading",
      }),
    );
  });
});
