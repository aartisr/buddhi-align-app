import { render, screen } from "@testing-library/react";
import Home from "./page";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./components/ModuleLayout", () => ({
  default: ({ titleKey, heading, children }: { titleKey: string; heading?: string; children: React.ReactNode }) => (
    <main>
      <h1>{heading ?? titleKey}</h1>
      {children}
    </main>
  ),
}));

vi.mock("./i18n/provider", () => ({
  useI18n: () => ({
    t: (key: string, vars?: Record<string, string>) => {
      const translations: Record<string, string> = {
        "app.dashboard": "Buddhi Dashboard",
        "dashboard.heading": "A gentle practice for today",
        "dashboard.flow.aria": "Guided daily flow",
        "dashboard.flow.kicker": "One mindful rhythm",
        "dashboard.flow.title": "Decide. Do. Reflect.",
        "dashboard.flow.subtitle": "Begin with one purpose-aligned intention, offer one meaningful action, and make space to notice what you learn.",
        "dashboard.flow.primaryCta": "Start now",
        "dashboard.flow.plan.title": "Plan your intention",
        "dashboard.flow.plan.description": "Set a dharma goal",
        "dashboard.flow.plan.cta": "Open Dharma Planner",
        "dashboard.flow.practice.title": "Do one meaningful practice",
        "dashboard.flow.practice.description": "Record one meaningful practice",
        "dashboard.flow.practice.cta": "Open Karma Yoga",
        "dashboard.flow.reflect.title": "Reflect and realign",
        "dashboard.flow.reflect.description": "Capture insight",
        "dashboard.flow.reflect.cta": "Open Jnana Reflection",
        "dashboard.morePractices": "Explore {{count}} more practice areas",
        "dashboard.moreWays": "More ways to practice",
        "dashboard.seeMomentum": "See momentum",
      };
      const message = translations[key] ?? key;
      if (vars) {
        return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{{${k}}}`, v), message);
      }
      return message;
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

    expect(screen.getByRole("heading", { name: "A gentle practice for today", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Decide. Do. Reflect.", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start now" })).toBeInTheDocument();
    expect(screen.getByText("Explore 4 more practice areas")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Open Dharma Planner" })).toHaveAttribute("href", "/dharma-planner");
    expect(screen.getByRole("link", { name: "Open Karma Yoga" })).toHaveAttribute("href", "/karma-yoga");
    expect(screen.getByRole("link", { name: "Open Jnana Reflection" })).toHaveAttribute("href", "/jnana-reflection");

    expect(screen.getByText("Explore 4 more practice areas")).toBeInTheDocument();
  });
});
