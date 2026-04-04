"use client";

import React, { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useSession } from "next-auth/react";

import { useI18n } from "../i18n/provider";
import type { Locale } from "../i18n/config";
import {
  fetchPreferencesFromDatabase,
  readMusicControlVisibilityPreference,
  savePreferencesToDatabase,
  writeMusicControlVisibilityPreference,
} from "../preferences";

type PreferencesMenuProps = {
  showTrigger?: boolean;
};

export default function PreferencesMenu({ showTrigger = true }: PreferencesMenuProps) {
  const { locale, locales, setLocale, t } = useI18n();
  const { status } = useSession();
  const [open, setOpen] = useState(!showTrigger);
  const [musicControlVisible, setMusicControlVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showTrigger) {
      setOpen(true);
    }
  }, [showTrigger]);

  useEffect(() => {
    setMusicControlVisible(readMusicControlVisibilityPreference());
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;

    let active = true;

    (async () => {
      try {
        const preferences = await fetchPreferencesFromDatabase();
        if (!active || !preferences) return;

        if (preferences.locale) {
          setLocale(preferences.locale as Locale);
        }

        if (typeof preferences.musicControlVisible === "boolean") {
          setMusicControlVisible(preferences.musicControlVisible);
          writeMusicControlVisibilityPreference(preferences.musicControlVisible);
        }
      } catch (error) {
        console.error("Failed to load preferences", error);
      }
    })();

    return () => {
      active = false;
    };
  }, [setLocale, status]);

  useEffect(() => {
    if (!showTrigger || !open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open, showTrigger]);

  const handleMusicVisibility = (nextValue: boolean) => {
    setMusicControlVisible(nextValue);
    writeMusicControlVisibilityPreference(nextValue);

    if (status === "authenticated") {
      setIsSaving(true);
      void savePreferencesToDatabase({
        locale,
        musicControlVisible: nextValue,
      })
        .catch((error) => {
          console.error("Failed to persist music preference", error);
        })
        .finally(() => {
          setIsSaving(false);
        });
    }
  };

  const handleLocaleChange = (nextLocale: Locale) => {
    setLocale(nextLocale);

    if (status === "authenticated") {
      setIsSaving(true);
      void savePreferencesToDatabase({
        locale: nextLocale,
        musicControlVisible,
      })
        .catch((error) => {
          console.error("Failed to persist locale preference", error);
        })
        .finally(() => {
          setIsSaving(false);
        });
    }
  };

  return (
    <div className="app-preferences" ref={menuRef}>
      {showTrigger && (
        <button
          type="button"
          className="app-preferences-trigger"
          aria-label={t("preferences.openAria")}
          onClick={() => setOpen((prev: boolean) => !prev)}
        >
          <span aria-hidden>⚙️</span>
          <span className="hidden sm:inline">{t("preferences.title")}</span>
        </button>
      )}

      {open && (
        <div className="app-preferences-panel" role="dialog" aria-label={t("preferences.title")}>
          <div className="app-preferences-row">
            <label htmlFor="prefs-language" className="app-preferences-label">{t("preferences.defaultLanguage")}</label>
            <div className="app-preferences-field-wrap">
              <select
                id="prefs-language"
                className="app-preferences-select"
                value={locale}
                disabled={isSaving}
                onChange={(event: ChangeEvent<HTMLSelectElement>) => handleLocaleChange(event.target.value as Locale)}
              >
                {locales.map((option: { code: string; label: string }) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
              {isSaving ? <span className="app-inline-spinner app-preferences-spinner" aria-hidden="true" /> : null}
            </div>
          </div>

          <div className="app-preferences-row">
            <p className="app-preferences-label">{t("preferences.musicControl")}</p>
            <div className="app-preferences-toggle-group" role="radiogroup" aria-label={t("preferences.musicControlVisibility")}>
              <button
                type="button"
                role="radio"
                aria-checked={musicControlVisible}
                className={`app-preferences-toggle ${musicControlVisible ? "is-active" : ""}`}
                disabled={isSaving}
                onClick={() => handleMusicVisibility(true)}
              >
                {isSaving && musicControlVisible ? (
                  <>
                    <span className="app-inline-spinner" aria-hidden="true" />
                    <span>{t("preferences.show")}</span>
                  </>
                ) : (
                  t("preferences.show")
                )}
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={!musicControlVisible}
                className={`app-preferences-toggle ${!musicControlVisible ? "is-active" : ""}`}
                disabled={isSaving}
                onClick={() => handleMusicVisibility(false)}
              >
                {isSaving && !musicControlVisible ? (
                  <>
                    <span className="app-inline-spinner" aria-hidden="true" />
                    <span>{t("preferences.hide")}</span>
                  </>
                ) : (
                  t("preferences.hide")
                )}
              </button>
            </div>
          </div>

          {isSaving ? (
            <div className="app-preferences-status" role="status" aria-live="polite">
              <span className="app-inline-spinner" aria-hidden="true" />
              <span>{t("preferences.saving")}</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
