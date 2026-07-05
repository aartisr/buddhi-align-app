#!/usr/bin/env node
import { chromium } from "@playwright/test";

const BASE_URL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:3000";
const THEMES = ["sattva", "sunrise", "midnight"];
const ROUTES = [
  "/",
  "/about",
  "/karma-yoga",
  "/bhakti-journal",
  "/jnana-reflection",
  "/dhyana-meditation",
  "/vasana-tracker",
  "/dharma-planner",
  "/motivation-analytics",
  "/share",
  "/community",
  "/support",
  "/settings",
  "/sign-in",
  "/autograph-exchange",
  "/profiles",
];

function makeUrl(route, theme) {
  const separator = route.includes("?") ? "&" : "?";
  return `${BASE_URL}${route}${separator}theme=${theme}`;
}

function summarize(results) {
  const grouped = new Map();
  for (const item of results) {
    const key = `${item.theme}:${item.route}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(item);
  }

  const lines = [];
  lines.push(`Checked ${THEMES.length} themes across ${ROUTES.length} routes.`);
  lines.push(`Found ${results.length} potential contrast issues.`);
  for (const [key, issues] of grouped.entries()) {
    const sorted = issues.sort((a, b) => a.ratio - b.ratio).slice(0, 6);
    lines.push(`\n${key} (${issues.length} issues)`);
    for (const issue of sorted) {
      lines.push(`  ratio=${issue.ratio.toFixed(2)} threshold=${issue.threshold.toFixed(2)} selector=${issue.selector} text="${issue.text}"`);
    }
  }

  return lines.join("\n");
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 2200 } });
  const allIssues = [];

  for (const theme of THEMES) {
    for (const route of ROUTES) {
      const url = makeUrl(route, theme);
      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 });
      } catch (error) {
        allIssues.push({
          theme,
          route,
          ratio: 0,
          threshold: 4.5,
          selector: "[navigation-failure]",
          text: String(error).slice(0, 160),
        });
        continue;
      }

      const issues = await page.evaluate(() => {
        const MIN_ALPHA = 0.001;

        function parseCssColor(value) {
          if (!value) return null;
          const v = value.trim().toLowerCase();
          if (v === "transparent") return { r: 0, g: 0, b: 0, a: 0 };

          const rgbMatch = v.match(/rgba?\(([^)]+)\)/);
          if (rgbMatch) {
            const parts = rgbMatch[1].split(",").map((part) => part.trim());
            if (parts.length < 3) return null;
            const r = Number.parseFloat(parts[0]);
            const g = Number.parseFloat(parts[1]);
            const b = Number.parseFloat(parts[2]);
            const a = parts[3] !== undefined ? Number.parseFloat(parts[3]) : 1;
            if ([r, g, b, a].some((n) => Number.isNaN(n))) return null;
            return { r, g, b, a };
          }

          const hexMatch = v.match(/^#([0-9a-f]{6}|[0-9a-f]{8})$/i);
          if (hexMatch) {
            const hex = hexMatch[1];
            const r = Number.parseInt(hex.slice(0, 2), 16);
            const g = Number.parseInt(hex.slice(2, 4), 16);
            const b = Number.parseInt(hex.slice(4, 6), 16);
            const a = hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1;
            return { r, g, b, a };
          }

          return null;
        }

        function composite(top, bottom) {
          const a = top.a + bottom.a * (1 - top.a);
          if (a <= 0) return { r: 0, g: 0, b: 0, a: 0 };
          return {
            r: (top.r * top.a + bottom.r * bottom.a * (1 - top.a)) / a,
            g: (top.g * top.a + bottom.g * bottom.a * (1 - top.a)) / a,
            b: (top.b * top.a + bottom.b * bottom.a * (1 - top.a)) / a,
            a,
          };
        }

        function srgbToLinear(channel) {
          const c = channel / 255;
          return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        }

        function luminance(color) {
          return 0.2126 * srgbToLinear(color.r) + 0.7152 * srgbToLinear(color.g) + 0.0722 * srgbToLinear(color.b);
        }

        function contrastRatio(a, b) {
          const l1 = luminance(a);
          const l2 = luminance(b);
          const lighter = Math.max(l1, l2);
          const darker = Math.min(l1, l2);
          return (lighter + 0.05) / (darker + 0.05);
        }

        function selectorFor(el) {
          const parts = [];
          let current = el;
          while (current && current.nodeType === Node.ELEMENT_NODE && parts.length < 5) {
            let part = current.tagName.toLowerCase();
            if (current.id) {
              part += `#${current.id}`;
              parts.unshift(part);
              break;
            }
            if (current.classList.length > 0) {
              part += `.${Array.from(current.classList).slice(0, 2).join(".")}`;
            }
            parts.unshift(part);
            current = current.parentElement;
          }
          return parts.join(" > ");
        }

        function isVisible(el, style) {
          if (!el.isConnected) return false;
          if (style.display === "none" || style.visibility === "hidden" || Number.parseFloat(style.opacity) < 0.1) return false;
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        }

        function isLargeText(style) {
          const fontSize = Number.parseFloat(style.fontSize || "16");
          const fontWeight = Number.parseInt(style.fontWeight || "400", 10);
          return fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
        }

        function effectiveBackground(el) {
          const rootStyle = getComputedStyle(document.documentElement);
          const themeBaseToken = rootStyle.getPropertyValue("--background");
          const themeBase = parseCssColor(themeBaseToken) || { r: 255, g: 255, b: 255, a: 1 };
          let bg = { ...themeBase };

          const chain = [];
          let current = el;
          while (current) {
            chain.unshift(current);
            current = current.parentElement;
          }

          for (const node of chain) {
            const style = getComputedStyle(node);
            const parsed = parseCssColor(style.backgroundColor);
            if (parsed && parsed.a > MIN_ALPHA) {
              bg = composite(parsed, bg);
            }
          }

          return bg;
        }

        const issues = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const seen = new Set();

        while (walker.nextNode()) {
          const node = walker.currentNode;
          const text = node.nodeValue ? node.nodeValue.replace(/\s+/g, " ").trim() : "";
          if (!text) continue;
          if (text.length < 2) continue;
          if (!/[\p{L}\p{N}]/u.test(text)) continue;

          const parent = node.parentElement;
          if (!parent) continue;
          if (seen.has(parent)) continue;

          const style = getComputedStyle(parent);
          if (!isVisible(parent, style)) continue;

          const fg = parseCssColor(style.color);
          if (!fg || fg.a <= MIN_ALPHA) continue;

          const bg = effectiveBackground(parent);
          const ratio = contrastRatio(fg, bg);
          const threshold = isLargeText(style) ? 3 : 4.5;

          if (ratio < threshold) {
            issues.push({
              selector: selectorFor(parent),
              text: text.slice(0, 80),
              ratio,
              threshold,
            });
          }

          seen.add(parent);
        }

        issues.sort((a, b) => a.ratio - b.ratio);
        return issues.slice(0, 50);
      });

      for (const issue of issues) {
        allIssues.push({ theme, route, ...issue });
      }
    }
  }

  await browser.close();

  console.log(summarize(allIssues));

  if (allIssues.length > 0) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
