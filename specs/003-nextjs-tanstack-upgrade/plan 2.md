# Implementation Plan: Upgrade Next.js + TanStack

**Branch**: `003-nextjs-tanstack-upgrade` | **Date**: 2026-01-17 | **Spec**: specs/003-nextjs-tanstack-upgrade/spec.md  
**Input**: Feature specification from `/specs/003-nextjs-tanstack-upgrade/spec.md`

**Note**: This plan aligns with the Speech Dojo constitution.

## Summary

Upgrade the frontend to the latest stable Next.js and TanStack Query while keeping navigation and data behaviors (Home, Session, History, Session Detail) identical. Ensure clean installs still pass dev/build/test, avoid >10% build/bundle regressions, and document any breaking changes addressed.

## Technical Context

**Language/Version**: TypeScript 5.x; React 18+; Next.js latest stable (current v15.x line); TanStack Query v5 latest  
**Primary Dependencies**: Next.js app router, React, TanStack Query, Tailwind/PostCSS pipeline, Vite-era tooling to be aligned with Next (if present)  
**Storage**: N/A (frontend-only upgrade; backend unchanged)  
**Testing**: Vitest/Testing Library for frontend; add Next-friendly build/dev smoke checks  
**Target Platform**: Web (modern evergreen browsers)  
**Project Type**: Web application (frontend in `/frontend`)  
**Performance Goals**: Build time and bundle size within ±10% of pre-upgrade baseline; HMR stable; no new critical build warnings  
**Constraints**: Preserve existing routes/behaviors; no frontend secrets; environment handling must remain compatible; avoid regressions in query caching/error handling  
**Scale/Scope**: Single frontend app with four primary pages; upgrade only (no new features)

## Constitution Check

*Gate status: PASS (no violations planned).*

- P1 Security & Privacy: No secrets in frontend; upgrade must keep server-minted tokens and env handling intact.  
- P2 Realtime Experience: WebRTC/audio flows must not regress (ensure any client hooks remain functional post-upgrade).  
- P3 Reliability & Data Integrity: No data-path changes; builds/tests must stay deterministic.  
- P4 Architecture Boundaries: Frontend-only change; backend ownership unchanged.  
- P5 Product Scope Discipline: Upgrade-only; no scope creep beyond parity and perf guardrails.  
- P6 Testing & Quality: Maintain build/test parity; add smoke/integration checks for routes and queries.  
- P7 Observability & Maintainability: Keep logging/monitoring behavior unchanged; document upgrade notes.

## Project Structure

### Documentation (this feature)

```text
specs/003-nextjs-tanstack-upgrade/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
backend/
├── src/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── index.css
└── tests/
```

**Structure Decision**: Web app with separate frontend directory; backend untouched by this upgrade. Work is confined to `frontend/` plus feature docs under `specs/003-nextjs-tanstack-upgrade/`.

## Complexity Tracking

No constitution violations or extra complexity beyond standard upgrade.
