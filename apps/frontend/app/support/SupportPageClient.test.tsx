import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SupportPageClient from "./SupportPageClient";

let searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useSearchParams: () => searchParams,
}));

describe("SupportPageClient", () => {
  beforeEach(() => {
    searchParams = new URLSearchParams();
  });

  it("keeps the send action available and exposes field validation rules", () => {
    render(<SupportPageClient />);

    expect(screen.getByRole("button", { name: "Send report" })).toBeEnabled();
    expect(screen.getByLabelText("Short issue title")).toHaveAttribute("minLength", "8");
    expect(screen.getByLabelText("What were you trying to do?")).toHaveAttribute("minLength", "10");
    expect(screen.getByLabelText("What happened instead?")).toHaveAttribute("minLength", "10");
  });

  it("prefills a copilot support draft from safe query parameters", async () => {
    searchParams = new URLSearchParams({
      source: "copilot",
      category: "community",
      severity: "high",
      title: "Community SSO problem",
      page: "/community",
      tryingToDo: "Open the Bhakti discussion room",
      actualBehavior: "The page did not load",
      expectedBehavior: "The community topic should open",
    });

    render(<SupportPageClient />);

    expect(await screen.findByDisplayValue("Community SSO problem")).toBeInTheDocument();
    expect(screen.getByDisplayValue("/community")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Open the Bhakti discussion room")).toBeInTheDocument();
    expect(screen.getByDisplayValue("The page did not load")).toBeInTheDocument();
    expect(screen.getByDisplayValue("The community topic should open")).toBeInTheDocument();
    expect(screen.getByLabelText("What kind of issue is this?")).toHaveValue("community");
  });
});
