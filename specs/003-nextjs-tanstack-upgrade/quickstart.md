# Quickstart: Upgrade Next.js + TanStack

**Feature**: specs/003-nextjs-tanstack-upgrade  
**Date**: 2026-01-17  

## Prerequisites
- Node 18+ (matching Next.js support matrix)
- pnpm installed
- Existing backend/API available for integration tests (no changes required)

## Install
```bash
cd frontend
pnpm install
```

## Run Dev
```bash
pnpm dev
```
Verify Home → Session → History → Session Detail still load without runtime errors.

## Build & Test
```bash
pnpm lint
pnpm test
pnpm build
```
Treat new build warnings or >10% build time/bundle size regressions as blockers.

## Notes
- Environment variables must remain server-only where required; do not expose secrets in the browser.
- Query cache keys and API shapes must stay unchanged to preserve caching and UI behavior.
