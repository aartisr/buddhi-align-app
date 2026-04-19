import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

describe("autograph-exchange dark-mode contrast guardrails", () => {
  const require = createRequire(import.meta.url);
  const css = readFileSync(require.resolve("@aartisr/autograph-feature/styles.css"), "utf8");

  it("keeps explicit dark-mode fallback backgrounds for inbox and archive cards", () => {
    expect(css).toContain(".autograph-tone-inbox .autograph-request-card {");
    expect(css).toContain("background: linear-gradient(180deg, rgba(30, 66, 54, 0.9) 0%, rgba(23, 54, 43, 0.84) 100%);");

    expect(css).toContain(".autograph-tone-archive .autograph-archive-card {");
    expect(css).toContain("background: linear-gradient(180deg, rgba(30, 53, 75, 0.9) 0%, rgba(23, 44, 63, 0.84) 100%);");
  });

  it("keeps high-contrast text overrides on inner cards in dark mode", () => {
    expect(css).toContain(
      ".autograph-tone-inbox .autograph-request-card :is(.autograph-card-title, .app-copy-soft, .autograph-request-pair, .autograph-request-time, .autograph-char-count),",
    );
    expect(css).toContain(
      ".autograph-tone-archive .autograph-archive-card :is(.autograph-card-title, .app-copy-soft, .autograph-request-pair, .autograph-request-time, .autograph-char-count) {",
    );
    expect(css).toContain("color: var(--autograph-tone-heading);");

    expect(css).toContain(".autograph-tone-archive .autograph-signature-quote {");
    expect(css).toContain("color: var(--autograph-tone-heading);");
  });

  it("uses semantic foreground tokens for helper text and dark-mode readability", () => {
    expect(css).toContain("--autograph-heading-color:");
    expect(css).toContain("--autograph-copy-color:");
    expect(css).toContain(".autograph-section-step");
    expect(css).toContain("color: var(--autograph-heading-color);");
    expect(css).toContain(".autograph-inline-note");
    expect(css).toContain(".autograph-context-detail");
    expect(css).toContain(".autograph-suggestion-chip");
  });

  it("defines page-scoped contrast tokens for all autograph buttons", () => {
    expect(css).toContain("--autograph-button-primary-text:");
    expect(css).toContain("--autograph-button-secondary-text:");
    expect(css).toContain(".autograph-shell .app-button-primary {");
    expect(css).toContain(".autograph-secondary-btn {");
    expect(css).toContain(".autograph-suggestion-chip {");
  });

  it("defines page-scoped contrast tokens for autograph badges", () => {
    expect(css).toContain("--autograph-badge-accent-text:");
    expect(css).toContain("--autograph-badge-success-text:");
    expect(css).toContain(".autograph-setup-badge {");
    expect(css).toContain(".autograph-status-pill.is-pending {");
    expect(css).toContain(".autograph-status-pill.is-signed {");
  });
});
