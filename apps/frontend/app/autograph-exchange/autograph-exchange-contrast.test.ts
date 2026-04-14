import { readFileSync } from "node:fs";

describe("autograph-exchange dark-mode contrast guardrails", () => {
  const css = readFileSync("app/autograph-exchange/autograph-exchange.css", "utf8");

  it("keeps explicit dark-mode fallback backgrounds for inbox and archive cards", () => {
    expect(css).toContain(".autograph-tone-inbox .autograph-request-card {");
    expect(css).toContain("background: linear-gradient(180deg, rgba(30, 66, 54, 0.9) 0%, rgba(23, 54, 43, 0.84) 100%);");

    expect(css).toContain(".autograph-tone-archive .autograph-archive-card {");
    expect(css).toContain("background: linear-gradient(180deg, rgba(30, 53, 75, 0.9) 0%, rgba(23, 44, 63, 0.84) 100%);");
  });

  it("keeps high-contrast text overrides on inner cards in dark mode", () => {
    expect(css).toContain(
      ".autograph-tone-inbox .autograph-request-card :is(.text-sm.font-medium, .app-copy-soft, .autograph-request-pair, .autograph-request-time, .autograph-char-count),",
    );
    expect(css).toContain(
      ".autograph-tone-archive .autograph-archive-card :is(.text-sm.font-medium, .app-copy-soft, .autograph-request-pair, .autograph-request-time, .autograph-char-count) {",
    );
    expect(css).toContain("color: var(--autograph-tone-heading);");

    expect(css).toContain(".autograph-tone-archive .autograph-signature-quote {");
    expect(css).toContain("color: var(--autograph-tone-heading);");
  });
});
