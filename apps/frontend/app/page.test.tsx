import { render, screen } from "@testing-library/react";
import Home from "./page";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@buddhi-align/shared-ui", () => ({
  BuddhiDashboard: ({ modules, userName }: { modules: Array<{ title: string }>; userName?: string }) => (
    <section>
      <h2>{userName ? `Welcome, ${userName}` : "Buddhi Dashboard"}</h2>
      <ul>
        {modules.map((module) => (
          <li key={module.title}>{module.title}</li>
        ))}
      </ul>
    </section>
  ),
}));

vi.mock("./components/ModuleLayout", () => ({
  default: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <main>
      <h1>{title}</h1>
      {children}
    </main>
  ),
}));

describe("Home page", () => {
  it("renders dashboard heading and all configured modules", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: "Buddhi Dashboard", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Welcome, Seeker", level: 2 })).toBeInTheDocument();

    const expectedModules = [
      "Karma Yoga Tracker",
      "Bhakti Journal",
      "Jnana Reflection",
      "Dhyana Meditation",
      "Vasana Tracker",
      "Dharma Planner",
      "Motivation & Analytics",
    ];

    for (const moduleTitle of expectedModules) {
      expect(screen.getByText(moduleTitle)).toBeInTheDocument();
    }
  });
});
