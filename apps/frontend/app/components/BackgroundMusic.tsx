
'use client';
import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n/provider";

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

  const startPlayback = async () => {
    if (!audioRef.current) return;

    try {
      await audioRef.current.play();
      setPlaying(true);
      setPrompt(false);
    } catch {
      setPlaying(false);
      setPrompt(true);
    }
  };

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;

    // Attempt autoplay; browsers may block this until user interaction.
    void startPlayback();
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (!playing) return;

    void startPlayback();
  }, [trackIndex]);

  const playNextTrack = () => {
    if (bgmUrls.length <= 1) return;

    setTrackIndex((currentIndex) => {
      const nextIndex = currentIndex + 1;
      if (nextIndex >= bgmUrls.length) {
        return 0;
      }

      return nextIndex;
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
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000, background: "#fff", border: "2px solid #4B0082", borderRadius: 14, boxShadow: "0 2px 12px #0002", padding: 16, display: "flex", alignItems: "center", gap: 12, minWidth: 220 }}>
      <button
        aria-label={playing ? t("app.pause") : t("app.play")}
        onClick={togglePlay}
        style={{ fontSize: 16, fontWeight: 600, background: "#4B0082", color: "#fff", border: "none", borderRadius: 8, padding: "6px 18px", cursor: "pointer" }}
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
        style={{ width: 80 }}
      />
      <audio
        ref={audioRef}
          src={bgmUrls[trackIndex]}
          loop={bgmUrls.length === 1}
        autoPlay
        preload="auto"
        style={{ display: "none" }}
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
      <span style={{ fontSize: 12, color: "#4B0082", marginLeft: 8 }}>{t("app.backgroundMusic")}</span>
      {prompt && (
        <span style={{ color: "#C72C6A", fontSize: 12, marginLeft: 8 }}>
          {t("app.musicPrompt")}
        </span>
      )}
    </div>
  );
}
