import { describe, expect, it } from "vitest";

import {
  MUSIC_CONTROL_VISIBLE_KEY,
  readMusicControlVisibilityPreference,
  writeMusicControlVisibilityPreference,
} from "./preferences";

describe("music control visibility preference", () => {
  it("defaults to visible when no value is stored", () => {
    window.localStorage.removeItem(MUSIC_CONTROL_VISIBLE_KEY);
    expect(readMusicControlVisibilityPreference()).toBe(true);
  });

  it("reads and writes explicit values", () => {
    writeMusicControlVisibilityPreference(false);
    expect(readMusicControlVisibilityPreference()).toBe(false);

    writeMusicControlVisibilityPreference(true);
    expect(readMusicControlVisibilityPreference()).toBe(true);
  });
});
