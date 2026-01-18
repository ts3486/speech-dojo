# Baseline (pre-upgrade)

Date: 2026-01-17  
Scope: Before upgrading to Next.js + TanStack Query

## Package versions (frontend/package.json)
- React: ^18.3.1
- React DOM: ^18.3.1
- React Router DOM: ^6.28.0
- TypeScript: ^5.3.3
- Vite: ^5.2.0
- Tailwind CSS: ^4.1.18
- TanStack Query: *Not present*
- Next.js: *Not present (Vite-based app)*

## Scripts (frontend/package.json)
- dev: `vite`
- build: `vite build`
- preview: `vite preview`
- test: `vitest`

## Build/test output (pre-upgrade)
- `pnpm install` (frontend): Already up to date (≈0.2s)
- `pnpm lint`: fails (script missing)
- `pnpm test`: timed out after 120s due to watch mode, but Vitest run passed (10 files, 15 tests). Warnings: React Router v7 future flag notices; repeated `act(...)` warning in session.spec.tsx.
- `pnpm build`: success via Vite; duration ≈0.4s; output: index.html 0.40 kB, CSS 10.8 kB, JS 183.37 kB (gzip 59.27 kB).
