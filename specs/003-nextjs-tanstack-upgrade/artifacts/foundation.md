# Foundation Check (post-upgrade baseline)

Date: 2026-01-17  
Scope: After foundational upgrades (Next/TanStack/packages/configs)

## Commands
- `pnpm lint` (frontend): ✅ success, warnings: React Router v7 future flags; react-hooks/exhaustive-deps warning in `src/pages/session.tsx` (existing).
- `pnpm test --run` (frontend): ✅ 10 files, 15 tests passed. Warnings: React Router future flags; repeated `act(...)` warning in `tests/integration/session.spec.tsx` (pre-existing).
- `pnpm build` (frontend, Next): ✅ success. ESLint warning remains about `showNetworkAlert` dependency in `src/pages/session.tsx`.

## Notes
- Added Next.js pages catch-all wrapping existing SPA (React Router) with client-only render.
- Added TanStack Query provider; no query migrations applied yet (pending US3 tasks).
- Vite retained only for Vitest runtime; not used for app build.
