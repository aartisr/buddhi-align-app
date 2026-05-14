
'use client';
import React from "react";
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "../i18n/provider";
import {
  PREFERENCES_UPDATED_EVENT,
  readMusicControlVisibilityPreference,
} from "../preferences";

const DEFAULT_BGM_URLS = [
  "/audio/meditation-ambient-1.mp3",
  "/audio/meditation-ambient-2.mp3",
  "/audio/meditation-ambient-3.mp3",
];

export function normalizeBgmUrl(input: string | null | undefined): string | null {
  const value = input?.trim();
  if (!value) return null;

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  // Allow same-origin assets served from /public, e.g. /audio/track.mp3.
  if (value.startsWith("/")) {
    return value;
  }

  return null;
}

export function getBgmUrlsFromEnv(env: NodeJS.ProcessEnv = process.env): string[] {
  const configuredUrls = env.NEXT_PUBLIC_BGM_URLS
    ?.split(",")
    .map((url: string) => normalizeBgmUrl(url))
    .filter((url: string | null): url is string => Boolean(url));

  if (configuredUrls && configuredUrls.length > 0) {
    return configuredUrls;
  }

  const configuredSingleUrl = normalizeBgmUrl(env.NEXT_PUBLIC_BGM_URL);
  if (configuredSingleUrl) {
    return [configuredSingleUrl];
  }

  return DEFAULT_BGM_URLS;
}

function getRouteTrackPool(pathname: string, totalTracks: number): number[] {
  const all = Array.from({ length: totalTracks }, (_, index) => index);
  if (totalTracks <= 3) return all;

  const byRatio = (start: number, end: number) => {
    const startIndex = Math.max(0, Math.min(totalTracks - 1, Math.floor(totalTracks * start)));
    const endIndex = Math.max(startIndex, Math.min(totalTracks, Math.ceil(totalTracks * end)));
    return all.slice(startIndex, endIndex);
  };

  if (pathname.startsWith("/dhyana-meditation")) {
    return byRatio(0, 0.35);
  }

  if (pathname.startsWith("/bhakti-journal")) {
    return byRatio(0.2, 0.65);
  }

  if (pathname.startsWith("/jnana-reflection")) {
    return byRatio(0, 0.5);
  }

  if (pathname.startsWith("/dharma-planner") || pathname.startsWith("/karma-yoga")) {
    return byRatio(0.45, 1);
  }

  if (pathname.startsWith("/motivation-analytics")) {
    return byRatio(0.55, 1);
  }

  return all;
}

function pickRandomTrack(pool: number[], fallbackIndex: number) {
  if (pool.length === 0) return fallbackIndex;
  return pool[Math.floor(Math.random() * pool.length)];
}

function pickNextRandomTrack(pool: number[], currentIndex: number) {
  if (pool.length <= 1) return pool[0] ?? currentIndex;

  let nextIndex = pool[Math.floor(Math.random() * pool.length)];
  if (nextIndex === currentIndex) {
    const options = pool.filter((index) => index !== currentIndex);
    nextIndex = options[Math.floor(Math.random() * options.length)] ?? currentIndex;
  }
  return nextIndex;
}

export default function BackgroundMusic() {
  const { t } = useI18n();
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement>(null);
  const bgmUrls = useMemo(() => getBgmUrlsFromEnv(), []);
  const routeTrackPool = useMemo(
    () => getRouteTrackPool(pathname ?? "/", bgmUrls.length),
    [pathname, bgmUrls.length],
  );
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [prompt, setPrompt] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "paused" | "blocked" | "error">("idle");
  const [trackIndex, setTrackIndex] = useState(() => pickRandomTrack(routeTrackPool, 0));
  const [controlVisible, setControlVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const statusMessage = useMemo(() => {
    switch (status) {
      case "loading":
        return "Loading audio...";
      case "playing":
        return "Playing";
      case "paused":
        return "Paused";
      case "blocked":
        return "Tap Play to enable audio";
      case "error":
        return "Unable to load this track";
      default:
        return "Ready";
    }
  }, [status]);

  const startPlayback = useCallback(async () => {
    if (!audioRef.current) return;
    setStatus("loading");

    try {
      await audioRef.current.play();
      setPlaying(true);
      setPrompt(false);
      setStatus("playing");
    } catch {
      setPlaying(false);
      setPrompt(true);
      setStatus("blocked");
    }
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const syncVisibility = () => {
      setControlVisible(readMusicControlVisibilityPreference());
    };

    syncVisibility();
    window.addEventListener(PREFERENCES_UPDATED_EVENT, syncVisibility as EventListener);
    window.addEventListener("storage", syncVisibility);

    return () => {
      window.removeEventListener(PREFERENCES_UPDATED_EVENT, syncVisibility as EventListener);
      window.removeEventListener("storage", syncVisibility);
    };
  }, []);

  useEffect(() => {
    void startPlayback();
  }, [startPlayback]);

  useEffect(() => {
    if (!playing) return;
    void startPlayback();
  }, [trackIndex, playing, startPlayback]);

  useEffect(() => {
    setTrackIndex((currentIndex: number) => {
      if (routeTrackPool.includes(currentIndex)) return currentIndex;
      return pickRandomTrack(routeTrackPool, currentIndex);
    });
  }, [routeTrackPool]);

  const playNextTrack = () => {
    if (routeTrackPool.length <= 1) return;

    setTrackIndex((currentIndex: number) => pickNextRandomTrack(routeTrackPool, currentIndex));
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      void startPlayback();
    } else {
      audioRef.current.pause();
      setPlaying(false);
      setPrompt(true);
      setStatus("paused");
    }
  };

  const handleVolume = (e: ChangeEvent<HTMLInputElement>) => {
    const nextVolume = parseFloat(e.target.value);
    setVolume(nextVolume);
    if (audioRef.current) {
      audioRef.current.volume = nextVolume;
    }
  };

  if (!controlVisible) {
    return null;
  }

  return (
    <div className={`app-music-panel ${expanded ? "app-music-panel--expanded" : "app-music-panel--compact"}`}>
      <button
        type="button"
        aria-label={playing ? t("app.pause") : t("app.play")}
        onClick={togglePlay}
        className={`app-music-button ${expanded ? "" : "app-music-button--compact"}`}
      >
        {playing ? t("app.pause") : t("app.play")}
      </button>
      
      {expanded && (
        <>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolume}
            aria-label={t("app.backgroundMusic")}
            className="app-music-slider"
          />
          <span className="app-music-label">{t("app.backgroundMusic")}</span>
          <span className="app-music-status" aria-live="polite">{statusMessage}</span>
          {prompt && <span className="app-music-prompt">{t("app.musicPrompt")}</span>}
        </>
      )}

      <button
        type="button"
        aria-label={expanded ? "Collapse player" : "Expand player"}
        onClick={() => setExpanded(!expanded)}
        className="app-music-expand-btn"
        title={expanded ? "Collapse" : "Expand"}
      >
        {expanded ? "−" : "+"}
      </button>

      <audio
        ref={audioRef}
        src={bgmUrls[trackIndex]}
        loop={bgmUrls.length === 1}
        autoPlay
        preload="auto"
        className="hidden"
        onLoadedMetadata={() => {
          if (audioRef.current) audioRef.current.volume = volume;
        }}
        onCanPlay={() => {
          if (!playing) return;
          void startPlayback();
        }}
        onError={() => {
          if (routeTrackPool.length <= 1) {
            setPlaying(false);
            setPrompt(true);
            setStatus("error");
            return;
          }

          setStatus("loading");
          playNextTrack();
        }}
        onPlay={() => {
          setPrompt(false);
          setStatus("playing");
        }}
        onPause={() => {
          setPrompt(true);
          setStatus((currentStatus) => (currentStatus === "blocked" ? currentStatus : "paused"));
        }}
        onEnded={playNextTrack}
      />
    </div>
  );
}
