
'use client';
import { useRef, useState } from "react";


export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(0.2);
  const [prompt, setPrompt] = useState(false);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      setPlaying(true);
      setPrompt(false);
    } else {
      audioRef.current.pause();
      setPlaying(false);
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
        aria-label={playing ? "Pause background music" : "Play background music"}
        onClick={togglePlay}
        style={{ fontSize: 16, fontWeight: 600, background: "#4B0082", color: "#fff", border: "none", borderRadius: 8, padding: "6px 18px", cursor: "pointer" }}
      >
        {playing ? "Pause" : "Play"}
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={handleVolume}
        aria-label="Music volume"
        style={{ width: 80 }}
      />
      <audio
        ref={audioRef}
        src="https://cdn.pixabay.com/audio/2022/10/16/audio_12b5fae3b6.mp3"
        loop
        autoPlay
        style={{ display: "none" }}
        onLoadedMetadata={() => {
          if (audioRef.current) audioRef.current.volume = volume;
        }}
        onPlay={() => setPrompt(false)}
        onPause={() => setPrompt(true)}
      />
      <span style={{ fontSize: 12, color: "#4B0082", marginLeft: 8 }}>Background music</span>
      {!playing && (
        <span style={{ color: "#C72C6A", fontSize: 12, marginLeft: 8 }}>
          Click Play to enjoy soothing music
        </span>
      )}
    </div>
  );
}
