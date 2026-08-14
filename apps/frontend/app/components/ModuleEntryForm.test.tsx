import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ModuleEntryForm from "./ModuleEntryForm";

const {
  usePathnameMock,
  useSearchParamsMock,
  logEventMock,
} = vi.hoisted(() => ({
  usePathnameMock: vi.fn(),
  useSearchParamsMock: vi.fn(),
  logEventMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: usePathnameMock,
  useSearchParams: useSearchParamsMock,
}));

vi.mock("@/app/lib/logEvent", () => ({
  logEvent: logEventMock,
}));

describe("ModuleEntryForm invite conversion tracking", () => {
  beforeEach(() => {
    usePathnameMock.mockReturnValue("/karma-yoga");
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    logEventMock.mockReset();
    window.sessionStorage.clear();
    document.cookie = "buddhi-align-anonymous=; path=/; max-age=0";

    Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
      configurable: true,
      value() {
        this.setAttribute("open", "");
      },
    });
    Object.defineProperty(HTMLDialogElement.prototype, "close", {
      configurable: true,
      value() {
        this.removeAttribute("open");
      },
    });
  });

  it("logs conversion once on invite submit", async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("source=invite&module=karma"));
    const onSubmit = vi.fn(async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
    });

    render(
      <ModuleEntryForm
        title="Karma"
        icon="🙏"
        className="test-form"
        onSubmit={onSubmit}
        submitLabel="Save"
      >
        <input aria-label="field" />
      </ModuleEntryForm>,
    );

    const form = screen.getByLabelText("Karma");
    fireEvent.submit(form);
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(2);
      expect(logEventMock).toHaveBeenCalledTimes(1);
      expect(logEventMock).toHaveBeenCalledWith(
        "invite_first_entry_submitted",
        expect.objectContaining({
          source: "invite",
          module: "karma",
          path: "/karma-yoga",
        }),
      );
    });
  });

  it("does not log conversion for non-invite submit", async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("source=organic"));
    const onSubmit = vi.fn(async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
    });

    render(
      <ModuleEntryForm
        title="Karma"
        icon="🙏"
        className="test-form"
        onSubmit={onSubmit}
        submitLabel="Save"
      >
        <input aria-label="field" />
      </ModuleEntryForm>,
    );

    const form = screen.getByLabelText("Karma");
    fireEvent.submit(form);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(logEventMock).not.toHaveBeenCalled();
  });

  it("asks anonymous visitors to sign in only when they submit an entry and preserves the draft", async () => {
    document.cookie = "buddhi-align-anonymous=1; path=/";
    const onSubmit = vi.fn();

    render(
      <ModuleEntryForm
        title="Karma"
        icon="🙏"
        className="test-form"
        onSubmit={onSubmit}
        submitLabel="Save"
      >
        <input id="module-field-action" aria-label="field" defaultValue="Helped a neighbor" required />
      </ModuleEntryForm>,
    );

    fireEvent.submit(screen.getByLabelText("Karma"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toHaveAttribute("open");
    });
    expect(onSubmit).not.toHaveBeenCalled();

    const signInLink = screen.getByRole("link", { name: "Sign in to save" });
    const click = new MouseEvent("click", { bubbles: true, cancelable: true });
    click.preventDefault();
    signInLink.dispatchEvent(click);

    expect(signInLink).toHaveAttribute("href", "/sign-in?callbackUrl=%2Fkarma-yoga&intent=save");
    expect(window.sessionStorage.getItem("buddhi-align:anonymous-entry-draft:/karma-yoga")).toContain("Helped a neighbor");
  });
});
