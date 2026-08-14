import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ComplianceBadge from "./ComplianceBadge";

describe("ComplianceBadge", () => {
  it("renders the local badge asset directly and prioritizes the header image", () => {
    render(
      <ComplianceBadge
        variant="header"
        href="https://www.foreverlotus.com/awaricon/legal"
        src="/awaricon-platinum.svg"
        alt="Awaricon Platinum compliance badge"
        ariaLabel="Awaricon Platinum compliance badge"
      />,
    );

    const image = screen.getByRole("img", { name: "Awaricon Platinum compliance badge" });
    expect(image).toHaveAttribute("src", "/awaricon-platinum.svg");
    expect(image).toHaveAttribute("fetchpriority", "high");
  });
});
