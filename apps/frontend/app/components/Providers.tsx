"use client";

import { useEffect, useRef } from "react";
import { SessionProvider } from "next-auth/react";
import RequestFeedbackProvider from "./RequestFeedbackProvider";
import WebVitalsReporter from "./WebVitalsReporter";
import {
  PREFERENCES_UPDATED_EVENT,
  readStoredThemePreference,
  writeStoredThemePreference,
} from "../preferences";
import {
  normalizeSeasonalThemeName,
  normalizeThemeName,
  resolveDefaultSeasonalTheme,
  resolveDefaultTheme,
  themeColorScheme,
  type SeasonalThemeName,
  type ThemeName,
} from "../lib/theme";

const isClientObservabilityEnabled = process.env.NEXT_PUBLIC_OBSERVABILITY_CLIENT === "1";
const CLARITY_PROJECT_ID = "w90fdbtt4x";
const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim() || CLARITY_PROJECT_ID;

function applyTheme(theme: ThemeName, seasonalTheme: SeasonalThemeName | null) {
  document.documentElement.dataset.theme = theme;
  if (seasonalTheme) {
    document.documentElement.dataset.season = seasonalTheme;
  } else {
    delete document.documentElement.dataset.season;
  }
  document.documentElement.style.colorScheme = themeColorScheme(theme);
}

/**
 * Client-side session provider wrapper.
 * Placed here so the root layout (a Server Component) can include it.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  const hasInitializedClarity = useRef(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const searchTheme = normalizeThemeName(searchParams.get("theme"));
    const searchSeasonalTheme = normalizeSeasonalThemeName(searchParams.get("season"));
    const storedTheme = normalizeThemeName(readStoredThemePreference());
    const nextTheme = searchTheme ?? storedTheme ?? resolveDefaultTheme();
    const seasonalTheme = searchSeasonalTheme ?? resolveDefaultSeasonalTheme();

    applyTheme(nextTheme, seasonalTheme);
    if (searchTheme || !storedTheme) {
      writeStoredThemePreference(nextTheme);
    }

    const onPreferenceUpdate = () => {
      const updatedTheme = normalizeThemeName(readStoredThemePreference()) ?? resolveDefaultTheme();
      applyTheme(updatedTheme, seasonalTheme);
    };

    window.addEventListener(PREFERENCES_UPDATED_EVENT, onPreferenceUpdate);
    return () => {
      window.removeEventListener(PREFERENCES_UPDATED_EVENT, onPreferenceUpdate);
    };
  }, []);

  useEffect(() => {
    if (!clarityProjectId || hasInitializedClarity.current) {
      return;
    }

    hasInitializedClarity.current = true;

    const scriptId = `ms-clarity-${clarityProjectId}`;
    if (document.getElementById(scriptId)) {
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${encodeURIComponent(clarityProjectId)}`;
    script.onerror = () => {
      hasInitializedClarity.current = false;
    };
    document.head.appendChild(script);
  }, []);

  return (
    <SessionProvider>
      {isClientObservabilityEnabled ? <WebVitalsReporter /> : null}
      <RequestFeedbackProvider>{children}</RequestFeedbackProvider>
    </SessionProvider>
  );
}
