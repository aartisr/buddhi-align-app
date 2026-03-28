"use client";
import { useMemo } from "react";
import { getDailyPrompt } from "../config/reflection-prompts";
import { useI18n } from "../i18n/provider";

interface Props {
  module: "jnana" | "bhakti" | "vasana";
}

export default function DailyReflectionPrompt({ module }: Props) {
  const { t } = useI18n();
  // Memoized: same value all day, no flicker on re-render
  const prompt = useMemo(() => getDailyPrompt(module), [module]);

  if (!prompt) return null;

  return (
    <div className="app-reflection-prompt-card max-w-xl mx-auto mb-6 p-5 rounded-2xl" role="note">
      <div className="app-reflection-prompt-label">
        ✦ {t("reflection.prompt.label")}
      </div>
      <blockquote className="app-reflection-prompt-text mt-2">
        &ldquo;{prompt}&rdquo;
      </blockquote>
    </div>
  );
}
