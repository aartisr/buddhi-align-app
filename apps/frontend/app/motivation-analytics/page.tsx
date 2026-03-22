"use client";

import dynamic from "next/dynamic";
import ModuleLayout from "../components/ModuleLayout";
import { useEffect, useState } from "react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const motivationalQuotes = [
  {
    quote: "You are what your deep, driving desire is. As your desire is, so is your will. As your will is, so is your deed. As your deed is, so is your destiny.",
    author: "Brihadaranyaka Upanishad"
  },
  {
    quote: "Set thy heart upon thy work, but never on its reward.",
    author: "Bhagavad Gita 2.47"
  },
  {
    quote: "The mind acts like an enemy for those who do not control it.",
    author: "Bhagavad Gita 6.6"
  },
  {
    quote: "When meditation is mastered, the mind is unwavering like the flame of a lamp in a windless place.",
    author: "Bhagavad Gita 6.19"
  },
  {
    quote: "Let noble thoughts come to us from every side.",
    author: "Rig Veda"
  },
  {
    quote: "Arise, awake, and stop not till the goal is reached.",
    author: "Swami Vivekananda"
  }
];

function getRandomQuote() {
  return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
}

export default function MotivationAnalyticsPage() {
  const [quote, setQuote] = useState(getRandomQuote());

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
      name: "Entries",
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
          "Karma Yoga",
          "Bhakti Journal",
          "Jnana Reflection",
          "Dhyana Meditation",
          "Vasana Tracker",
          "Dharma Planner"
        ],
        labels: { style: { fontSize: "16px" } }
      },
      yaxis: {
        title: { text: "Entries" },
        labels: { style: { fontSize: "16px" } }
      },
      colors: ["#FFD700", "#FF69B4", "#4B0082", "#50C878", "#32CD32", "#1E90FF"],
      title: {
        text: "Module Activity Overview",
        align: "center" as const,
        style: { fontSize: "20px", color: "#333" }
      }
    }
  });

  useEffect(() => {
    // Simulate fetching analytics data from backend
    setTimeout(() => {
      const newStats = {
        karma: 42,
        bhakti: 37,
        jnana: 29,
        dhyana: 51,
        vasana: 18,
        dharma: 24,
        streak: 12,
        totalEntries: 201
      };
      setStats(newStats);
      setChartData((prev) => ({
        ...prev,
        series: [{
          name: "Entries",
          data: [
            newStats.karma,
            newStats.bhakti,
            newStats.jnana,
            newStats.dhyana,
            newStats.vasana,
            newStats.dharma
          ]
        }]
      }));
    }, 500);
  }, []);

  return (
    <ModuleLayout title="Motivation & Analytics">
      <section className="mb-10 flex flex-col items-center justify-center">
        <div className="max-w-2xl p-8 rounded-2xl bg-gradient-to-br from-gold/10 via-emerald/5 to-indigo/5 border-2 border-primary shadow-xl text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-indigo-800 mb-4">Motivation for Inner Excellence</h2>
          <blockquote className="italic text-xl md:text-2xl text-zinc-800 mb-2">“{quote.quote}”</blockquote>
          <div className="text-lg text-emerald-700 font-semibold">— {quote.author}</div>
          <button
            className="mt-6 px-6 py-2 rounded-xl bg-gradient-to-r from-primary to-gold text-primary font-bold shadow-lg hover:from-gold hover:to-emerald focus:outline-none focus:ring-2 focus:ring-gold transition"
            onClick={() => setQuote(getRandomQuote())}
            aria-label="Show another quote"
          >
            Inspire Me Again
          </button>
        </div>
        {/* Module Activity Chart in its own row */}
        <div className="w-full max-w-3xl bg-white/90 rounded-2xl shadow-lg p-6 mb-10">
          <h3 className="text-xl font-bold text-indigo-900 mb-4 text-center">Module Activity Chart</h3>
          <div className="w-full h-80">
            {typeof window !== "undefined" && Chart && (
              <Chart options={chartData.options} series={chartData.series} type="bar" height={320} />
            )}
          </div>
        </div>
        {/* Stats grid below the chart */}
        <div className="w-full max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div className="flex flex-col items-center p-4 rounded-xl bg-white/80 shadow border border-emerald">
            <span className="text-3xl mb-2">🙏</span>
            <span className="font-bold text-lg text-emerald-800">Karma Yoga</span>
            <span className="text-2xl text-gold-700 font-extrabold">{stats.karma}</span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl bg-white/80 shadow border border-rose">
            <span className="text-3xl mb-2">🌸</span>
            <span className="font-bold text-lg text-rose-800">Bhakti Journal</span>
            <span className="text-2xl text-rose-700 font-extrabold">{stats.bhakti}</span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl bg-white/80 shadow border border-primary">
            <span className="text-3xl mb-2">🧘‍♂️</span>
            <span className="font-bold text-lg text-indigo-800">Jnana Reflection</span>
            <span className="text-2xl text-indigo-700 font-extrabold">{stats.jnana}</span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl bg-white/80 shadow border border-emerald">
            <span className="text-3xl mb-2">🧘‍♀️</span>
            <span className="font-bold text-lg text-emerald-800">Dhyana Meditation</span>
            <span className="text-2xl text-emerald-700 font-extrabold">{stats.dhyana}</span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl bg-white/80 shadow border border-gold">
            <span className="text-3xl mb-2">🌱</span>
            <span className="font-bold text-lg text-gold-800">Vasana Tracker</span>
            <span className="text-2xl text-gold-700 font-extrabold">{stats.vasana}</span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl bg-white/80 shadow border border-indigo">
            <span className="text-3xl mb-2">📜</span>
            <span className="font-bold text-lg text-indigo-800">Dharma Planner</span>
            <span className="text-2xl text-indigo-700 font-extrabold">{stats.dharma}</span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl bg-white/80 shadow border border-primary">
            <span className="text-3xl mb-2">🔥</span>
            <span className="font-bold text-lg text-primary-800">Streak</span>
            <span className="text-2xl text-primary-700 font-extrabold">{stats.streak} days</span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl bg-white/80 shadow border border-gold">
            <span className="text-3xl mb-2">📈</span>
            <span className="font-bold text-lg text-gold-800">Total Entries</span>
            <span className="text-2xl text-gold-700 font-extrabold">{stats.totalEntries}</span>
          </div>
        </div>
      </section>
      <section className="mt-12 max-w-2xl mx-auto text-center">
        <h3 className="text-xl md:text-2xl font-bold text-indigo-900 mb-4">How to Achieve Spiritual Excellence?</h3>
        <ul className="list-disc list-inside text-lg text-zinc-800 space-y-2 text-left mx-auto max-w-xl">
          <li>Reflect daily on your actions, thoughts, and intentions.</li>
          <li>Track your progress in all six modules for holistic growth.</li>
          <li>Celebrate your streaks and milestones—consistency is key.</li>
          <li>Let ancient wisdom and modern analytics guide your journey.</li>
          <li>Remember: The journey itself is the reward.</li>
        </ul>
        <div className="mt-10 p-6 rounded-xl bg-gradient-to-br from-emerald/10 via-gold/10 to-indigo/10 border border-primary shadow text-lg text-zinc-800">
          <h4 className="font-bold text-primary-800 mb-2">Deep Motivation Tip</h4>
          <p>
            True transformation is a journey of small, consistent steps. Visualize your highest self, and let every action, thought, and intention move you closer to that vision. Use your analytics not just to measure, but to inspire and realign your purpose.
          </p>
        </div>
      </section>
    </ModuleLayout>
  );
}
