"use client";

import dynamic from "next/dynamic";
import ModuleLayout from "../components/ModuleLayout";
import { useCallback, useEffect, useMemo, useState } from "react";
import { logEvent } from "../lib/logEvent";
import { MOTIVATIONAL_QUOTES } from "../i18n/config";
import { useI18n } from "../i18n/provider";
import type { AnalyticsPayload } from "../api/analytics/types";
import { getSyntheticAnalyticsPayload, shouldUseSyntheticAnalytics } from "./demoData";
import { cachedJsonFetch, invalidateClientFetchCache } from "../lib/clientFetchCache";
import DeferredRender from "../components/DeferredRender";
import { buildPersonalizationSignals } from "./personalization";

type Translate = ReturnType<typeof useI18n>["t"];
type Quote = { quote: string; author: string };
type StatsModel = {
  karma: number;
  bhakti: number;
  jnana: number;
  dhyana: number;
  vasana: number;
  dharma: number;
  streak: number;
  totalEntries: number;
};

type Recommendation = ReturnType<typeof buildPersonalizationSignals>[number];
const INITIAL_QUOTE_INDEX = 0;

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => <div className="app-stat-skeleton w-full h-52 sm:h-80 rounded-xl" aria-hidden="true" />,
});
const LongitudinalChart = dynamic(() => import("../components/LongitudinalChart"), {
  ssr: false,
  loading: () => <div className="app-stat-skeleton w-full max-w-3xl h-56 sm:h-72 rounded-2xl mx-auto" aria-hidden="true" />,
});

function getRandomQuote(quotes: { quote: string; author: string }[]) {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function getInitialQuote(quotes: Quote[]) {
  return quotes[INITIAL_QUOTE_INDEX] ?? MOTIVATIONAL_QUOTES.en[INITIAL_QUOTE_INDEX];
}

function QuoteHero({
  t,
  quote,
  inspireAgain,
}: {
  t: Translate;
  quote: Quote;
  inspireAgain: () => void;
}) {
  return (
    <div className="app-analytics-hero max-w-2xl p-4 sm:p-8 rounded-2xl shadow-xl text-center mb-6 sm:mb-8 w-full">
      <h2 className="app-panel-title text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">{t("motivation.title")}</h2>
      <blockquote className="app-quote-text italic text-base sm:text-xl md:text-2xl mb-2">&ldquo;{quote.quote}&rdquo;</blockquote>
      <div className="app-author-text text-base sm:text-lg font-semibold">— {quote.author}</div>
      <div className="flex justify-center mt-4 sm:mt-6">
        <button
          className="app-button-primary app-button-primary--analytics app-button-primary--auto"
          onClick={inspireAgain}
          aria-label={t("motivation.inspireAgain")}
        >
          {t("motivation.inspireAgain")}
        </button>
      </div>
    </div>
  );
}

function ModuleActivityChart({
  t,
  isMounted,
  chartOptions,
  chartSeries,
}: {
  t: Translate;
  isMounted: boolean;
  chartOptions: Record<string, unknown>;
  chartSeries: Array<{ name: string; data: number[] }>;
}) {
  return (
    <div className="app-surface-card w-full max-w-3xl rounded-2xl p-4 sm:p-6 mb-8 sm:mb-10">
      <h3 className="app-panel-title text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-center">{t("motivation.chartTitle")}</h3>
      <div className="w-full h-52 sm:h-80">
        {isMounted ? (
          <Chart options={chartOptions} series={chartSeries} type="bar" height={320} />
        ) : (
          <div className="app-stat-skeleton w-full h-52 sm:h-80 rounded-xl" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}

function QuickTour({ t }: { t: Translate }) {
  return (
    <DeferredRender minHeightClassName="min-h-[280px]">
      <div id="quick-tour" className="app-surface-card w-full max-w-3xl rounded-2xl p-4 sm:p-6 mb-8 sm:mb-10 scroll-mt-24">
        <h3 className="app-panel-title text-lg sm:text-xl font-bold mb-2 text-center">{t("motivation.quickTourTitle")}</h3>
        <p className="app-secondary-copy text-sm text-center mb-4">
          {t("motivation.quickTourDescription")}
        </p>
        <video
          controls
          preload="metadata"
          playsInline
          poster="/videos/buddhi-app-quickstart-poster.png"
          className="aspect-video w-full rounded-xl border border-(--border-soft) bg-black object-cover"
          aria-label={t("motivation.quickTourAriaLabel")}
        >
          <source src="/videos/buddhi-app-quickstart.mp4" type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"' />
          <source src="/videos/buddhi-app-quickstart.webm" type='video/webm; codecs="vp9, opus"' />
          <source src="/videos/buddhi-app-quickstart.mp4" type="video/mp4" />
          <track
            src="/videos/buddhi-spiritual-captions.vtt"
            kind="captions"
            srcLang="en"
            label={t("motivation.quickTourCaptionLabel")}
            default
          />
          {t("motivation.quickTourFallback")}
        </video>
        <p className="app-secondary-copy text-sm text-center mt-3">
          {t("motivation.quickTourClosing")}
        </p>
      </div>
    </DeferredRender>
  );
}

function StatCard({
  icon,
  label,
  value,
  loading,
  labelClassName,
  valueClassName,
}: {
  icon: string;
  label: string;
  value: string | number;
  loading: boolean;
  labelClassName: string;
  valueClassName: string;
}) {
  return (
    <div className="app-stat-card flex flex-col items-center p-4">
      <span className="text-3xl mb-2">{icon}</span>
      <span className={labelClassName}>{label}</span>
      {loading ? <span className="app-stat-skeleton" /> : <span className={valueClassName}>{value}</span>}
    </div>
  );
}

function StatsGrid({ t, loadingStats, stats }: { t: Translate; loadingStats: boolean; stats: StatsModel }) {
  return (
    <div className="w-full max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-10">
      <StatCard icon="🙏" label={t("layout.module.karma")} value={stats.karma} loading={loadingStats} labelClassName="font-bold text-lg app-module-label--karma" valueClassName="text-2xl font-extrabold app-module-value--karma" />
      <StatCard icon="🌸" label={t("layout.module.bhakti")} value={stats.bhakti} loading={loadingStats} labelClassName="font-bold text-lg app-module-label--bhakti" valueClassName="text-2xl font-extrabold app-module-value--bhakti" />
      <StatCard icon="🧘‍♂️" label={t("layout.module.jnana")} value={stats.jnana} loading={loadingStats} labelClassName="font-bold text-lg app-module-label--jnana" valueClassName="text-2xl font-extrabold app-module-value--jnana" />
      <StatCard icon="🧘‍♀️" label={t("layout.module.dhyana")} value={stats.dhyana} loading={loadingStats} labelClassName="font-bold text-lg app-module-label--dhyana" valueClassName="text-2xl font-extrabold app-module-value--dhyana" />
      <StatCard icon="🌱" label={t("layout.module.vasana")} value={stats.vasana} loading={loadingStats} labelClassName="app-stat-title-amber font-bold text-lg" valueClassName="app-stat-value-warm text-2xl font-extrabold" />
      <StatCard icon="📜" label={t("layout.module.dharma")} value={stats.dharma} loading={loadingStats} labelClassName="font-bold text-lg app-module-label--dharma" valueClassName="text-2xl font-extrabold app-module-value--dharma" />
      <StatCard icon="🔥" label={t("motivation.streak")} value={`${stats.streak} ${t("motivation.days")}`} loading={loadingStats} labelClassName="app-stat-title-primary font-bold text-lg" valueClassName="app-stat-value-primary text-2xl font-extrabold" />
      <StatCard icon="📈" label={t("motivation.totalEntries")} value={stats.totalEntries} loading={loadingStats} labelClassName="app-stat-title-amber font-bold text-lg" valueClassName="app-stat-value-warm text-2xl font-extrabold" />
    </div>
  );
}

function RecommendationsPanel({ t, recommendations }: { t: Translate; recommendations: Recommendation[] }) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="app-surface-card w-full max-w-3xl rounded-2xl p-4 sm:p-6 mb-8 sm:mb-10">
      <h3 className="app-panel-title text-lg sm:text-xl font-bold mb-1 text-center">
        {t("motivation.personalization.title")}
      </h3>
      <p className="app-secondary-copy text-sm text-center mb-4">
        {t("motivation.personalization.subtitle")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {recommendations.map((item) => {
          const moduleLabel = t(`layout.module.${item.module}` as Parameters<typeof t>[0]);
          const titleKey = (`motivation.personalization.${item.kind}.title`) as Parameters<typeof t>[0];
          const reasonKey = (`motivation.personalization.${item.kind}.reason`) as Parameters<typeof t>[0];

          return (
            <a key={item.id} href={item.href} className="app-record-card app-focus-ring">
              <h4 className="font-semibold text-sm">{t(titleKey, { module: moduleLabel })}</h4>
              <p className="app-copy-soft text-xs mt-2">
                {t(reasonKey, {
                  module: moduleLabel,
                  moduleCount: item.rationale.moduleCount,
                  mostActiveCount: item.rationale.mostActiveCount,
                  streak: item.rationale.streak,
                })}
              </p>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs app-copy-soft mb-1">
                  <span>{t("motivation.personalization.confidence")}</span>
                  <strong>{item.confidence}%</strong>
                </div>
                <progress className="app-consistency-progress" value={item.confidence} max={100} />
              </div>

              <span className="inline-flex mt-3 text-xs font-semibold app-copy">{t("motivation.personalization.cta")}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function HowToSection({ t }: { t: Translate }) {
  return (
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
  );
}

export default function MotivationAnalyticsPage() {
  const { locale, t } = useI18n();
  const quotes = MOTIVATIONAL_QUOTES[locale] ?? MOTIVATIONAL_QUOTES.en;
  const [quote, setQuote] = useState(() => getInitialQuote(quotes));
  const [loadingStats, setLoadingStats] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [analyticsPayload, setAnalyticsPayload] = useState<AnalyticsPayload | null>(null);

  const [stats, setStats] = useState<StatsModel>({
    karma: 0,
    bhakti: 0,
    jnana: 0,
    dhyana: 0,
    vasana: 0,
    dharma: 0,
    streak: 0,
    totalEntries: 0
  });
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
      },
      plotOptions: {
        bar: {
          borderRadius: 8,
          horizontal: false,
          distributed: true,
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
        labels: { style: { fontSize: "14px", fontWeight: 600, colors: ["var(--text-muted)"] } },
      },
      yaxis: {
        title: { text: t("motivation.entries"), style: { color: "var(--text-muted)", fontWeight: 700 } },
        labels: { style: { fontSize: "14px", colors: ["var(--text-muted)"] } },
      },
      colors: ["#B8860B", "#A33664", "#324A9A", "#2E7D5A", "#357A38", "#1D5FBF"],
      grid: { borderColor: "var(--border-soft)" },
      title: {
        text: t("motivation.moduleActivityOverview"),
        align: "center" as const,
        style: { fontSize: "20px", color: "var(--text-muted)", fontWeight: 700 },
      },
      tooltip: {
        theme: "light" as const,
      },
    }),
    [t],
  );

  const recommendations = useMemo(
    () => (analyticsPayload ? buildPersonalizationSignals(analyticsPayload) : []),
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
        ? getSyntheticAnalyticsPayload()
        : apiData;
      setAnalyticsPayload(data);
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
      logEvent("analytics_fetch_success", {
        totalEntries: data.totalEntries,
        streak: data.streak,
        syntheticData: shouldUseSyntheticAnalytics(apiData),
      });
    } catch {
      // Non-fatal: use synthetic analytics so the UX remains useful in empty/new setups.
      const data = getSyntheticAnalyticsPayload();
      setAnalyticsPayload(data);
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

  useEffect(() => {
    setQuote(getInitialQuote(quotes));
  }, [locale, quotes]);

  return (
    <ModuleLayout titleKey="module.motivation.title">
      <section className="mb-8 sm:mb-10 flex flex-col items-center justify-center">
        <QuoteHero t={t} quote={quote} inspireAgain={() => setQuote(getRandomQuote(quotes))} />
        <ModuleActivityChart t={t} isMounted={isMounted} chartOptions={chartOptions} chartSeries={chartSeries} />
        <QuickTour t={t} />
        <div className="w-full max-w-3xl flex justify-end mb-2">
          <button
            className="app-analytics-refresh"
            onClick={() => fetchAnalytics(true)}
            disabled={loadingStats}
            aria-label={t("motivation.refresh")}
          >
            {loadingStats ? "⏳" : "🔄"} {t("motivation.refresh")}
          </button>
        </div>
        <StatsGrid t={t} loadingStats={loadingStats} stats={stats} />
        <RecommendationsPanel t={t} recommendations={recommendations} />
      </section>
      <DeferredRender minHeightClassName="min-h-[260px]">
        <LongitudinalChart />
      </DeferredRender>
      <HowToSection t={t} />
    </ModuleLayout>
  );
}
