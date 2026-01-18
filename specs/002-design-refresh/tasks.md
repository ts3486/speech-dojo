---

description: "Task list for Speech Dojo product-wide design refresh"
---

# Tasks: Design Refresh (Product-wide)

**Input**: Design documents from `/specs/002-design-refresh/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests for core flows are REQUIRED (Vitest on frontend; backend regression only). Only omit if the spec explicitly defers and the exception is documented.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

**Constitution Hooks**: Security/privacy (no frontend secrets; private-by-default sessions; delete/export), realtime resilience (WebRTC path, mic/network/token handling), reliability (idempotent finalize, transcript/audio retention), architecture boundaries (frontend owns UI/audio/WebRTC/history; backend owns auth/persistence/uploads/OpenAI), observability (PII-safe logging), testing discipline, accessibility (AA+ contrast, focus-visible).

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish base theme assets and entry shell for the redesign.

- [X] T001 Add Sora/Inter font imports and design token CSS variables (colors/radius/shadow/focus) in `frontend/src/style.css` **(updated: Tailwind tokens in `frontend/tailwind.config.cjs` + base in `frontend/src/index.css`)**
- [X] T002 Wire theme tokens into Tailwind/Vite config (if used) in `frontend/tailwind.config.*` or `frontend/src/style.css` **(using Tailwind config in `frontend/tailwind.config.cjs`)**
- [X] T003 Add skip-to-main anchor and base layout container (max-width/gutters) in `frontend/src/main.tsx` and `frontend/src/style.css` **(base now in `frontend/src/index.css`)**
- [X] T004 Document token usage references in `specs/002-design-refresh/spec.md` and `specs/002-design-refresh/design.md` (link to CSS variables)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared UI components and accessibility primitives used across stories.

- [X] T005 Create reusable Button/LinkButton components per tokens in `frontend/src/components/ui/Button.tsx`
- [X] T006 [P] Create StatusChip and Card components with variants (active/recovering/error) in `frontend/src/components/ui/StatusChip.tsx` and `frontend/src/components/ui/Card.tsx`
- [X] T007 [P] Implement AlertStack with role/ARIA and inline actions in `frontend/src/components/AlertStack.tsx`
- [X] T008 Implement StatusBar component for connection/mic/token states in `frontend/src/components/StatusBar.tsx`
- [X] T009 Add global accessibility utilities (`:focus-visible`, skip link styles, base typography) in `frontend/src/style.css` **(now in `frontend/src/index.css` via Tailwind base/components)**

**Checkpoint**: Foundation ready - user story work can proceed.

---

## Phase 3: User Story 1 - App shell & navigation (Priority: P1) 🎯 MVP

**Goal**: Refreshed header/nav with consistent theming and keyboard accessibility.

**Independent Test**: Keyboard-only user can tab through header/nav, activate Session/History routes, and see consistent shell styling without layout jumps.

### Tests for User Story 1 (core flows REQUIRED)

- [X] T010 [P] [US1] Add navigation accessibility/component test in `frontend/tests/components/header-nav.spec.tsx` (focus-visible, active state)
- [X] T011 [P] [US1] Add integration test for shell routing (Session/History) in `frontend/tests/integration/nav.spec.tsx`

### Implementation for User Story 1

- [X] T012 [US1] Build styled header/nav with brand and links in `frontend/src/main.tsx` (or layout component)
- [X] T013 [P] [US1] Apply responsive shell layout (max width, gutters, sticky header) in `frontend/src/style.css` **(now Tailwind base/utilities)**
- [X] T014 [US1] Ensure focus-visible states and aria-current on active nav links in `frontend/src/main.tsx`

**Checkpoint**: US1 shell accessible and themed.

---

## Phase 4: User Story 2 - Realtime session experience (Priority: P1)

**Goal**: Two-column session layout with status bar, alerts, Start/End controls, timer, transcript, and log.

**Independent Test**: User can start/end a session; status bar reflects states; alerts show for mic/network/token issues with inline retry/end; transcript renders with speaker pills and alternating rows.

### Tests for User Story 2 (core flows REQUIRED)

- [X] T015 [P] [US2] Update session integration test for redesigned UI (status bar, alerts, transcript rows) in `frontend/tests/integration/session.spec.tsx`
- [X] T016 [P] [US2] Add component test for StatusBar/AlertStack rendering states in `frontend/tests/components/status-bar.spec.tsx`

### Implementation for User Story 2

- [X] T017 [US2] Apply two-column responsive layout to session page in `frontend/src/pages/session.tsx` and `frontend/src/style.css` **(layout via Tailwind classes/base)** 
- [X] T018 [P] [US2] Integrate StatusBar with mic/network/token states in `frontend/src/pages/session.tsx`
- [X] T019 [P] [US2] Style AlertStack inline actions (retry/end) in `frontend/src/components/AlertStack.tsx`
- [X] T020 [US2] Style Start/End controls, timer, topic picker, and debug log per tokens in `frontend/src/pages/session.tsx`
- [X] T021 [US2] Style TranscriptView with speaker pills/timestamps and alternating rows in `frontend/src/components/TranscriptView.tsx`
- [X] T022 [US2] Add ARIA labels and focus management for session controls/alerts in `frontend/src/pages/session.tsx`

**Checkpoint**: US2 session UX redesigned and testable independently.

---

## Phase 5: User Story 3 - History & session detail (Priority: P2)

**Goal**: History cards and session detail with status chips, empty state, audio player, and transcript styling.

**Independent Test**: With saved sessions, history cards show topic/time/duration/status chips; empty state appears when none exist; session detail shows audio player + transcript with ARIA labels.

### Tests for User Story 3 (core flows REQUIRED)

- [X] T023 [P] [US3] Update history integration test for cards/empty state in `frontend/tests/integration/history.spec.tsx`
- [X] T024 [P] [US3] Add component test for session detail layout (audio + transcript rows) in `frontend/tests/components/session-detail.spec.tsx`

### Implementation for User Story 3

- [X] T025 [US3] Redesign history list with cards/status chips/CTA empty state in `frontend/src/pages/history.tsx`
- [X] T026 [P] [US3] Style action buttons (Open/Delete) and confirmations per tokens in `frontend/src/pages/history.tsx`
- [X] T027 [US3] Redesign session detail with prominent audio player and alternating transcript rows in `frontend/src/pages/session-detail.tsx`
- [X] T028 [US3] Add ARIA labels for audio controls and status chips in `frontend/src/pages/session-detail.tsx`

**Checkpoint**: US3 history/detail redesigned and testable independently.

---

## Phase 6: User Story 4 - Design system & accessibility (Priority: P2)

**Goal**: Ensure tokens/components/accessibility primitives are defined, applied, and validated across pages.

**Independent Test**: Tokens consumed in components; focus-visible and skip-to-main work; AA+ contrast holds; components render consistently in tests.

### Tests for User Story 4 (core flows REQUIRED)

- [X] T029 [P] [US4] Add component test snapshot for tokens applied to UI kit (Button/StatusChip/Card) in `frontend/tests/components/ui-kit.spec.tsx`
- [X] T030 [P] [US4] Add accessibility-focused test for skip link and focus-visible in `frontend/tests/integration/a11y.spec.tsx`

### Implementation for User Story 4

- [X] T031 [US4] Verify token consumption across components (no hard-coded colors/spacing) in `frontend/src/components/**` and `frontend/src/style.css` **(now Tailwind theme + utilities)**
- [X] T032 [P] [US4] Add skip-to-main and focus-visible handling to all page templates in `frontend/src/pages/*.tsx`
- [X] T033 [US4] Document accessibility and token usage in `specs/002-design-refresh/design.md` and `quickstart.md`

**Checkpoint**: US4 design system and accessibility applied and testable.

---

## Phase N: Polish & Cross-Cutting Concerns

- [ ] T034 [P] Run AA contrast sweep and fix violations in `frontend/src/index.css` (Tailwind base)
- [ ] T035 [P] Capture updated screenshots/visual notes in `specs/002-design-refresh/design.md`
- [ ] T036 Validate quickstart instructions end-to-end (dev server + tests) in `specs/002-design-refresh/quickstart.md`
- [ ] T037 Final regression: `pnpm test` (frontend) and `cargo test` (backend) with results noted in `specs/002-design-refresh/tasks.md`

---

## Dependencies & Execution Order

- Foundational (Phase 2) depends on Setup (Phase 1) and blocks all stories.
- User stories: US1 (shell) and US2 (session) are P1; complete US1/US2 before US3/US4 (P2). US3 and US4 can run in parallel after Phase 2 if staffed.
- Polish runs after desired stories complete.

## Parallel Execution Examples

- After T017 scaffold, T018 (StatusBar) and T019 (AlertStack) can run in parallel; T021 transcript styling can proceed independently.
- US3 history cards (T025/T026) can run parallel to US3 detail (T027/T028).
- US4 tests (T029/T030) can run parallel to token verification (T031) once UI kit exists.

## Implementation Strategy

- MVP: Setup + Foundational → US1 + US2 (shell + session) with tests. Validate accessibility and core flows.
- Incremental: Layer US3 (history/detail) and US4 (design system/a11y hardening) next.
- Testing discipline: Update/extend Vitest integration/component tests before or alongside UI changes; backend remains regression-only.
