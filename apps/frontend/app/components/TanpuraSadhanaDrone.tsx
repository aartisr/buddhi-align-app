"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

interface DroneTuning {
  key: string;
  name: string;
  rootFreq: number; // Sa
  fifthFreq: number; // Pa
  fourthFreq: number; // Ma (optional)
  highSaFreq: number; // Tara Sa
}

const TUNINGS: DroneTuning[] = [
  { key: "C#", name: "C# / Kali 1 (Classic Meditative Pitch)", rootFreq: 138.59, fifthFreq: 207.65, fourthFreq: 185.00, highSaFreq: 277.18 },
  { key: "D", name: "D / Safed 2 (Deep Resonance)", rootFreq: 146.83, fifthFreq: 220.00, fourthFreq: 196.00, highSaFreq: 293.66 },
  { key: "G#", name: "G# / Kali 4 (High Vocal Resonance)", rootFreq: 207.65, fifthFreq: 311.13, fourthFreq: 277.18, highSaFreq: 415.30 },
  { key: "A", name: "A 432Hz (Cosmic Harmonization)", rootFreq: 108.00, fifthFreq: 162.00, fourthFreq: 144.00, highSaFreq: 216.00 },
];

function useTanpuraSadhanaLogic() {

  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTuning, setSelectedTuning] = useState<DroneTuning>(TUNINGS[0]);
  const [usePancham, setUsePancham] = useState(true); // true = Pa (fifth), false = Ma (fourth)
  const [volume, setVolume] = useState(0.4);
  const [bellIntervalMinutes, setBellIntervalMinutes] = useState<number>(5);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const pluckCycleTimeoutRef = useRef<number | null>(null);

  // Play Tibetan Singing Bowl bell chime
  const playTibetanBell = useCallback((ctx: AudioContext) => {
    try {
      const now = ctx.currentTime;
      const bellGain = ctx.createGain();
      bellGain.gain.setValueAtTime(0, now);
      bellGain.gain.linearRampToValueAtTime(0.3 * volume, now + 0.05);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);
      bellGain.connect(ctx.destination);

      // Fundamental bell tone + overtone harmonics
      const bellFreqs = [528, 528 * 1.52, 528 * 2.76, 528 * 4.1];
      bellFreqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = i === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq, now);
        
        const partialGain = ctx.createGain();
        partialGain.gain.setValueAtTime(1 / (i + 1), now);
        
        osc.connect(partialGain);
        partialGain.connect(bellGain);
        
        osc.start(now);
        osc.stop(now + 6.0);
      });
    } catch {
      // AudioContext handling
    }
  }, [volume]);

  // Pluck a single Tanpura string (synthesized acoustic pluck with rich harmonics)
  const pluckString = useCallback((ctx: AudioContext, masterGain: GainNode, freq: number, duration = 3.5) => {
    try {
      const now = ctx.currentTime;
      const stringGain = ctx.createGain();
      stringGain.gain.setValueAtTime(0, now);
      stringGain.gain.linearRampToValueAtTime(0.25, now + 0.03);
      stringGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      stringGain.connect(masterGain);

      // 1. Fundamental
      const osc1 = ctx.createOscillator();
      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(freq, now);

      // Low-pass filter to simulate wooden gourd acoustic warmth
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(400, now + duration);
      filter.Q.setValueAtTime(3.5, now);

      osc1.connect(filter);
      filter.connect(stringGain);
      osc1.start(now);
      osc1.stop(now + duration + 0.1);

      // 2. High harmonic silk thread 'Javari' buzz
      const javariOsc = ctx.createOscillator();
      javariOsc.type = "sine";
      javariOsc.frequency.setValueAtTime(freq * 3, now);
      const javariGain = ctx.createGain();
      javariGain.gain.setValueAtTime(0.08, now);
      javariGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      javariOsc.connect(javariGain);
      javariGain.connect(stringGain);
      javariOsc.start(now);
      javariOsc.stop(now + 1.5);
    } catch {
      // AudioContext fallback
    }
  }, []);

  // Continuous 4-string Tanpura pluck cycle: Pa/Ma -> Tara Sa -> Tara Sa -> Kharaj Sa
  const scheduleTanpuraCycle = useCallback((ctx: AudioContext, masterGain: GainNode, tuning: DroneTuning, pancham: boolean) => {
    if (!isPlaying) return;

    const string1 = pancham ? tuning.fifthFreq : tuning.fourthFreq; // Pa or Ma
    const string2 = tuning.highSaFreq; // Tara Sa
    const string3 = tuning.highSaFreq; // Tara Sa (doubled)
    const string4 = tuning.rootFreq;   // Kharaj Sa (Deep fundamental)

    const stepInterval = 1100; // ms between string plucks

    // String 1: Pa/Ma
    pluckString(ctx, masterGain, string1, 3.8);

    // String 2: Sa
    pluckCycleTimeoutRef.current = window.setTimeout(() => {
      pluckString(ctx, masterGain, string2, 3.8);
      
      // String 3: Sa
      pluckCycleTimeoutRef.current = window.setTimeout(() => {
        pluckString(ctx, masterGain, string3, 3.8);
        
        // String 4: Kharaj Sa
        pluckCycleTimeoutRef.current = window.setTimeout(() => {
          pluckString(ctx, masterGain, string4, 4.5);
          
          // Loop back
          pluckCycleTimeoutRef.current = window.setTimeout(() => {
            scheduleTanpuraCycle(ctx, masterGain, tuning, pancham);
          }, stepInterval);
        }, stepInterval);
      }, stepInterval);
    }, stepInterval);
  }, [isPlaying, pluckString]);

  // Start/Stop handler
  const toggleAudio = () => {
    if (isPlaying) {
      if (pluckCycleTimeoutRef.current) clearTimeout(pluckCycleTimeoutRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.suspend().catch(() => {});
      }
      setIsPlaying(false);
    } else {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      setIsPlaying(true);
      setElapsedSeconds(0);

      // Play initial opening Tibetan bowl chime
      playTibetanBell(ctx);

      // Start Tanpura looping
      scheduleTanpuraCycle(ctx, masterGain, selectedTuning, usePancham);

      // Session Timer & Interval Bell
      timerIntervalRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          if (bellIntervalMinutes > 0 && next % (bellIntervalMinutes * 60) === 0) {
            if (audioCtxRef.current) playTibetanBell(audioCtxRef.current);
          }
          return next;
        });
      }, 1000);
    }
  };

  // Update volume
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(newVol, audioCtxRef.current.currentTime);
    }
  };

  useEffect(() => {
    return () => {
      const pluckTimeout = pluckCycleTimeoutRef.current;
      const timerInterval = timerIntervalRef.current;
      const audioCtx = audioCtxRef.current;
      if (pluckTimeout) clearTimeout(pluckTimeout);
      if (timerInterval) clearInterval(timerInterval);
      if (audioCtx && audioCtx.state !== "closed") {
        audioCtx.close().catch(() => {});
      }
    };
  }, []);



  return { isPlaying, selectedTuning, setSelectedTuning, usePancham, setUsePancham, volume, handleVolumeChange, bellIntervalMinutes, setBellIntervalMinutes, elapsedSeconds, toggleAudio, audioCtxRef, playTibetanBell };
}

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export default function TanpuraSadhanaDrone() {
  const { isPlaying, selectedTuning, setSelectedTuning, usePancham, setUsePancham, volume, handleVolumeChange, bellIntervalMinutes, setBellIntervalMinutes, elapsedSeconds, toggleAudio, audioCtxRef, playTibetanBell } = useTanpuraSadhanaLogic();

  return (
    <div className="bg-(--surface-soft) rounded-2xl p-5 border border-(--border-subtle) space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-(--border-subtle) pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl select-none" aria-hidden="true">🪕</span>
          <div>
            <h3 className="text-sm font-bold text-(--foreground)">
              Acoustic Tanpura Drone & Interval Bells
            </h3>
            <p className="text-[11px] text-(--muted)">
              Continuous harmonic Indian classical drone with 528Hz Tibetan bell interval chimes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isPlaying && (
            <div className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-(--surface) border border-(--border-subtle) text-(--primary) flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>
          )}

          <button
            onClick={toggleAudio}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm ${
              isPlaying
                ? "bg-rose-700 text-white hover:bg-rose-800"
                : "bg-(--primary) text-(--on-primary) hover:opacity-90"
            }`}
          >
            <span>{isPlaying ? "⏹ Stop Sadhana" : "▶ Start Tanpura Drone"}</span>
          </button>
        </div>
      </div>

      {/* Audio Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        {/* Tuning Selector */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-(--muted) block mb-1">
            Root Pitch (Shruti / Scale)
          </label>
          <select
            value={selectedTuning.key}
            disabled={isPlaying}
            onChange={(e) => {
              const t = TUNINGS.find((x) => x.key === e.target.value);
              if (t) setSelectedTuning(t);
            }}
            className="w-full text-xs p-2 rounded-xl border border-(--border-subtle) bg-(--surface) text-(--foreground)"
          >
            {TUNINGS.map((t) => (
              <option key={t.key} value={t.key}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* String 1 Note: Pa vs Ma */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-(--muted) block mb-1">
            First String Tuning (Vadi Swara)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={isPlaying}
              onClick={() => setUsePancham(true)}
              className={`text-xs py-2 px-3 rounded-xl font-semibold border ${
                usePancham
                  ? "bg-(--primary) text-(--on-primary) border-(--primary)"
                  : "bg-(--surface) text-(--foreground) border-(--border-subtle)"
              }`}
            >
              Pa (Pancham / 5th)
            </button>
            <button
              disabled={isPlaying}
              onClick={() => setUsePancham(false)}
              className={`text-xs py-2 px-3 rounded-xl font-semibold border ${
                !usePancham
                  ? "bg-(--primary) text-(--on-primary) border-(--primary)"
                  : "bg-(--surface) text-(--foreground) border-(--border-subtle)"
              }`}
            >
              Ma (Madhyam / 4th)
            </button>
          </div>
        </div>

        {/* Tibetan Bell Interval */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-(--muted) block mb-1">
            Singing Bowl Interval Bell
          </label>
          <select
            value={bellIntervalMinutes}
            onChange={(e) => setBellIntervalMinutes(Number(e.target.value))}
            className="w-full text-xs p-2 rounded-xl border border-(--border-subtle) bg-(--surface) text-(--foreground)"
          >
            <option value={0}>No Interval Bell (Continuous Drone)</option>
            <option value={3}>Every 3 Minutes</option>
            <option value={5}>Every 5 Minutes (Standard Dhyana)</option>
            <option value={10}>Every 10 Minutes</option>
            <option value={15}>Every 15 Minutes</option>
            <option value={20}>Every 20 Minutes (Deep Absorption)</option>
          </select>
        </div>
      </div>

      {/* Volume slider & Test Bell */}
      <div className="flex items-center justify-between gap-4 pt-2 border-t border-(--border-subtle)">
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <span className="text-xs text-(--muted)">🔈</span>
          <input
            type="range"
            min={0.05}
            max={1.0}
            step={0.05}
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full accent-emerald-700 h-1.5 bg-(--border-subtle) rounded-lg"
          />
          <span className="text-xs font-mono text-(--muted)">{Math.round(volume * 100)}%</span>
        </div>

        <button
          onClick={() => {
            const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (!audioCtxRef.current) audioCtxRef.current = new AudioContextClass();
            playTibetanBell(audioCtxRef.current);
          }}
          className="text-xs text-(--primary) hover:underline font-semibold flex items-center gap-1"
        >
          <span>🔔 Test Tibetan Bell Chime</span>
        </button>
      </div>
    </div>
  );
}
