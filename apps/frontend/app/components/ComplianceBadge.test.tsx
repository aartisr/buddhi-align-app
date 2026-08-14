import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ComplianceBadge from "./ComplianceBadge";
import AwariconPlatinumMark from "./AwariconPlatinumMark";

describe("ComplianceBadge", () => {
  it("renders an inline mark without a static-asset request", () => {
    render(
      <ComplianceBadge
        variant="header"
        href="https://www.foreverlotus.com/awaricon/legal"
        src="/awaricon-platinum.svg"
        alt="Awaricon Platinum compliance badge"
        ariaLabel="Awaricon Platinum compliance badge"
        renderMark={(className) => <AwariconPlatinumMark className={className} />}
      />,
    );

    const mark = screen.getByRole("img", { name: "Awaricon Platinum badge" });
    expect(mark.tagName).toBe("svg");
    expect(mark).toHaveClass("app-platinum-badge__image");
    expect(screen.queryByRole("img", { name: "Awaricon Platinum compliance badge" })).not.toBeInTheDocument();
  });
});
