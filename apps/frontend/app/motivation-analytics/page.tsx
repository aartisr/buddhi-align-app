"use client";

import dynamic from "next/dynamic";
import ModuleLayout from "../components/ModuleLayout";
import { useCallback, useEffect, useState } from "react";
import { MOTIVATIONAL_QUOTES } from "../i18n/config";
import { useI18n } from "../i18n/provider";
import type { AnalyticsPayload } from "../api/analytics/types";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

function getRandomQuote(quotes: { quote: string; author: string }[]) {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export default function MotivationAnalyticsPage() {
  const { locale, t } = useI18n();
  const quotes = MOTIVATIONAL_QUOTES[locale] ?? MOTIVATIONAL_QUOTES.en;
  const [quote, setQuote] = useState(getRandomQuote(quotes));
  const [loadingStats, setLoadingStats] = useState(true);

  const [stats, setStats] = useState({
    karma: 0,
    bhakti: 0,
    jnana: 0,
    dhyana: 0,
    vasana: 0,
    dharma: 0,
    streak: 0,
    totalEntries: 0
  });
  const [chartData, setChartData] = useState({
    series: [{
      name: t("motivation.entries"),
      data: [0, 0, 0, 0, 0, 0]
    }],
    options: {
      chart: {
        type: "bar" as const,
        height: 350,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          borderRadius: 8,
          horizontal: false,
          distributed: true
        }
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: [
          t("layout.module.karma"),
          t("layout.module.bhakti"),
          t("layout.module.jnana"),
          t("layout.module.dhyana"),
          t("layout.module.vasana"),
          t("layout.module.dharma")
        ],
        labels: { style: { fontSize: "16px" } }
      },
      yaxis: {
        title: { text: t("motivation.entries") },
        labels: { style: { fontSize: "16px" } }
      },
      colors: ["#FFD700", "#FF69B4", "#4B0082", "#50C878", "#32CD32", "#1E90FF"],
      title: {
        text: t("motivation.moduleActivityOverview"),
        align: "center" as const,
        style: { fontSize: "20px", color: "#333" }
      }
    }
  });

  const fetchAnalytics = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error("analytics fetch failed");
      const data: AnalyticsPayload = await res.json();
      const newStats = {
        karma: data.counts.karma,
        bhakti: data.counts.bhakti,
        jnana: data.counts.jnana,
        dhyana: data.counts.dhyana,
        vasana: data.counts.vasana,
        dharma: data.counts.dharma,
        streak: data.streak,
        totalEntries: data.totalEntries,
      };
      setStats(newStats);
      setChartData((prev) => ({
        ...prev,
        series: [{
          name: t("motivation.entries"),
          data: [
            newStats.karma,
            newStats.bhakti,
            newStats.jnana,
            newStats.dhyana,
            newStats.vasana,
            newStats.dharma,
          ],
        }],
      }));
    } catch {
      // Non-fatal: stats remain at zero if analytics API is unavailable.
    } finally {
      setLoadingStats(false);
    }
  }, [t]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    setChartData((prev) => ({
      ...prev,
      series: [{ ...prev.series[0], name: t("motivation.entries") }],
      options: {
        ...prev.options,
        xaxis: {
          ...prev.options.xaxis,
          categories: [
            t("layout.module.karma"),
            t("layout.module.bhakti"),
            t("layout.module.jnana"),
            t("layout.module.dhyana"),
            t("layout.module.vasana"),
            t("layout.module.dharma"),
          ],
        },
        yaxis: {
          ...prev.options.yaxis,
          title: { text: t("motivation.entries") },
        },
        title: {
          ...prev.options.title,
          text: t("motivation.moduleActivityOverview"),
        },
      },
    }));
    setQuote(getRandomQuote(quotes));
  }, [locale, t, quotes]);

  return (
    <ModuleLayout titleKey="module.motivation.title">
      <section className="mb-8 sm:mb-10 flex flex-col items-center justify-center">
        <div className="app-analytics-hero max-w-2xl p-4 sm:p-8 rounded-2xl shadow-xl text-center mb-6 sm:mb-8 w-full">
          <h2 className="app-panel-title text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">{t("motivation.title")}</h2>
          <blockquote className="app-quote-text italic text-base sm:text-xl md:text-2xl mb-2">&ldquo;{quote.quote}&rdquo;</blockquote>
          <div className="app-author-text text-base sm:text-lg font-semibold">— {quote.author}</div>
          <div className="flex justify-center mt-4 sm:mt-6">
            <button
              className="app-button-primary app-button-primary--analytics"
              style={{ width: "auto", minWidth: "11rem" }}
              onClick={() => setQuote(getRandomQuote(quotes))}
              aria-label={t("motivation.inspireAgain")}
            >
              {t("motivation.inspireAgain")}
            </button>
          </div>
        </div>
        <div className="app-surface-card w-full max-w-3xl rounded-2xl p-4 sm:p-6 mb-8 sm:mb-10">
          <h3 className="app-panel-title text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-center">{t("motivation.chartTitle")}</h3>
          <div className="w-full h-52 sm:h-80">
            {typeof window !== "undefined" && Chart && (
              <Chart options={chartData.options} series={chartData.series} type="bar" height={320} />
            )}
          </div>
        </div>
        <div className="w-full max-w-3xl flex justify-end mb-2">
          <button
            className="app-analytics-refresh"
            onClick={fetchAnalytics}
            disabled={loadingStats}
            aria-label={t("motivation.refresh")}
          >
            {loadingStats ? "⏳" : "🔄"} {t("motivation.refresh")}
          </button>
        </div>
        <div className="w-full max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-10">
          <div className="app-stat-card flex flex-col items-center p-4">
            <span className="text-3xl mb-2">🙏</span>
            <span className="font-bold text-lg text-emerald-800">{t("layout.module.karma")}</span>
            {loadingStats ? <span className="app-stat-skeleton" /> : <span className="app-stat-value-warm text-2xl font-extrabold">{stats.karma}</span>}
          </div>
          <div className="app-stat-card flex flex-col items-center p-4">
            <span className="text-3xl mb-2">🌸</span>
            <span className="font-bold text-lg text-rose-800">{t("layout.module.bhakti")}</span>
            {loadingStats ? <span className="app-stat-skeleton" /> : <span className="text-2xl text-rose-700 font-extrabold">{stats.bhakti}</span>}
          </div>
          <div className="app-stat-card flex flex-col items-center p-4">
            <span className="text-3xl mb-2">🧘‍♂️</span>
            <span className="font-bold text-lg text-indigo-800">{t("layout.module.jnana")}</span>
            {loadingStats ? <span className="app-stat-skeleton" /> : <span className="text-2xl text-indigo-700 font-extrabold">{stats.jnana}</span>}
          </div>
          <div className="app-stat-card flex flex-col items-center p-4">
            <span className="text-3xl mb-2">🧘‍♀️</span>
            <span className="font-bold text-lg text-emerald-800">{t("layout.module.dhyana")}</span>
            {loadingStats ? <span className="app-stat-skeleton" /> : <span className="text-2xl text-emerald-700 font-extrabold">{stats.dhyana}</span>}
          </div>
          <div className="app-stat-card flex flex-col items-center p-4">
            <span className="text-3xl mb-2">🌱</span>
            <span className="app-stat-title-amber font-bold text-lg">{t("layout.module.vasana")}</span>
            {loadingStats ? <span className="app-stat-skeleton" /> : <span className="app-stat-value-warm text-2xl font-extrabold">{stats.vasana}</span>}
          </div>
          <div className="app-stat-card flex flex-col items-center p-4">
            <span className="text-3xl mb-2">📜</span>
            <span className="font-bold text-lg text-indigo-800">{t("layout.module.dharma")}</span>
            {loadingStats ? <span className="app-stat-skeleton" /> : <span className="text-2xl text-indigo-700 font-extrabold">{stats.dharma}</span>}
          </div>
          <div className="app-stat-card flex flex-col items-center p-4">
            <span className="text-3xl mb-2">🔥</span>
            <span className="app-stat-title-primary font-bold text-lg">{t("motivation.streak")}</span>
            {loadingStats ? <span className="app-stat-skeleton" /> : <span className="app-stat-value-primary text-2xl font-extrabold">{stats.streak} {t("motivation.days")}</span>}
          </div>
          <div className="app-stat-card flex flex-col items-center p-4">
            <span className="text-3xl mb-2">📈</span>
            <span className="app-stat-title-amber font-bold text-lg">{t("motivation.totalEntries")}</span>
            {loadingStats ? <span className="app-stat-skeleton" /> : <span className="app-stat-value-warm text-2xl font-extrabold">{stats.totalEntries}</span>}
          </div>
        </div>
      </section>
      <section className="mt-10 sm:mt-12 max-w-2xl mx-auto text-center">
        <h3 className="app-panel-title text-lg sm:text-xl md:text-2xl font-bold mb-4">{t("motivation.howTo")}</h3>
        <ul className="app-list-copy list-disc list-inside text-base sm:text-lg space-y-2 text-left mx-auto max-w-xl">
          <li>{t("motivation.howto.1")}</li>
          <li>{t("motivation.howto.2")}</li>
          <li>{t("motivation.howto.3")}</li>
          <li>{t("motivation.howto.4")}</li>
          <li>{t("motivation.howto.5")}</li>
        </ul>
        <div className="app-info-panel app-info-copy mt-8 sm:mt-10 p-4 sm:p-6 rounded-xl shadow text-base sm:text-lg">
          <h4 className="app-info-title font-bold mb-2">{t("motivation.tipTitle")}</h4>
          <p>{t("motivation.tipBody")}</p>
        </div>
      </section>
    </ModuleLayout>
  );
}
