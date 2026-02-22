# Tasks: Upgrade Next.js + TanStack

**Input**: spec.md for `/specs/003-nextjs-tanstack-upgrade/` (plan.md not available; tasks derived from spec + current repo structure)  
**Prerequisites**: spec.md (required for user stories); research.md, data-model.md, contracts/ currently unavailable  
**Tests**: Core build/nav/query flows must have coverage (Vitest/Playwright-style in `frontend/tests/` is acceptable). Add tests first where noted.

**Constitution Hooks**: Protect secrets (no frontend keys), keep behavior parity across Home/Session/History/Session Detail, ensure tests pass, and avoid regressions in performance or caching.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Capture baselines and inventory before upgrading

- [x] T001 Record current Next/TanStack (or equivalent) versions, scripts, and build outputs in `specs/003-nextjs-tanstack-upgrade/artifacts/baseline.md` using `frontend/package.json` and existing logs.
- [x] T002 Run clean `pnpm install && pnpm lint && pnpm test && pnpm build` in `frontend/`; append timings/errors to `specs/003-nextjs-tanstack-upgrade/artifacts/baseline.md`.
- [x] T003 [P] Map existing routes and navigation flows from `frontend/src/pages` and `frontend/src/App.tsx`; save to `specs/003-nextjs-tanstack-upgrade/artifacts/route-map.md`.
- [x] T004 [P] Inventory env/config sources (`frontend/.env*`, `frontend/postcss.config.cjs`, `frontend/tailwind.config.cjs`, any `next.config.js` placeholder) into `specs/003-nextjs-tanstack-upgrade/artifacts/config-inventory.md` to watch for compat changes.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Upgrade core tooling and configs that block all stories

- [x] T005 Upgrade Next.js/React/TypeScript/TanStack packages to latest stable in `frontend/package.json`; regenerate `frontend/pnpm-lock.yaml`.
- [x] T006 Update or create `frontend/next.config.js` with latest defaults (routing mode, images, basePath, output) matching pre-upgrade behavior.
- [x] T007 Align `frontend/tsconfig.json` with current Next recommendations (extends, module resolution, strictness, path aliases).
- [x] T008 Refresh lint/test/build scripts in `frontend/package.json` for upgraded Next commands (`next dev/build/start`) while keeping existing test runner wiring.
- [x] T009 Adjust `frontend/postcss.config.cjs` and `frontend/tailwind.config.cjs` for compatibility with upgraded Next/PostCSS/Tailwind pipeline.
- [x] T010 Create/refresh query provider bootstrap for TanStack latest in `frontend/src/providers/queryClient.tsx` and wire it in `frontend/src/pages/_app.tsx` (or equivalent global entry).
- [x] T011 Re-run `pnpm lint && pnpm test` to confirm foundational upgrades compile; log blockers in `specs/003-nextjs-tanstack-upgrade/artifacts/foundation.md`.

---

## Phase 3: User Story 1 - Builds and dev server still work (Priority: P1) 🎯 MVP

**Goal**: Dev/build/test commands succeed on clean install post-upgrade  
**Independent Test**: `pnpm install && pnpm build && pnpm test` complete without errors

### Tests for User Story 1

- [x] T012 [P] [US1] Add build/dev smoke test in `frontend/tests/build-smoke.spec.ts` to run `pnpm build` and assert success output.
- [x] T013 [P] [US1] Add checklist entry for CI build/lint/test in `specs/003-nextjs-tanstack-upgrade/checklists/build-parity.md`.

### Implementation for User Story 1

- [x] T014 [US1] Update `frontend/package.json` scripts to the upgraded Next workflow (dev/build/start/lint/test) and remove deprecated commands.
- [x] T015 [US1] Fix TypeScript/runtime breakages from the upgrade in `frontend/src/pages/_app.tsx` (or current root entry) ensuring global styles and QueryClient provider still load.
- [x] T016 [US1] Validate `pnpm dev` and `pnpm build` on clean install; capture results in `specs/003-nextjs-tanstack-upgrade/artifacts/post-upgrade.md`.

---

## Phase 4: User Story 2 - App routes and pages behave the same (Priority: P1)

**Goal**: Home, Session, History, Session Detail behave identically after upgrade  
**Independent Test**: Manual/automated walkthrough Home → Session → History → Session Detail shows parity

### Tests for User Story 2

- [x] T017 [P] [US2] Add navigation regression test covering Home → Session → History → Session Detail in `frontend/tests/integration/routes-parity.spec.ts`.
- [x] T018 [P] [US2] Add history detail parity test (happy/error states) in `frontend/tests/integration/history-detail-parity.spec.ts`.

### Implementation for User Story 2

- [x] T019 [US2] Update layout/navigation for upgraded Next Link behavior in `frontend/src/App.tsx` (or shared header) ensuring active state styles persist.
- [x] T020 [US2] Refresh Home page for upgraded data-fetch/render pipeline in `frontend/src/pages/home.tsx` without altering UI copy or flows.
- [x] T021 [US2] Refresh Session page to keep current flow and API usage in `frontend/src/pages/session.tsx`.
- [x] T022 [US2] Refresh History list page to preserve data loading, empty, and error states in `frontend/src/pages/history.tsx`.
- [x] T023 [US2] Refresh Session Detail page to preserve routing, data, and error handling in `frontend/src/pages/session-detail.tsx`.

---

## Phase 5: User Story 3 - TanStack queries and caching remain stable (Priority: P2)

**Goal**: Loading/error/cached states remain consistent with new TanStack version  
**Independent Test**: Query-dependent pages reuse cache/refetch as before; error handling unchanged

### Tests for User Story 3

- [x] T024 [P] [US3] Add query state regression tests (loading/error/success reuse) in `frontend/tests/integration/query-states.spec.ts`.

### Implementation for User Story 3

- [x] T025 [US3] Update QueryClient defaults (staleTime, retry, cacheTime) for TanStack latest in `frontend/src/providers/queryClient.tsx`.
- [x] T026 [US3] Migrate page-level query hooks to latest signatures and consistent keys in `frontend/src/pages/history.tsx` and `frontend/src/pages/session-detail.tsx`.
- [x] T027 [US3] Audit mutation/refetch logic in `frontend/src/services/*` for cache invalidation compatibility; summarize changes in `specs/003-nextjs-tanstack-upgrade/artifacts/query-notes.md`.

---

## Phase 6: User Story 4 - Performance and bundle sanity (Priority: P2)

**Goal**: Build times and bundle sizes stay within ±10% with no new critical warnings  
**Independent Test**: Post-upgrade build has no new critical warnings; bundle time/size within target

### Tests for User Story 4

- [ ] T028 [P] [US4] Capture post-upgrade build time and bundle stats (`next build --analyze` or similar) in `specs/003-nextjs-tanstack-upgrade/artifacts/perf-report.md`.

### Implementation for User Story 4

- [ ] T029 [US4] Enable/update Next build optimizations (swcMinify, modularizeImports, image/font settings) in `frontend/next.config.js`.
- [ ] T030 [US4] Remove unused deps/polyfills and stale imports to reduce bundle in `frontend/package.json` and `frontend/src/**/*.{ts,tsx}`.
- [ ] T031 [US4] Validate HMR/build performance in dev; apply code-splitting/dynamic imports where needed in `frontend/src/pages/_app.tsx` or `frontend/src/app/layout.tsx`, noting impacts in `specs/003-nextjs-tanstack-upgrade/artifacts/perf-report.md`.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T032 Document upgrade notes, breaking changes handled, and new commands in `specs/003-nextjs-tanstack-upgrade/upgrade-notes.md`.
- [ ] T033 [P] Clean lint/test configs for deprecated Next/TanStack rules in `frontend/.eslintrc` (or equivalent) and `frontend/tests/setup.ts`.
- [ ] T034 Align quickstart/docs with new scripts in `frontend/README.md` and `specs/003-nextjs-tanstack-upgrade/quickstart.md`.
- [ ] T035 Run final regression (lint/test/build + nav/query parity) and update `specs/003-nextjs-tanstack-upgrade/checklists/requirements.md` with outcomes.

---

## Dependencies & Execution Order

- Setup (Phase 1) → Foundational (Phase 2) → User Stories by priority (P1: US1, US2; then P2: US3, US4) → Polish.
- Within a story: tests before implementation; provider/config updates before page-level fixes.

## Parallel Opportunities

- Tasks marked [P] in Setup and Foundational can run concurrently (different files).
- US1/US2 can run in parallel after Foundational, provided shared layout changes coordinate.
- Test tasks within each story marked [P] can be written/executed in parallel.

## Implementation Strategy

1) Complete Setup + Foundational to stabilize the toolchain.  
2) Deliver MVP with US1 (build/dev) and US2 (route parity) validated.  
3) Add US3 (TanStack stability) and US4 (performance) once parity is proven.  
4) Finish with Polish and checklist updates.
