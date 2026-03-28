import React from "react";
import Link from "next/link";

export interface BuddhiDashboardProps {
  userName?: string;
  heading: string;
  subtitle: string;
  welcomeTemplate: string;
  modules: Array<{
    key: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    href: string;
  }>;
}

export const BuddhiDashboard: React.FC<BuddhiDashboardProps> = ({
  userName,
  heading,
  subtitle,
  welcomeTemplate,
  modules,
}) => (
  <section className="mb-12">
    <h2 className="text-3xl font-semibold mb-2 text-zinc-900">
      {userName ? welcomeTemplate.replace("{{name}}", userName) : heading}
    </h2>
    <p className="app-copy mb-4">{subtitle}</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {modules.map((mod) => {
        const isInternal = mod.href.startsWith("/");
        const commonProps = {
          className:
            "app-dashboard-card group rounded-lg p-6 hover:shadow-lg focus:shadow-lg transition flex items-center gap-4 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 active:scale-95 cursor-pointer",
          "aria-label": mod.title,
          tabIndex: 0,
        };
        const content = (
          <>
            <span className="text-3xl group-hover:scale-110 group-focus:scale-110 transition-transform">{mod.icon}</span>
            <span>
              <h3 className="app-section-heading font-bold text-lg mb-1 group-hover:underline group-focus:underline">{mod.title}</h3>
              <p className="app-copy">{mod.description}</p>
            </span>
          </>
        );
        if (isInternal) {
          // Use Next.js Link for internal navigation
          return (
            <Link href={mod.href} key={mod.key} {...commonProps}>
              {content}
            </Link>
          );
        } else {
          // External or fallback to anchor
          return (
            <a
              key={mod.key}
              {...commonProps}
              href={mod.href}
              target={mod.href.startsWith("http") ? "_blank" : undefined}
              rel={mod.href.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {content}
            </a>
          );
        }
      })}
    </div>
  </section>
);
