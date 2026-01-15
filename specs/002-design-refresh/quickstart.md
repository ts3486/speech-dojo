# Quickstart: Design Refresh

1) **Frontend**
- Install deps: `cd frontend && pnpm install`.
- Run dev server: `pnpm dev`.
- Run tests: `pnpm test` (Vitest) focusing on updated integration/component specs.
- Ensure fonts (Sora/Inter) are imported in global CSS and design tokens are loaded.

2) **Backend (regression only)**
- Set env: `DATABASE_URL`, `S3_BUCKET`, `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `OPENAI_SECRET_KEY`.
- Run: `cd backend && cargo test` (no contract changes expected).

3) **Validation**
- Keyboard-only navigation across header/nav and session/history/detail pages.
- Visual check for new theme (amber/teal), AA+ contrast, focus-visible, skip-to-main.
- Resilience flows: offline/token/mic alerts show actionable retry/end buttons.
