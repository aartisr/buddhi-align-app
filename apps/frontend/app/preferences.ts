export const MUSIC_CONTROL_VISIBLE_KEY = "buddhi-align-music-control-visible";
export const LOCALE_STORAGE_KEY = "buddhi-align-locale";
export const PREFERENCES_UPDATED_EVENT = "buddhi-align-preferences-updated";

export interface UserPreferences {
  locale?: string;
  musicControlVisible?: boolean;
}

export function readMusicControlVisibilityPreference(): boolean {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(MUSIC_CONTROL_VISIBLE_KEY);
  if (stored === null) return false;
  return stored === "true";
}

export function writeMusicControlVisibilityPreference(isVisible: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MUSIC_CONTROL_VISIBLE_KEY, String(isVisible));
  window.dispatchEvent(new CustomEvent(PREFERENCES_UPDATED_EVENT));
}

export function readStoredLocalePreference(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LOCALE_STORAGE_KEY);
}

export function writeStoredLocalePreference(locale: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  window.dispatchEvent(new CustomEvent(PREFERENCES_UPDATED_EVENT));
}

export async function fetchPreferencesFromDatabase(): Promise<UserPreferences | null> {
  const response = await fetch("/api/preferences", {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  });

  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Failed to load preferences from database");

  const payload = (await response.json()) as UserPreferences;
  return payload;
}

export async function savePreferencesToDatabase(preferences: UserPreferences): Promise<UserPreferences | null> {
  const response = await fetch("/api/preferences", {
    method: "PUT",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(preferences),
  });

  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Failed to save preferences to database");

  return (await response.json()) as UserPreferences;
}
