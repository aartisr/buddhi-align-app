import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SupportPageClient from "./SupportPageClient";

const searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useSearchParams: () => searchParams,
}));

describe("SupportPageClient", () => {
  it("keeps the send action available and exposes field validation rules", () => {
    render(<SupportPageClient />);

    expect(screen.getByRole("button", { name: "Send report" })).toBeEnabled();
    expect(screen.getByLabelText("Short issue title")).toHaveAttribute("minLength", "8");
    expect(screen.getByLabelText("What were you trying to do?")).toHaveAttribute("minLength", "10");
    expect(screen.getByLabelText("What happened instead?")).toHaveAttribute("minLength", "10");
  });
});
