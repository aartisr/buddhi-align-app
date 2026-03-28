
'use client';
import { useCallback, useEffect, useRef, useState } from "react";
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
    .map((url) => url.trim())
    .filter((url) => /^https?:\/\//i.test(url));

  if (configuredUrls && configuredUrls.length > 0) {
    return configuredUrls;
  }

  return [getBgmUrl()];
}

export default function BackgroundMusic() {
  const { t } = useI18n();
  const audioRef = useRef<HTMLAudioElement>(null);
  const bgmUrls = getBgmUrls();
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [prompt, setPrompt] = useState(true);
  const [trackIndex, setTrackIndex] = useState(0);
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

  const playNextTrack = () => {
    if (bgmUrls.length <= 1) return;

    setTrackIndex((currentIndex) => {
      const nextIndex = currentIndex + 1;
      return nextIndex >= bgmUrls.length ? 0 : nextIndex;
    });
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

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
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
