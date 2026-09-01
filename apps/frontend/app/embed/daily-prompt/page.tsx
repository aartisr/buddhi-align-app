"use client";

import React, { useState, useEffect } from "react";
import "./embed.css";

const PROMPTS = [
  "How did I practice compassion today?",
  "What am I holding onto that I can release?",
  "Did I act in alignment with my Dharma today?",
  "Where can I find stillness in this moment?",
  "What am I grateful for right now?",
  "How can I serve others today?",
  "Am I listening to understand, or listening to reply?"
];

export default function DailyPromptEmbed() {
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    const today = new Date();
    // Use the date to deterministically pick a prompt for the day
    const index = (today.getFullYear() + today.getMonth() + today.getDate()) % PROMPTS.length;
    setPrompt(PROMPTS[index]);
  }, []);

  return (
    <div className="buddhi-embed-container">
      <div className="buddhi-embed-header">
        <span className="buddhi-embed-kicker">Daily Dharma Contemplation</span>
      </div>
      <h3 className="buddhi-embed-prompt">{prompt || "..."}</h3>
      <a href="https://buddhi-align.com" target="_blank" rel="noopener noreferrer" className="buddhi-embed-footer">
        Powered by <strong>Buddhi Align</strong>
      </a>
    </div>
  );
}
