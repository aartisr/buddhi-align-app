import { render, screen } from "@testing-library/react";
import Home from "./page";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@buddhi-align/shared-ui", () => ({
  BuddhiDashboard: ({
    modules,
    userName,
    heading,
    subtitle,
    welcomeTemplate,
  }: {
    modules: Array<{ title: string }>;
    userName?: string;
    heading: string;
    subtitle: string;
    welcomeTemplate: string;
  }) => (
    <section>
      <h2>{userName ? welcomeTemplate.replace("{{name}}", userName) : heading}</h2>
      <p>{subtitle}</p>
      <ul>
        {modules.map((module) => (
          <li key={module.title}>{module.title}</li>
        ))}
      </ul>
    </section>
  ),
}));

vi.mock("./components/ModuleLayout", () => ({
  default: ({ titleKey, children }: { titleKey: string; children: React.ReactNode }) => (
    <main>
      <h1>{titleKey}</h1>
      {children}
    </main>
  ),
}));

vi.mock("./i18n/provider", () => ({
  useI18n: () => ({
    t: (key: string, vars?: Record<string, string>) => {
      if (key === "dashboard.welcome") return "Welcome, {{name}}";
      if (key === "dashboard.defaultUser") return "Seeker";
      if (key === "dashboard.subtitle") return "Your unified overview for self-development and spiritual growth.";
      if (key === "app.dashboard") return "Buddhi Dashboard";
      if (vars) {
        return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{{${k}}}`, v), key);
      }
      return key;
    },
  }),
  useLocalizedModules: () => [
    { key: "karma", title: "Karma Yoga Tracker" },
    { key: "bhakti", title: "Bhakti Journal" },
    { key: "jnana", title: "Jnana Reflection" },
    { key: "dhyana", title: "Dhyana Meditation" },
    { key: "vasana", title: "Vasana Tracker" },
    { key: "dharma", title: "Dharma Planner" },
    { key: "motivation", title: "Motivation & Analytics" },
  ],
}));

describe("Home page", () => {
  it("renders dashboard heading and all configured modules", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: "app.dashboard", level: 1 })).toBeInTheDocument();
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
      expect(screen.getAllByText(moduleTitle).length).toBeGreaterThan(0);
    }
  });
});
