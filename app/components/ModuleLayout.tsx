import Link from "next/link";
import React from "react";

// Map page titles to their emoji icons
const moduleIcons: Record<string, string> = {
  "Karma Yoga Tracker": "🙏",
  "Bhakti Journal": "🌸",
  "Jnana Reflection": "🧘‍♂️",
  "Dhyana Meditation": "🧘‍♀️",
  "Vasana Tracker": "🌱",
  "Dharma Planner": "📜",
  "Motivation & Analytics": "🏆",
  "Buddhi Dashboard": "🧠"
};

export default function ModuleLayout({ title, children }: { title: string; children: React.ReactNode }) {
  const icon = moduleIcons[title] || "";
  return (
    <div className="min-h-screen relative font-sans">
      {/* Background handled globally in layout.tsx */}
      {/* Large, subtle background icon for each module, absolutely centered in main content */}
      <div className="relative">
        {icon && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
            aria-hidden
          >
            <span className="buddhi-bg-icon">{icon}</span>
          </div>
        )}
        {/* Main content overlayed above icon */}
        <header className="w-full px-6 py-4 flex items-center justify-between border-b border-zinc-200 bg-white/80 dark:bg-zinc-900/80 backdrop-blur relative z-10">
          <h1 className="text-2xl font-bold tracking-tight text-indigo-700 dark:text-gold drop-shadow-lg">
            <Link href="/">Buddhi Align App</Link>
          </h1>
          <nav className="flex gap-4 text-sm font-medium">
            <Link href="/karma-yoga" className="hover:underline">Karma Yoga</Link>
            <Link href="/bhakti-journal" className="hover:underline">Bhakti Journal</Link>
            <Link href="/jnana-reflection" className="hover:underline">Jnana Reflection</Link>
            <Link href="/dhyana-meditation" className="hover:underline">Dhyana Meditation</Link>
            <Link href="/vasana-tracker" className="hover:underline">Vasana Tracker</Link>
            <Link href="/dharma-planner" className="hover:underline">Dharma Planner</Link>
          </nav>
        </header>
        <main className="max-w-2xl mx-auto py-12 px-4 sm:px-8 relative z-10">
          <h2 className="text-3xl font-semibold mb-8 text-center text-indigo-900 dark:text-gold drop-shadow-xl">
            {title}
          </h2>
          {children}
        </main>
      </div>
      {/* Overlay removed to reveal global background */}
    </div>
  );
}
