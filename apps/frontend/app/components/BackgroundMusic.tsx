
'use client';
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "../i18n/provider";
import {
  PREFERENCES_UPDATED_EVENT,
  readMusicControlVisibilityPreference,
} from "../preferences";

const DEFAULT_BGM_URL = "https://cdn.pixabay.com/audio/2022/10/16/audio_12b5fae3b6.mp3";

function getBgmUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_BGM_URL?.trim();
  if (!configuredUrl) {
    return DEFAULT_BGM_URL;
  }

  if (/^https?:\/\//i.test(configuredUrl)) {
    return configuredUrl;
  }

  return DEFAULT_BGM_URL;
}

function getBgmUrls() {
  const configuredUrls = process.env.NEXT_PUBLIC_BGM_URLS
    ?.split(",")
    .map((url: string) => url.trim())
    .filter((url: string) => /^https?:\/\//i.test(url));

  if (configuredUrls && configuredUrls.length > 0) {
    return configuredUrls;
  }

  return [getBgmUrl()];
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
  const bgmUrls = useMemo(() => getBgmUrls(), []);
  const routeTrackPool = useMemo(
    () => getRouteTrackPool(pathname ?? "/", bgmUrls.length),
    [pathname, bgmUrls.length],
  );
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [prompt, setPrompt] = useState(true);
  const [trackIndex, setTrackIndex] = useState(() => pickRandomTrack(routeTrackPool, 0));
  const [controlVisible, setControlVisible] = useState(false);

  const startPlayback = useCallback(async () => {
    if (!audioRef.current) return;

    try {
      await audioRef.current.play();
      setPlaying(true);
      setPrompt(false);
    } catch {
      setPlaying(false);
      setPrompt(true);
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
    <div className="app-music-panel">
      <button
        type="button"
        aria-label={playing ? t("app.pause") : t("app.play")}
        onClick={togglePlay}
        className="app-music-button"
      >
        {playing ? t("app.pause") : t("app.play")}
      </button>
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
          setPlaying(false);
          setPrompt(true);
          playNextTrack();
        }}
        onPlay={() => setPrompt(false)}
        onPause={() => setPrompt(true)}
        onEnded={playNextTrack}
      />
      <span className="app-music-label">{t("app.backgroundMusic")}</span>
      {prompt && <span className="app-music-prompt">{t("app.musicPrompt")}</span>}
    </div>
  );
}
