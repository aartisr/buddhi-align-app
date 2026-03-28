"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n/provider";

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface PhaseConfig {
  label: string;
  duration: number;
  color: string;
  expand: boolean;
}

interface PresetConfig {
  name: string;
  phases: PhaseConfig[];
}

const PRESETS: PresetConfig[] = [
  {
    name: "Box (4-4-4-4)",
    phases: [
      { label: "Inhale",  duration: 4, color: "#6366f1", expand: true  },
      { label: "Hold",    duration: 4, color: "#8b5cf6", expand: true  },
      { label: "Exhale",  duration: 4, color: "#10b981", expand: false },
      { label: "Hold",    duration: 4, color: "#64748b", expand: false },
    ],
  },
  {
    name: "4-7-8",
    phases: [
      { label: "Inhale",  duration: 4, color: "#6366f1", expand: true  },
      { label: "Hold",    duration: 7, color: "#8b5cf6", expand: true  },
      { label: "Exhale",  duration: 8, color: "#10b981", expand: false },
    ],
  },
  {
    name: "Nadi (4-4-4)",
    phases: [
      { label: "Inhale",  duration: 4, color: "#6366f1", expand: true  },
      { label: "Hold",    duration: 4, color: "#8b5cf6", expand: true  },
      { label: "Exhale",  duration: 4, color: "#10b981", expand: false },
    ],
  },
];

export default function PranayamaTimer() {
  const { t } = useI18n();
  const [presetIdx, setPresetIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [elapsedTenths, setElapsedTenths] = useState(0);

  // Refs to avoid stale closures inside the interval callback
  const presetIdxRef = useRef(0);
  const phaseIdxRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { presetIdxRef.current = presetIdx; }, [presetIdx]);
  useEffect(() => { phaseIdxRef.current = phaseIdx; }, [phaseIdx]);

  const phase = PRESETS[presetIdx].phases[phaseIdx];
  const totalTenths = phase.duration * 10;
  const progress = Math.min(elapsedTenths / totalTenths, 1);
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const secondsLeft = Math.max(0, Math.ceil((totalTenths - elapsedTenths) / 10));
  const scale = phase.expand ? 0.4 + 0.6 * progress : 1 - 0.5 * progress;

  const stop = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setPhaseIdx(0);
    phaseIdxRef.current = 0;
    setElapsedTenths(0);
  }, [stop]);

  const handlePresetChange = useCallback((idx: number) => {
    stop();
    setPhaseIdx(0);
    phaseIdxRef.current = 0;
    setElapsedTenths(0);
    setPresetIdx(idx);
    presetIdxRef.current = idx;
  }, [stop]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setElapsedTenths((prev) => {
        const currentPreset = PRESETS[presetIdxRef.current];
        const currentPhase = currentPreset.phases[phaseIdxRef.current];
        const tt = currentPhase.duration * 10;
        if (prev + 1 >= tt) {
          const next = (phaseIdxRef.current + 1) % currentPreset.phases.length;
          phaseIdxRef.current = next;
          setPhaseIdx(next);
          return 0;
        }
        return prev + 1;
      });
    }, 100);
    return () => {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    };
  }, [running]);

  return (
    <div className="app-breathwork-card max-w-xl mx-auto mb-8 p-5 rounded-2xl">
      <h3 className="app-breathwork-title text-center font-bold text-base mb-4">
        🌬️ {t("breathwork.title")}
      </h3>

      {/* Preset selector */}
      <div className="flex justify-center gap-2 mb-5 flex-wrap">
        {PRESETS.map((p, i) => (
          <button
            key={i}
            className={`app-breathwork-preset-btn${i === presetIdx ? " app-breathwork-preset-btn--active" : ""}`}
            onClick={() => handlePresetChange(i)}
            aria-pressed={i === presetIdx}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Animated breath circle */}
      <div className="flex justify-center mb-5">
        <svg
          width="160"
          height="160"
          viewBox="0 0 160 160"
          aria-label={`${phase.label}, ${secondsLeft} seconds remaining`}
          role="img"
        >
          {/* Track */}
          <circle cx="80" cy="80" r={RADIUS} fill="none" stroke="#e5e7eb" strokeWidth="8" />
          {/* Progress arc */}
          <circle
            cx="80" cy="80" r={RADIUS}
            fill="none"
            stroke={phase.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 80 80)"
            style={{ transition: "stroke-dashoffset 0.08s linear, stroke 0.35s ease" }}
          />
          {/* Breath orb */}
          <circle
            cx="80" cy="80" r={28}
            fill={phase.color}
            opacity="0.18"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "80px 80px",
              transition: "transform 0.12s ease-out, fill 0.35s ease",
            }}
          />
          {/* Phase label */}
          <text x="80" y="73" textAnchor="middle" fontSize="12" fontWeight="700" fill={phase.color}>
            {phase.label}
          </text>
          {/* Countdown */}
          <text x="80" y="96" textAnchor="middle" fontSize="24" fontWeight="800" fill={phase.color}>
            {secondsLeft}
          </text>
        </svg>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {!running ? (
          <button className="app-breathwork-btn app-breathwork-btn--start" onClick={() => setRunning(true)}>
            ▶ {t("breathwork.start")}
          </button>
        ) : (
          <button className="app-breathwork-btn app-breathwork-btn--pause" onClick={stop}>
            ⏸ {t("breathwork.pause")}
          </button>
        )}
        <button className="app-breathwork-btn app-breathwork-btn--reset" onClick={reset}>
          ↺ {t("breathwork.reset")}
        </button>
      </div>
    </div>
  );
}
