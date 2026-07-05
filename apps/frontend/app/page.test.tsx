import { render, screen } from "@testing-library/react";
import Home from "./page";
import React from "react";
import { describe, expect, it, vi } from "vitest";

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
    { key: "karma", title: "Karma Yoga Tracker", navLabel: "Karma Yoga Tracker", href: "/karma-yoga", icon: "🙏" },
    { key: "bhakti", title: "Bhakti Journal", navLabel: "Bhakti Journal", href: "/bhakti-journal", icon: "💗" },
    { key: "jnana", title: "Jnana Reflection", navLabel: "Jnana Reflection", href: "/jnana-reflection", icon: "🧠" },
    { key: "dhyana", title: "Dhyana Meditation", navLabel: "Dhyana Meditation", href: "/dhyana-meditation", icon: "🧘" },
    { key: "vasana", title: "Vasana Tracker", navLabel: "Vasana Tracker", href: "/vasana-tracker", icon: "🪷" },
    { key: "dharma", title: "Dharma Planner", navLabel: "Dharma Planner", href: "/dharma-planner", icon: "📜" },
    { key: "motivation", title: "Motivation & Analytics", navLabel: "Motivation & Analytics", href: "/motivation-analytics", icon: "📊" },
  ],
}));

describe("Home page", () => {
  it("renders a simplified Copilot-first dashboard with quick access modules", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: "app.dashboard", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Decide. Do. Reflect.", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start now" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Everything else, one tap away", level: 2 })).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "dashboard.flow.plan.cta" })).toHaveAttribute("href", "/dharma-planner");
    expect(screen.getByRole("link", { name: "dashboard.flow.practice.cta" })).toHaveAttribute("href", "/karma-yoga");
    expect(screen.getByRole("link", { name: "dashboard.flow.reflect.cta" })).toHaveAttribute("href", "/jnana-reflection");

    expect(screen.getByRole("link", { name: /Bhakti Journal/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Dhyana Meditation/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Vasana Tracker/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Motivation & Analytics/i })).toBeInTheDocument();
  });
});
