"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "../i18n/provider";
import type { AnalyticsPayload } from "../api/analytics/types";
import type { TranslationKey } from "../i18n/config";

const RING_R = 22;
const RING_C = 2 * Math.PI * RING_R;

interface ModuleMeta {
  key: string;
  icon: string;
  href: string;
  color: string;
  labelKey: TranslationKey;
}

const MODULE_META: ModuleMeta[] = [
  { key: "karma",  icon: "🙏",  href: "/karma-yoga",        color: "#10b981", labelKey: "layout.module.karma"  },
  { key: "bhakti", icon: "🌸",  href: "/bhakti-journal",    color: "#f43f5e", labelKey: "layout.module.bhakti" },
  { key: "jnana",  icon: "🧘",  href: "/jnana-reflection",  color: "#6366f1", labelKey: "layout.module.jnana"  },
  { key: "dhyana", icon: "🌀",  href: "/dhyana-meditation", color: "#0ea5e9", labelKey: "layout.module.dhyana" },
  { key: "vasana", icon: "🌱",  href: "/vasana-tracker",    color: "#f59e0b", labelKey: "layout.module.vasana" },
  { key: "dharma", icon: "📜",  href: "/dharma-planner",    color: "#8b5cf6", labelKey: "layout.module.dharma" },
];

export default function DailyRings() {
  const { t } = useI18n();
  const [todayActivity, setTodayActivity] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((data: AnalyticsPayload) => setTodayActivity(data.todayActivity))
      .catch(() => {});
  }, []);

  return (
    <section className="app-daily-rings-section mb-8" aria-label={t("dailyrings.title")}>
      <h3 className="app-daily-rings-title text-center font-semibold mb-1">
        {t("dailyrings.title")}
      </h3>
      <p className="app-daily-rings-subtitle text-center text-xs mb-4">
        {t("dailyrings.subtitle")}
      </p>
      <div className="flex flex-wrap justify-center gap-5 sm:gap-7">
        {MODULE_META.map((mod) => {
          const done = todayActivity?.[mod.key] ?? false;
          const completedRingOffset = 0;
          const emptyRingOffset = RING_C * 0.78;
          return (
            <Link
              key={mod.key}
              href={mod.href}
              className="app-daily-ring-item flex flex-col items-center gap-1"
              aria-label={`${t(mod.labelKey)}${done ? " — completed today" : " — not yet logged today"}`}
            >
              <div className="relative">
                <svg width="60" height="60" viewBox="0 0 60 60">
                  {/* Track */}
                  <circle cx="30" cy="30" r={RING_R} fill="none" stroke="#e5e7eb" strokeWidth="5" />
                  {/* Fill ring */}
                  <circle
                    cx="30" cy="30" r={RING_R}
                    fill="none"
                    stroke={done ? mod.color : "#d1d5db"}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={RING_C}
                    strokeDashoffset={done ? completedRingOffset : emptyRingOffset}
                    transform="rotate(-90 30 30)"
                    style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.34,1.56,0.64,1), stroke 0.4s ease" }}
                  />
                  {/* Icon */}
                  <text x="30" y="35" textAnchor="middle" fontSize="18" role="img" aria-hidden="true">
                    {mod.icon}
                  </text>
                </svg>
                {done && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full text-white font-bold app-daily-ring-check"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                )}
              </div>
              <span className="app-daily-ring-label text-xs font-medium text-center leading-tight" style={{ color: mod.color }}>
                {t(mod.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
