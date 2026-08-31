"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import ModuleLayout from "../components/ModuleLayout";
import { useI18n } from "../i18n/provider";
import { cachedJsonFetch, invalidateClientFetchCache } from "../lib/clientFetchCache";
import { getSyntheticAnalyticsPayload, shouldUseSyntheticAnalytics } from "./demoData";
import { buildPersonalizationSignals, type RecommendationSignal } from "./personalization";
import LongitudinalChart from "../components/LongitudinalChart";
import DeferredRender from "../components/DeferredRender";
import { logEvent } from "../lib/logEvent";
import FocusIntro from "../components/FocusIntro";
import LazyDetails from "../components/LazyDetails";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type TranslateFn = ReturnType<typeof useI18n>['t'];

interface AnalyticsPayload {
  karma: number;
  bhakti: number;
  jnana: number;
  dhyana: number;
  vasana: number;
  dharma: number;
  streak: number;
  totalEntries: number;
  counts: Record<string, number>;
  todayActivity: Record<string, boolean>;
  mostActive?: string;
}

interface StatsModel {
  karma: number;
  bhakti: number;
  jnana: number;
  dhyana: number;
  vasana: number;
  dharma: number;
  streak: number;
  totalEntries: number;
}

function emptyStatsModel(): StatsModel {
  return {
    karma: 0,
    bhakti: 0,
    jnana: 0,
    dhyana: 0,
    vasana: 0,
    dharma: 0,
    streak: 0,
    totalEntries: 0,
  };
}

function toStatsModel(payload: AnalyticsPayload): StatsModel {
  return { ...payload };
}

interface Quote {
  text: string;
  author: string;
  source: string;
}

const FALLBACK_QUOTES: readonly Quote[] = [
  { text: "Yoga is the journey of the self, through the self, to the self.", author: "The Bhagavad Gita", source: "Chapter 6" },
  { text: "When meditation is mastered, the mind is unwavering like the flame of a lamp in a windless place.", author: "The Bhagavad Gita", source: "Chapter 6" },
];

function getRandomQuote(): Quote {
  return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
}

function QuoteHero({ t, quote, inspireAgain }: { t: TranslateFn; quote: Quote; inspireAgain: () => void }) {
  return (
    <div className="w-full text-center space-y-4 mb-6">
      <blockquote className="text-xl sm:text-2xl font-serif italic text-(--foreground) leading-relaxed">
        &ldquo;{quote.text}&rdquo;
      </blockquote>
      <p className="text-sm font-semibold uppercase tracking-wider text-(--text-muted)">
        — {quote.author}, <span className="italic">{quote.source}</span>
      </p>
      <button
        onClick={inspireAgain}
        className="text-xs font-semibold px-4 py-2 rounded-full border border-(--border-subtle) bg-(--surface) text-(--primary) hover:bg-(--surface-soft) transition-colors inline-flex items-center gap-2 mt-2 shadow-sm"
      >
        <span aria-hidden="true">✨</span> Inspire me
      </button>
    </div>
  );
}

function ModuleActivityChart({
  t,
  isMounted,
  chartOptions,
  chartSeries,
}: {
  t: TranslateFn;
  isMounted: boolean;
  chartOptions: object;
  chartSeries: { name: string; data: number[] }[];
}) {
  return (
    <div className="w-full bg-(--surface-soft) rounded-3xl p-6 sm:p-8 border border-(--border-subtle) shadow-sm mb-6">
       <h3 className="text-xl font-bold mb-4 text-(--foreground) text-center">{t("motivation.moduleActivityOverview")}</h3>
      <div className="h-[350px]">
        {isMounted ? (
          <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height={350} />
        ) : (
          <div className="h-full flex items-center justify-center text-(--text-muted)">
            <span className="app-inline-spinner mr-2" /> Loading chart...
          </div>
        )}
      </div>
    </div>
  );
}

function StatsGrid({ t, loadingStats, stats }: { t: TranslateFn; loadingStats: boolean; stats: StatsModel }) {
  const statCards = [
    { key: "streak", label: t("motivation.streak"), value: stats.streak, unit: t("motivation.days"), icon: "🔥", accent: "text-orange-600" },
    { key: "total", label: t("motivation.totalEntries"), value: stats.totalEntries, icon: "📚", accent: "text-blue-600" },
    { key: "dharma", label: t("layout.module.dharma"), value: stats.dharma, icon: "📜", accent: "text-(--gold)" },
    { key: "karma", label: t("layout.module.karma"), value: stats.karma, icon: "🙏", accent: "text-(--rose)" },
    { key: "jnana", label: t("layout.module.jnana"), value: stats.jnana, icon: "🧘‍♂️", accent: "text-(--accent)" },
    { key: "dhyana", label: t("layout.module.dhyana"), value: stats.dhyana, icon: "🧘‍♀️", accent: "text-(--emerald)" },
  ];

  return (
    <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
      {statCards.map((card) => (
        <div key={card.key} className="bg-(--surface-soft) border border-(--border-subtle) p-5 rounded-3xl text-center shadow-sm flex flex-col items-center justify-center relative overflow-hidden group hover:border-(--border-soft) transition-all">
           {loadingStats ? (
             <span className="app-inline-spinner" />
           ) : (
             <>
               <span className={`text-3xl mb-2 ${card.accent}`} aria-hidden>{card.icon}</span>
               <div className="text-2xl sm:text-3xl font-black text-(--foreground)">
                 {card.value} {card.unit && <span className="text-sm sm:text-base font-semibold text-(--text-muted) ml-1">{card.unit}</span>}
               </div>
               <div className="text-xs font-bold uppercase tracking-widest text-(--text-muted) mt-1">{card.label}</div>
             </>
           )}
        </div>
      ))}
    </div>
  );
}

function RecommendationsPanel({
  t,
  recommendations,
}: {
  t: TranslateFn;
  recommendations: RecommendationSignal[];
}) {
  if (recommendations.length === 0) return null;

  return (
    <div className="w-full bg-(--surface) border border-(--border-soft) rounded-3xl p-6 sm:p-8 mb-10 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-(--primary) opacity-20"></div>
      <h3 className="text-xl sm:text-2xl font-bold mb-2 text-center text-(--foreground)">
        {t("motivation.personalization.title")}
      </h3>
      <p className="text-sm text-center mb-8 text-(--text-muted)">
        {t("motivation.personalization.subtitle")}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map((item) => {
          const moduleLabel = t(`layout.module.${item.module}` as Parameters<typeof t>[0]);
          const titleKey = (`motivation.personalization.${item.kind}.title`) as Parameters<typeof t>[0];
          const reasonKey = (`motivation.personalization.${item.kind}.reason`) as Parameters<typeof t>[0];
          return (
            <a key={item.id} href={item.href} className="flex flex-col h-full bg-(--surface-soft) border border-(--border-subtle) rounded-2xl p-5 hover:bg-(--surface) hover:border-(--primary) transition-all group shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-(--focus-ring) focus:ring-offset-2">
              <h4 className="font-bold text-(--foreground) text-lg mb-2 group-hover:text-(--primary) transition-colors">{t(titleKey, { module: moduleLabel })}</h4>
              <p className="text-sm text-(--text-soft) leading-relaxed flex-1">
                {t(reasonKey, {
                  module: moduleLabel,
                  moduleCount: item.rationale.moduleCount,
                  mostActiveCount: item.rationale.mostActiveCount,
                  streak: item.rationale.streak,
                })}
              </p>
              
              <div className="mt-6 pt-4 border-t border-(--border-subtle)">
                <div className="flex items-center justify-between text-xs font-semibold text-(--text-muted) mb-2">
                  <span className="uppercase tracking-wider">{t("motivation.personalization.confidence")}</span>
                  <strong className="text-(--foreground)">{item.confidence}%</strong>
                </div>
                <div className="w-full h-1.5 bg-(--border-subtle) rounded-full overflow-hidden">
                  <div className="h-full bg-(--primary) rounded-full" style={{ width: `${item.confidence}%` }} />
                </div>
              </div>
              <span className="mt-4 text-sm font-semibold text-(--primary) group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                {t("motivation.personalization.cta")} →
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default function MotivationAnalyticsPage() {
  const { t } = useI18n();
  const [quote, setQuote] = useState(() => getRandomQuote());
  const [loadingStats, setLoadingStats] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [analyticsPayload, setAnalyticsPayload] = useState<AnalyticsPayload | null>(null);
  const [stats, setStats] = useState<StatsModel>(() => emptyStatsModel());

  const chartSeries = useMemo(
    () => [{
      name: t("motivation.entries"),
      data: [stats.karma, stats.bhakti, stats.jnana, stats.dhyana, stats.vasana, stats.dharma],
    }],
    [stats, t],
  );

  const chartOptions = useMemo(
    () => ({
      chart: {
        type: "bar" as const,
        height: 350,
        toolbar: { show: false },
        foreColor: "var(--text-muted)",
        fontFamily: "inherit",
      },
      plotOptions: {
        bar: {
          borderRadius: 6,
          horizontal: false,
          distributed: true,
          columnWidth: '45%',
        },
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: [
          t("layout.module.karma"),
          t("layout.module.bhakti"),
          t("layout.module.jnana"),
          t("layout.module.dhyana"),
          t("layout.module.vasana"),
          t("layout.module.dharma"),
        ],
        labels: { style: { fontSize: "13px", fontWeight: 600, colors: ["var(--text-muted)"] } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        title: { text: t("motivation.entries"), style: { color: "var(--text-muted)", fontWeight: 700, fontSize: "12px" } },
        labels: { style: { fontSize: "13px", colors: ["var(--text-muted)"] } },
      },
      colors: ["#a85b6a", "#8f3e34", "#3f7a60", "#244d42", "#4d765f", "#dec48f"],
      grid: { 
        borderColor: "var(--border-subtle)",
        strokeDashArray: 4,
        yaxis: { lines: { show: true } },
      },
      title: { text: "" }, // Handled in React component
      tooltip: {
        theme: "light" as const,
        style: { fontSize: '13px', fontFamily: 'inherit' },
      },
    }),
    [t],
  );

  const recommendations = useMemo(
    () => (analyticsPayload ? buildPersonalizationSignals(analyticsPayload as any) : []),
    [analyticsPayload],
  );

  useEffect(() => {
    if (!analyticsPayload) return;
    if (recommendations.length === 0) {
      logEvent("personalization_recommendations_empty", {
        totalEntries: analyticsPayload.totalEntries,
        streak: analyticsPayload.streak,
      });
      return;
    }
    logEvent("personalization_recommendations_rendered", {
      recommendations: recommendations.length,
      topConfidence: recommendations[0]?.confidence ?? 0,
    });
  }, [analyticsPayload, recommendations]);

  const fetchAnalytics = useCallback(async (forceRefresh = false) => {
    setLoadingStats(true);
    try {
      if (forceRefresh) {
        invalidateClientFetchCache("analytics:summary");
      }
      const apiData = await cachedJsonFetch<AnalyticsPayload>(
        "analytics:summary",
        "/api/analytics",
        { ttlMs: 20_000, forceRefresh },
      );
      
      const data = shouldUseSyntheticAnalytics(apiData)
        ? (getSyntheticAnalyticsPayload() as unknown as AnalyticsPayload)
        : apiData;
        
      setAnalyticsPayload(data);
      setStats(toStatsModel(data));
      
      logEvent("analytics_fetch_success", {
        totalEntries: data.totalEntries,
        streak: data.streak,
        syntheticData: shouldUseSyntheticAnalytics(apiData),
      });
    } catch {
      const data = getSyntheticAnalyticsPayload() as unknown as AnalyticsPayload;
      setAnalyticsPayload(data);
      setStats(toStatsModel(data));
      logEvent("analytics_fetch_failed", { syntheticData: true });
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <ModuleLayout titleKey="module.motivation.title">
      <div className="max-w-5xl mx-auto space-y-12 pb-16">
        <FocusIntro
          title="Review momentum in under a minute"
          summary="Use these signals to decide your next best practice step quickly."
        />

        <section className="flex flex-col items-center justify-center">
          
          <div className="w-full flex justify-end mb-4">
            <button
              className="text-xs font-semibold px-4 py-2 rounded-full border border-(--border-subtle) bg-(--surface-soft) text-(--text-muted) hover:bg-(--surface) hover:text-(--primary) hover:border-(--border-soft) transition-all shadow-sm flex items-center gap-2"
              onClick={() => fetchAnalytics(true)}
              disabled={loadingStats}
              aria-label={t("motivation.refresh")}
            >
              <span aria-hidden className={loadingStats ? "animate-spin" : ""}>🔄</span> 
              <span>{t("motivation.refresh")}</span>
            </button>
          </div>

          <StatsGrid t={t} loadingStats={loadingStats} stats={stats} />
          <ModuleActivityChart t={t} isMounted={isMounted} chartOptions={chartOptions} chartSeries={chartSeries} />
          <RecommendationsPanel t={t} recommendations={recommendations} />
          
        </section>

        <DeferredRender minHeightClassName="min-h-[260px]">
          <div className="bg-(--surface-soft) rounded-3xl p-6 sm:p-8 border border-(--border-subtle) shadow-sm">
             <LongitudinalChart />
          </div>
        </DeferredRender>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-(--border-subtle)">
          <div className="bg-(--surface-soft) rounded-3xl p-8 border border-(--border-subtle) shadow-sm flex flex-col justify-center">
            <QuoteHero t={t} quote={quote} inspireAgain={() => setQuote(getRandomQuote())} />
          </div>
          <LazyDetails summary="How this works" className="bg-(--surface) border border-(--border-subtle) rounded-3xl p-6 shadow-sm">
             <h3 className="text-xl font-bold mb-4 text-(--foreground)">{t("motivation.howTo")}</h3>
             <ul className="space-y-3 text-sm text-(--text-soft) list-disc list-inside">
                <li>{t("motivation.howto.1")}</li>
                <li>{t("motivation.howto.2")}</li>
                <li>{t("motivation.howto.3")}</li>
                <li>{t("motivation.howto.4")}</li>
                <li>{t("motivation.howto.5")}</li>
              </ul>
              <div className="mt-6 p-4 rounded-xl bg-(--background-elevated) text-sm text-(--text-muted)">
                <strong className="block text-(--foreground) mb-1">{t("motivation.tipTitle")}</strong>
                {t("motivation.tipBody")}
              </div>
          </LazyDetails>
        </div>
      </div>
    </ModuleLayout>
  );
}
