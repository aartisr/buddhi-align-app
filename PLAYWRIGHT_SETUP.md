# Playwright Browser Contrast Audit - Setup & Execution Guide

**Status:** Playwright tests ready to execute. Installation blocked by network connectivity to npm registries.

## Overview

This guide documents the browser-based contrast audit suite for Buddhi Align's discovery surfaces (About, Updates, Home pages). The tests validate live rendering across light and dark themes to ensure semantic CSS tokens provide sufficient WCAG AA/AAA contrast in all variants.

## Files

- **`e2e/contrast-audit.spec.ts`** (660 lines) — Comprehensive browser contrast audit suite
  - Light/dark theme testing for Home, About, Updates pages
  - Contrast validation for buttons, CTAs, menu items, danger actions
  - Semantic token verification (no hardcoded hex colors)
  - WCAG AA/AAA compliance checks
  - 11 main test cases + 2 accessibility suites

## Prerequisites

Before running, ensure:

1. **Node.js 18+** installed
2. **All static tests passing:**
   ```bash
   npm run test
   ```
3. **Build successful:**
   ```bash
   npm run build
   ```

## Installation (When Network Access Restored)

### Option A: Private Registry (Recommended for org)
```bash
# Use existing .npmrc configuration
npm --workspace=apps/frontend install --save-dev @playwright/test@^1.55.0
```

### Option B: Public npm Registry (Fallback)
```bash
# Bypass .npmrc and use public registry directly
npm --workspace=apps/frontend install --save-dev @playwright/test@^1.55.0 \
  --registry=https://registry.npmjs.org/
```

### Option C: Manual Playwright Install
```bash
# Install Playwright browsers globally
npx playwright install

# Then run tests with globally available browsers
npm --workspace=apps/frontend exec -- playwright test
```

## Running the Audit

### Single Run (Validation)
```bash
cd apps/frontend
npx playwright test e2e/contrast-audit.spec.ts
```

### UI Mode (Interactive Debugging)
```bash
cd apps/frontend
npx playwright test e2e/contrast-audit.spec.ts --ui
```

### Headed Mode (Watch Execution)
```bash
cd apps/frontend
npx playwright test e2e/contrast-audit.spec.ts --headed
```

### Specific Test
```bash
cd apps/frontend
npx playwright test e2e/contrast-audit.spec.ts -g "Updates page dark theme"
```

### Generate Report
```bash
cd apps/frontend
npx playwright test e2e/contrast-audit.spec.ts --reporter=html
# Open test report
open playwright-report/index.html
```

## Test Coverage

| Test | Surface | Purpose |
|------|---------|---------|
| Home page light theme contrast | / | Verify hero/body text readable in light mode |
| Home page dark theme contrast | / | Verify hero/body text readable in dark mode |
| About page light theme contrast | /about | FAQPage items readable in light mode |
| About page dark theme contrast | /about | FAQPage items readable in dark mode |
| Updates page light theme contrast | /updates | Update list readable in light mode |
| Updates page dark theme contrast | /updates | Update list readable in dark mode |
| Danger action hover state uses semantic tokens | All | Verify danger actions use CSS variables |
| Anonymous callout uses semantic warning tokens | / | Verify anonymous UI uses --warning-surface |
| CTA links in 404 page use semantic tokens | /404 | Verify not-found CTAs use semantic colors |
| Navigation menu items maintain contrast in dark | / | Verify nav readable in dark theme |
| Button hover states use filter brightness | / | Verify hover uses brightness filter, not hex |
| Critical text meets WCAG AA (4.5:1) in light | / | Sample verification of contrast ratio |
| All color tokens are CSS variables | / | Scan for hardcoded hex regressions |

## Expected Results

All 13 tests should pass:
```
✓ Contrast audit across discovery surfaces (11 tests)
✓ Accessibility: Color contrast WCAG levels (2 tests)

Test Files  1 passed (1)
Tests      13 passed (13)
```

## Troubleshooting

### Tests Fail with "Browser Not Found"
```bash
# Install Playwright browsers
npx playwright install
```

### Network Timeout During Page Load
- Increase timeout in test:
  ```typescript
  test.setTimeout(60000); // 60 seconds
  ```
- Ensure dev server is running:
  ```bash
  npm run dev
  ```

### Dark Theme Not Switching
- Check `data-testid='theme-toggle'` exists in DOM
- Verify `document.documentElement.classList.contains('dark')` after toggle
- Manual toggle via JS is fallback in tests

### Tests Pass Locally but Fail in CI
- CI may disable animations differently
- Check `addInitScript` for animation disabling logic
- Verify viewport size matches CI runner

## Integration with Existing Tests

**Static tests** (already passing):
- `theme-token-contrast.test.ts` — CSS variable verification
- `no-hardcoded-white-actions.test.ts` — Regex scan for #fff colors
- `autograph-exchange-contrast.test.ts` — Exchange page contrast

**Browser tests** (new):
- `e2e/contrast-audit.spec.ts` — Live rendering validation

**Together they provide:**
1. **Static:** Verify CSS tokens exist and are used
2. **Browser:** Verify rendered contrast is readable
3. **Regex:** Catch #fff regressions in CSS files

## CI/CD Pipeline

Add to your GitHub Actions/CI:

```yaml
- name: Install Playwright
  run: npm --workspace=apps/frontend install --save-dev @playwright/test@^1.55.0 --registry=https://registry.npmjs.org/

- name: Run contrast audit
  run: npm --workspace=apps/frontend exec -- playwright test e2e/contrast-audit.spec.ts

- name: Upload report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: apps/frontend/playwright-report/
```

## Performance Baseline

Expected runtime per test file: **15-30 seconds** (depending on system)

```
Total Estimated Time:
- Playwright install: 2-5 minutes (first time only)
- Test run: ~30 seconds
- Report generation: ~5 seconds
```

## Next Steps

1. **When network access restored:**
   ```bash
   npm --workspace=apps/frontend install --save-dev @playwright/test@^1.55.0
   npx playwright install
   ```

2. **Run full validation:**
   ```bash
   npm run lint && npm run test && npm run build
   npm --workspace=apps/frontend exec -- playwright test e2e/contrast-audit.spec.ts
   ```

3. **Review results and merge code to main**

## Debugging Tips

- Enable Playwright debug mode:
  ```bash
  PWDEBUG=1 npx playwright test e2e/contrast-audit.spec.ts
  ```

- Screenshot on failure (auto-enabled in tests):
  ```bash
  npx playwright test e2e/contrast-audit.spec.ts --headed
  ```

- Inspect specific element computed styles:
  ```typescript
  const style = await element.evaluate(el => window.getComputedStyle(el));
  console.log(style); // Logs all computed styles
  ```

## Files Generated

After running:
- `playwright-report/` — Full HTML report with traces
- `.playwright/` — Playwright browser binaries cache
- `test-results/` — Failed test artifacts (if any)

## References

- [Playwright Documentation](https://playwright.dev)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/test-evaluate/contrast-checker/)
- [Buddhi Align CSS Tokens](../app/styles/theme-base.css)

---

**Created:** 2026-07-04  
**Last Updated:** When tests pass  
**Maintainer:** Buddhi Align team
