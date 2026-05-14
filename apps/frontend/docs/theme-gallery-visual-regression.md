# Theme Gallery Visual Regression

This visual regression covers the homepage theme preview gallery, including the interactive hover/focus state that previously allowed low-contrast regressions.

## Scope

The screenshot suite captures:

- the full `.app-theme-gallery` section
- all three active app themes: `sattva`, `sunrise`, `midnight`
- an interactive state where the first midnight-card action link is hovered and focused

This ensures the gallery stays readable when:

- the app theme changes
- the preview cards show mixed theme surfaces
- interaction states override link styles

## Files

- `e2e/theme-gallery.visual.spec.js`
- `playwright.config.js`

## Run

```bash
npm run test:visual
```

To generate or refresh baseline screenshots:

```bash
npm run test:visual -- --update-snapshots
```

## Expected snapshots

Playwright stores golden images under the test snapshot directory it creates next to the spec.
Commit updated snapshots only when the visual change is intentional.

## Current limitation

This repo currently cannot install new npm packages when the npm registry is unreachable. If Playwright is not installed locally, `npm run test:visual` will fail with `playwright: command not found`.

The visual spec is still committed so the regression harness is ready as soon as package installation is available again.
