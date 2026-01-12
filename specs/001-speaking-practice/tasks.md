---

description: "Task list for realtime speaking practice feature"
---

# Tasks: Realtime Speaking Practice

**Input**: Design documents from `/specs/001-speaking-practice/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests for core flows are REQUIRED (Vitest on frontend; backend unit + integration). Only omit if the spec explicitly defers and the exception is documented.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Constitution Hooks**: Include tasks for security/privacy (no frontend secrets; sessions private by default with delete/export), realtime resilience (WebRTC path, token expiry, mic/network failure handling), reliability (persist audio/transcripts even if rating fails), architecture boundaries (frontend owns UI/audio/WebRTC/transcripts/history; backend owns auth/topics/persistence/uploads/rating/OpenAI), observability (PII-safe logging), testing discipline, and MVP scope (topic → voice session → transcript → history unless explicitly expanded).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Monorepo layout:
  - `backend/src/`, `backend/tests/` (Rust Axum API, DB, OpenAI client-secret minting)
  - `frontend/src/`, `frontend/tests/` (React + Tailwind + Vitest)
  - `specs/[feature]/` (spec artifacts)
  - `.specify/` (Spec Kit templates/config)

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Create backend/.env.example with `DATABASE_URL`, `S3_BUCKET`, `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `OPENAI_SECRET_KEY` (backend/.env.example)
- [X] T002 Create frontend/.env.example with `VITE_API_BASE_URL` and realtime toggles (frontend/.env.example)
- [X] T003 [P] Add seed topics fixture for predefined prompts (backend/fixtures/topics.json)
- [X] T004 [P] Document setup steps in quickstart (specs/001-speaking-practice/quickstart.md)

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T005 Create Postgres migrations for topics/sessions/transcripts/client_secrets/audio_recordings (backend/migrations/001_init.sql)
- [X] T006 [P] Implement DB models and queries for Topic/Session/Transcript/ClientSecret/AudioRecording (backend/src/models)
- [X] T007 [P] Configure S3 client and bucket wiring for audio uploads (backend/src/services/storage.rs)
- [X] T008 [P] Configure tracing/logging with PII redaction for session endpoints (backend/src/main.rs)
- [X] T009 Add auth guard/middleware ensuring owner-only access to session routes (backend/src/api/mod.rs)
- [X] T010 [P] Implement topics seeding command using fixture (backend/src/bin/seed_topics.rs)
- [X] T011 Set up frontend realtime service scaffold for client-secret flow (frontend/src/services/realtime.ts)

## Phase 3: User Story 1 - Guided speaking session (Priority: P1) 🎯 MVP

**Goal**: User selects a topic and completes a realtime voice coaching session with live status and saved transcript/audio.

**Independent Test**: Start with a topic, grant mic, run 2–5 minute session, end, and see transcript confirmation without needing history.

### Tests for User Story 1 (core flows REQUIRED)

- [ ] T012 [P] [US1] Contract test for POST /api/sessions create (backend/tests/contract/sessions_create.rs)
- [ ] T013 [P] [US1] Contract test for POST /api/realtime/session client secret issuance (backend/tests/contract/realtime_session.rs)
- [ ] T014 [US1] Integration test for session start/end + transcript display (frontend/tests/integration/session.spec.ts)

### Implementation for User Story 1

- [ ] T015 [P] [US1] Implement GET /api/topics handler (backend/src/api/topics.rs)
- [ ] T016 [US1] Implement POST /api/sessions create handler (backend/src/api/sessions/create.rs)
- [ ] T017 [US1] Implement POST /api/realtime/session to mint short-lived client secrets (backend/src/api/realtime/session.rs)
- [ ] T018 [US1] Implement POST /api/sessions/{id}/finalize to persist transcript/metadata idempotently (backend/src/api/sessions/finalize.rs)
- [ ] T019 [P] [US1] Implement POST /api/sessions/{id}/upload to store audio in S3 and return URL (backend/src/api/sessions/upload.rs)
- [ ] T020 [US1] Add session lifecycle service (create/finalize/idempotency) (backend/src/services/sessions.rs)
- [ ] T021 [P] [US1] Build topic selection and session start page with live status (frontend/src/pages/session.tsx)
- [ ] T022 [P] [US1] Implement mic permission handling and error banners (frontend/src/services/mic.ts)
- [ ] T023 [P] [US1] Implement WebRTC client using minted client secret and status callbacks (frontend/src/services/realtime.ts)
- [ ] T024 [P] [US1] Implement MediaRecorder capture and upload to backend on end (frontend/src/services/recorder.ts)
- [ ] T025 [US1] Render transcript after finalize with duration + success state (frontend/src/components/TranscriptView.tsx)
- [ ] T026 [US1] Add PII-safe logging/tracing around session start/end/finalize (backend/src/telemetry/mod.rs)
- [ ] T027 [US1] Wire finalize/upload calls into session UI flow with success/error states (frontend/src/pages/session.tsx)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

## Phase 4: User Story 2 - Session history & replay (Priority: P2)

**Goal**: User views private session history, opens a session, reads transcript, and replays audio.

**Independent Test**: With saved sessions, user opens history, sees entries, opens one, reads transcript, and plays audio without starting new session.

### Tests for User Story 2 (core flows REQUIRED)

- [ ] T028 [P] [US2] Contract test for GET /api/sessions list + GET /api/sessions/{id} detail (backend/tests/contract/sessions_get.rs)
- [ ] T029 [P] [US2] Contract test for DELETE /api/sessions/{id} (backend/tests/contract/sessions_delete.rs)
- [ ] T030 [US2] Integration test for history list/detail/replay flow (frontend/tests/integration/history.spec.ts)

### Implementation for User Story 2

- [ ] T031 [US2] Implement GET /api/sessions (history list, newest first, owner-only) (backend/src/api/sessions/list.rs)
- [ ] T032 [US2] Implement GET /api/sessions/{id} with transcript and audio reference (backend/src/api/sessions/detail.rs)
- [ ] T033 [US2] Implement DELETE /api/sessions/{id} with owner check and tombstone/removal (backend/src/api/sessions/delete.rs)
- [ ] T034 [US2] Add history projection/query helper (backend/src/services/history.rs)
- [ ] T035 [US2] Build history page with empty-state messaging (frontend/src/pages/history.tsx)
- [ ] T036 [US2] Build session detail page with transcript view and audio player controls (frontend/src/pages/session-detail.tsx)
- [ ] T037 [P] [US2] Add delete action with confirmation and optimistic UI (frontend/src/components/SessionActions.tsx)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

## Phase 5: User Story 3 - Resilient session handling (Priority: P3)

**Goal**: User can recover from network/mic/token failures without losing captured audio/transcript.

**Independent Test**: Simulate connection loss or permission revocation; user can retry or end and still see saved transcript/audio.

### Tests for User Story 3 (core flows REQUIRED)

- [ ] T038 [P] [US3] Integration test simulating network drop/retry and end-and-save (frontend/tests/integration/resilience.spec.ts)
- [ ] T039 [P] [US3] Backend integration test for client-secret refresh/expiry handling (backend/tests/integration/realtime_refresh.rs)
- [ ] T040 [P] [US3] Frontend test for mic denial/recovery flow (frontend/tests/integration/mic-permissions.spec.ts)

### Implementation for User Story 3

- [ ] T041 [US3] Implement client-secret refresh/retry logic with fallback to end-and-save (frontend/src/services/realtime.ts)
- [ ] T042 [US3] Support client-secret renewal and session status updates server-side (backend/src/api/realtime/session.rs)
- [ ] T043 [US3] Handle offline/network-drop recovery and graceful end in session page (frontend/src/pages/session.tsx)
- [ ] T044 [US3] Add user-facing error banners and retry/end controls for mic/network/token issues (frontend/src/components/SessionAlerts.tsx)
- [ ] T045 [US3] Ensure finalize path preserves partial transcripts and is idempotent on retries (backend/src/services/sessions.rs)
- [ ] T046 [US3] Add PII-safe tracing for failure scenarios (backend/src/telemetry/mod.rs)

**Checkpoint**: All user stories should now be independently functional.

## Phase N: Polish & Cross-Cutting Concerns

- [ ] T047 [P] Add frontend metrics hooks for first-response and audio-load timings (frontend/src/services/metrics.ts)
- [ ] T048 [P] Add audit/log events for session delete/start/end with redaction (backend/src/telemetry/mod.rs)
- [ ] T049 Validate quickstart steps end-to-end and update notes (specs/001-speaking-practice/quickstart.md)
- [ ] T050 [P] Accessibility and UX polish for session, history, and transcript views (frontend/src/components)

## Dependencies & Execution Order

- Foundational (Phase 2) blocks all user stories.  
- User Story order: US1 → US2 → US3 (US2 depends on saved sessions from US1; US3 builds on session runtime from US1).

## Parallel Example: User Story 1

```bash
# Launch all core tests for User Story 1 together:
Task: "Contract test for POST /api/sessions create (backend/tests/contract/sessions_create.rs)"
Task: "Contract test for POST /api/realtime/session client secret issuance (backend/tests/contract/realtime_session.rs)"
Task: "Integration test for session start/end + transcript display (frontend/tests/integration/session.spec.ts)"

# Launch all models/services for User Story 1 together:
Task: "Implement POST /api/sessions create handler (backend/src/api/sessions/create.rs)"
Task: "Implement session lifecycle service (backend/src/services/sessions.rs)"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup  
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)  
3. Complete Phase 3: User Story 1  
4. **STOP and VALIDATE**: Test User Story 1 independently  
5. Deploy/demo if ready  

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready  
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)  
3. Add User Story 2 → Test independently → Deploy/Demo  
4. Add User Story 3 → Test independently → Deploy/Demo  
5. Each story adds value without breaking previous stories  

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together  
2. Once Foundational is done:  
   - Developer A: User Story 1  
   - Developer B: User Story 2  
   - Developer C: User Story 3  
3. Stories complete and integrate independently  

## Notes

- [P] tasks = different files, no dependencies  
- [Story] label maps task to specific user story for traceability  
- Each user story should be independently completable and testable  
- Verify tests fail before implementing  
- Commit after each task or logical group  
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence  
