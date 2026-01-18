# Post-upgrade validation (US1)

Date: 2026-01-17  

## Commands
- `pnpm dev --hostname 127.0.0.1 --port 3000`: ✅ started in ~1.5s (log: /tmp/nextdev.log), no runtime errors.
- `pnpm build`: ✅ Next build succeeded; shared JS ~93 kB first load. Warning: react-hooks/exhaustive-deps on `showNetworkAlert` (pre-existing).
- `pnpm test --run`: ✅ all Vitest suites passed (warnings about React Router future flags and act() already noted).

## Notes
- App runs via Next pages catch-all rendering existing SPA (React Router) with client-only dynamic import.
- TanStack Query provider now wraps app globally; no query hook migrations yet (US3).
