---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests for core flows are REQUIRED (Vitest on frontend; backend unit + integration). Only omit if the spec explicitly defers and the exception is documented.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Constitution Hooks**: Include tasks for security/privacy (no frontend secrets; sessions private by default with delete/export), realtime resilience (WebRTC path, token expiry, mic/network failure handling), reliability (persist audio/transcripts even if rating fails), architecture boundaries (frontend owns UI/audio/WebRTC/transcripts/history; backend owns auth/topics/persistence/uploads/rating/OpenAI), observability (PII-safe logging), testing discipline, and MVP scope (topic → voice session → transcript → history unless explicitly expanded).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Monorepo layout (must match plan.md):
  - `backend/src/`, `backend/tests/` (Rust Axum API, DB, OpenAI client-secret minting)
  - `frontend/src/`, `frontend/tests/` (React + Tailwind + Vitest)
  - `specs/[feature]/` (spec artifacts)
  - `.specify/` (Spec Kit templates/config)

<!-- 
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.
  
  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/
  
  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment
  
  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Confirm monorepo structure (frontend/, backend/, specs/, .specify/) matches plan.md
- [ ] T002 Initialize frontend tooling (React + Tailwind + Vitest) per plan.md
- [ ] T003 Initialize backend workspace/dependencies (Rust + Axum + test harness)
- [ ] T004 [P] Configure linting/formatting tools (frontend + backend)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T005 Setup database schema and migrations framework
- [ ] T006 [P] Implement authentication/authorization framework
- [ ] T007 [P] Setup API routing and middleware structure in backend (Axum)
- [ ] T008 Create base models/entities that all stories depend on
- [ ] T009 Configure PII-safe error handling and logging infrastructure
- [ ] T010 Setup environment configuration management and secrets handling
- [ ] T011 Implement backend OpenAI client-secret minting (no API keys in frontend)
- [ ] T012 Establish session persistence for audio/transcripts with idempotent create/finalize paths

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (core flows REQUIRED)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T013 [P] [US1] Contract test for [endpoint] in backend/tests/contract/[name]_test.rs
- [ ] T014 [P] [US1] Integration test for [user journey] in backend/tests/integration/[name]_test.rs (or frontend/tests/integration/[name].spec.ts)

### Implementation for User Story 1

- [ ] T015 [P] [US1] Create backend model/domain types in backend/src/models/[entity].rs
- [ ] T016 [US1] Implement backend service/handler in backend/src/services/[service].rs
- [ ] T017 [US1] Implement API route in backend/src/api/[path].rs (depends on T015, T016)
- [ ] T018 [US1] Implement frontend flow/components in frontend/src/[location]/[file].tsx
- [ ] T019 [US1] Add validation and error handling (frontend + backend)
- [ ] T020 [US1] Add logging/tracing for user story 1 operations with PII-safe redaction

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (core flows REQUIRED)

- [ ] T021 [P] [US2] Contract test for [endpoint] in backend/tests/contract/[name]_test.rs
- [ ] T022 [P] [US2] Integration/E2E test for [user journey] in frontend/tests/integration/[name].spec.ts or backend/tests/integration/[name]_test.rs

### Implementation for User Story 2

- [ ] T023 [P] [US2] Create backend model/domain types in backend/src/models/[entity].rs
- [ ] T024 [US2] Implement backend service/handler in backend/src/services/[service].rs
- [ ] T025 [US2] Implement API route or worker in backend/src/api/[path].rs or backend/src/workers/[name].rs
- [ ] T026 [US2] Integrate with User Story 1 components (frontend/backend) while keeping stories independently testable

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (core flows REQUIRED)

- [ ] T027 [P] [US3] Contract test for [endpoint] in backend/tests/contract/[name]_test.rs
- [ ] T028 [P] [US3] Integration/E2E test for [user journey] in frontend/tests/integration/[name].spec.ts or backend/tests/integration/[name]_test.rs

### Implementation for User Story 3

- [ ] T029 [P] [US3] Create backend model/domain types in backend/src/models/[entity].rs
- [ ] T030 [US3] Implement backend service/handler in backend/src/services/[service].rs
- [ ] T031 [US3] Implement API route or worker in backend/src/api/[path].rs or backend/src/workers/[name].rs
- [ ] T032 [US3] Implement frontend flow/components in frontend/src/[location]/[file].tsx (if applicable)

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization across all stories
- [ ] TXXX [P] Additional unit tests (beyond core coverage) in tests/unit/
- [ ] TXXX Security hardening
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all core tests for User Story 1 together:
Task: "Contract test for [endpoint] in backend/tests/contract/[name]_test.rs"
Task: "Integration/E2E test for [user journey] in frontend/tests/integration/[name].spec.ts"

# Launch all models for User Story 1 together:
Task: "Create [Entity1] model in backend/src/models/[entity1].rs"
Task: "Create [Entity2] model in backend/src/models/[entity2].rs"
```

---

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

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
