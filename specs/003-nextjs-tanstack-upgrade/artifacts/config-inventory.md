# Config Inventory (pre-upgrade)

Date: 2026-01-17  
Scope: Frontend config/env sources to monitor during Next.js + TanStack upgrade

## Environment files
- `frontend/.env`
  - `VITE_API_BASE_URL=http://localhost:8000`
  - `VITE_REALTIME_ENABLED=true`
  - `VITE_REALTIME_MODEL=gpt-realtime-mini`
  - Contains a commented Figma token line; keep secrets out of client bundle.

## Build/tooling configs
- `frontend/postcss.config.cjs`: plugins `@tailwindcss/postcss`, `autoprefixer`.
- `frontend/tailwind.config.cjs`: Tailwind 4-style config with custom colors (warm palette), font families, radius, shadows; `content` targets `./index.html`, `./src/**/*.{ts,tsx}`.
- `frontend/vite.config.ts`: Vite-based build (no Next config present yet).
- No `frontend/next.config.js` currently (Next.js not yet installed).

## TypeScript
- `frontend/tsconfig.json`, `tsconfig.node.json` (Vite defaults). To be aligned with Next after upgrade.
