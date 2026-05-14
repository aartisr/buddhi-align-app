import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import BackgroundMusic, { getBgmUrlsFromEnv, normalizeBgmUrl } from "./BackgroundMusic";

const { usePathnameMock, useI18nMock, readMusicControlVisibilityPreferenceMock } = vi.hoisted(() => ({
  usePathnameMock: vi.fn(),
  useI18nMock: vi.fn(),
  readMusicControlVisibilityPreferenceMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: usePathnameMock,
}));

vi.mock("../i18n/provider", () => ({
  useI18n: useI18nMock,
}));

vi.mock("../preferences", () => ({
  PREFERENCES_UPDATED_EVENT: "buddhi-align-preferences-updated",
  readMusicControlVisibilityPreference: readMusicControlVisibilityPreferenceMock,
}));

describe("BackgroundMusic URL parsing", () => {
  it("accepts https URLs and same-origin absolute paths", () => {
    expect(normalizeBgmUrl("https://example.com/track.mp3")).toBe("https://example.com/track.mp3");
    expect(normalizeBgmUrl("/audio/track.mp3")).toBe("/audio/track.mp3");
  });

  it("rejects unsupported URL forms", () => {
    expect(normalizeBgmUrl("ftp://example.com/track.mp3")).toBeNull();
    expect(normalizeBgmUrl("track.mp3")).toBeNull();
    expect(normalizeBgmUrl("   ")).toBeNull();
  });

  it("prefers NEXT_PUBLIC_BGM_URLS, then NEXT_PUBLIC_BGM_URL, then default", () => {
    expect(
      getBgmUrlsFromEnv({
        NEXT_PUBLIC_BGM_URLS: "https://a.example/one.mp3, /audio/two.mp3, invalid",
      } as NodeJS.ProcessEnv),
    ).toEqual(["https://a.example/one.mp3", "/audio/two.mp3"]);

    expect(
      getBgmUrlsFromEnv({
        NEXT_PUBLIC_BGM_URL: "/audio/single.mp3",
      } as NodeJS.ProcessEnv),
    ).toEqual(["/audio/single.mp3"]);

    expect(getBgmUrlsFromEnv({} as NodeJS.ProcessEnv)).toEqual([
      "/audio/meditation-ambient-1.mp3",
      "/audio/meditation-ambient-2.mp3",
      "/audio/meditation-ambient-3.mp3",
    ]);
  });
});

describe("BackgroundMusic rendering", () => {
  beforeEach(() => {
    usePathnameMock.mockReturnValue("/");
    useI18nMock.mockReturnValue({
      t: (key: string) => key,
    });
    readMusicControlVisibilityPreferenceMock.mockReturnValue(true);
  });

  it("renders player controls when music control preference is visible", () => {
    render(<BackgroundMusic />);
    expect(screen.getByRole("button", { name: "app.play" })).toBeInTheDocument();
    // Expand to see full controls
    const expandBtn = screen.getByRole("button", { name: /Expand player/i });
    expect(expandBtn).toBeInTheDocument();
  });

  it("hides player controls when preference is hidden", () => {
    readMusicControlVisibilityPreferenceMock.mockReturnValue(false);
    render(<BackgroundMusic />);
    expect(screen.queryByRole("button", { name: "app.play" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("app.backgroundMusic")).not.toBeInTheDocument();
  });

  it("expands and collapses player", () => {
    render(<BackgroundMusic />);
    // Initially compact, slider not visible
    expect(screen.queryByLabelText("app.backgroundMusic")).not.toBeInTheDocument();
    
    // Expand
    const expandBtn = screen.getByRole("button", { name: /Expand player/i });
    fireEvent.click(expandBtn);
    
    // Now slider should be visible
    expect(screen.getByLabelText("app.backgroundMusic")).toBeInTheDocument();
  });
});
