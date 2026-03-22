import React from "react";
import { BuddhiDashboard } from "@buddhi-align/shared-ui";
import ModuleLayout from "./components/ModuleLayout";

export default function Home() {
  const modules = [
    {
      key: "karma",
      title: "Karma Yoga Tracker",
      description: "Track your selfless actions and service.",
      icon: "\u{1F64F}",
      href: "/karma-yoga",
    },
    {
      key: "bhakti",
      title: "Bhakti Journal",
      description: "Reflect on devotion and gratitude.",
      icon: "\u{1F33F}",
      href: "/bhakti-journal",
    },
    {
      key: "jnana",
      title: "Jnana Reflection",
      description: "Capture insights and contemplations.",
      icon: "\u{1F9D8}",
      href: "/jnana-reflection",
    },
    {
      key: "dhyana",
      title: "Dhyana Meditation",
      description: "Guided and self-led meditation tools.",
      icon: "\u{1F9D8}\u200D\u2642\uFE0F",
      href: "/dhyana-meditation",
    },
    {
      key: "vasana",
      title: "Vasana Tracker",
      description: "Monitor habits and tendencies.",
      icon: "\u{1F4DD}",
      href: "/vasana-tracker",
    },
    {
      key: "dharma",
      title: "Dharma Planner",
      description: "Align goals and actions with your purpose.",
      icon: "\u{1F4C8}",
      href: "/dharma-planner",
    },
    {
      key: "motivation",
      title: "Motivation & Analytics",
      description: "Deep insights and inspiration.",
      icon: "\u{1F3C6}",
      href: "/motivation-analytics",
    },
  ];
  return (
    <ModuleLayout title="Buddhi Dashboard">
      <BuddhiDashboard userName="Seeker" modules={modules} />
    </ModuleLayout>
  );
}
