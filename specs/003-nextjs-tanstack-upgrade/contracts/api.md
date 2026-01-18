# API Contracts: Upgrade Next.js + TanStack

**Feature**: specs/003-nextjs-tanstack-upgrade  
**Date**: 2026-01-17  
**Scope**: No API changes expected; verify parity with existing endpoints.

## Parity Expectations

- All existing routes and API calls must behave identically post-upgrade (topics, session creation, history listing/detail, transcript retrieval).
- Keep request/response shapes unchanged; ensure TanStack hook migrations do not alter query keys, params, or headers.
- Error handling surfaces must remain consistent (loading, error, retry states).

## Test Focus

- Regression checks for each page’s data fetch:
  - Home/session list/topics fetch
  - Session creation/logs
  - History list and history detail fetches
- Ensure auth/secret handling stays server-side; no new client exposure.
