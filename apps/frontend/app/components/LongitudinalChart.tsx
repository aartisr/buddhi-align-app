"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useI18n } from "../i18n/provider";
import type { LongitudinalPayload } from "../api/data/longitudinal/route";
import { logEvent } from "../lib/logEvent";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const MODULE_COLORS: Record<string, string> = {
  karma: "#FFD700",
  bhakti: "#FF69B4",
  jnana: "#4B0082",
  dhyana: "#50C878",
  vasana: "#32CD32",
  dharma: "#1E90FF",
};

export default function LongitudinalChart() {
  const { t } = useI18n();
  const [data, setData] = useState<LongitudinalPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/data/longitudinal")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setData(d);
          logEvent("longitudinal_fetch_success", {
            consistencyScore: d.consistencyScore,
            weeks: d.weeks?.length ?? 0,
          });
        } else {
          logEvent("longitudinal_fetch_failed");
        }
      })
      .catch(() => {
        logEvent("longitudinal_fetch_failed");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="app-surface-card w-full max-w-3xl rounded-2xl p-4 sm:p-6 mb-8 sm:mb-10 mx-auto">
        <div className="app-stat-skeleton" style={{ height: "220px", width: "100%", borderRadius: "12px" }} />
      </div>
    );
  }

  if (!data || data.weeks.length === 0) return null;

  const modules = ["karma", "bhakti", "jnana", "dhyana", "vasana", "dharma"] as const;
  const series = modules.map((mod) => ({
    name: t(`layout.module.${mod}` as Parameters<typeof t>[0]),
    data: data.weeks.map((w) => w.counts[mod] ?? 0),
  }));

  const categories = data.weeks.map((w) => {
    const d = new Date(w.weekStart);
    return `${d.toLocaleString("default", { month: "short" })} ${d.getDate()}`;
  });

  const chartOptions = {
    chart: {
      type: "area" as const,
      height: 280,
      toolbar: { show: false },
      sparkline: { enabled: false },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" as const, width: 2 },
    fill: { type: "gradient", gradient: { shadeIntensity: 0.4, opacityFrom: 0.55, opacityTo: 0.05 } },
    colors: modules.map((m) => MODULE_COLORS[m]),
    xaxis: {
      categories,
      labels: { style: { fontSize: "12px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { fontSize: "12px" } },
      min: 0,
    },
    legend: { position: "top" as const, fontSize: "13px" },
    grid: { strokeDashArray: 4, borderColor: "rgba(0,0,0,0.07)" },
    tooltip: { x: { show: true } },
  };

  const growthLabel = data.growthModule
    ? t(`layout.module.${data.growthModule}` as Parameters<typeof t>[0])
    : null;

  return (
    <div className="app-surface-card app-longitudinal w-full max-w-3xl rounded-2xl p-4 sm:p-6 mb-8 sm:mb-10 mx-auto">
      <h3 className="app-panel-title text-lg sm:text-xl font-bold mb-1 text-center">
        {t("motivation.trend.title")}
      </h3>
      <p className="app-secondary-copy text-sm text-center mb-4">{t("motivation.trend.subtitle")}</p>

      {/* Insight chips */}
      <div className="flex flex-wrap gap-3 justify-center mb-5">
        <div className="app-insight-chip app-insight-chip--indigo">
          <span className="app-insight-chip__icon">📅</span>
          <span>
            <strong>{data.consistencyScore}%</strong>{" "}
            {t("motivation.trend.consistency")}
          </span>
        </div>
        {growthLabel && (
          <div className="app-insight-chip app-insight-chip--emerald">
            <span className="app-insight-chip__icon">📈</span>
            <span>
              {t("motivation.trend.growth")}{" "}
              <strong>{growthLabel}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Consistency score bar */}
      <div className="app-consistency-bar mb-5" aria-label={`Consistency ${data.consistencyScore}%`}>
        <div
          className="app-consistency-bar__fill"
          style={{ width: `${data.consistencyScore}%` }}
        />
      </div>

      {/* Area chart */}
      <div className="w-full h-56 sm:h-72">
        {typeof window !== "undefined" && (
          <Chart options={chartOptions} series={series} type="area" height={280} />
        )}
      </div>
    </div>
  );
}
