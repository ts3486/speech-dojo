# Feature Specification: Preset Topics

**Feature Branch**: `004-preset-topics`
**Created**: 2026-02-21
**Status**: Draft

**Constitution Hooks**: No new security surface (system_prompt is not a secret); sessions remain private by default; backwards-compatible API change; no new endpoints; existing tests updated to pass.

## User Scenarios & Testing

### User Story 1 — Solo topics visible on home page (P1)

Learner sees 3 solo practice topics and can tap one to start a coached monologue session.

**Acceptance Scenarios**:
1. **Given** the server has started, **When** home page loads, **Then** Solo section shows "Introduce Yourself", "Describe Your Ideal Day", "Talk About a Hobby" with no "Coming soon" tiles.
2. **Given** a solo tile is clicked, **When** navigation occurs, **Then** URL contains `topicId`, `topicTitle`, `mode=solo`, and `systemPrompt=<coaching prompt>`.

### User Story 2 — Interactive topics visible on home page (P1)

Learner sees 3 interactive topics and can tap one to start a conversational session with an AI role-player.

**Acceptance Scenarios**:
1. **Given** the server has started, **When** home page loads, **Then** Interactive section shows "Job Interview Practice", "Small Talk at a Party", "Asking for Directions".
2. **Given** an interactive tile is clicked, **When** navigation occurs, **Then** URL contains `mode=interactive` and the role-play system prompt.

### User Story 3 — Session page receives mode and system prompt (P2)

Session page correctly reads and stores `mode` and `systemPrompt` from URL for future realtime use.

**Acceptance Scenarios**:
1. **Given** navigation with `mode=solo&systemPrompt=…`, **When** session page mounts, **Then** `mode` state is `"solo"` and `systemPrompt` is non-null.
2. **Given** navigation with `mode=interactive`, **When** debug log is open, **Then** log shows `Session mode: interactive`.

### Edge Cases
- Fresh DB: migration + startup seed ensures topics present before first request.
- Server restart with existing rows: upsert converges to current prompt values.
- Direct navigation to `/session` without query params: mode defaults to `"solo"`, systemPrompt to `null`; session starts normally.

## Requirements

- **FR-001**: Add `category TEXT` and `system_prompt TEXT` columns to `topics` table via migration `002_`.
- **FR-002**: Seed 6 preset topics at server startup (idempotent upsert on `title`).
- **FR-003**: `GET /api/topics` response includes `category` and `system_prompt` per topic (no API change needed; struct serialisation is automatic).
- **FR-004**: Home page filters topics by `category` field, not array index.
- **FR-005**: Navigating from a topic tile passes `mode` and `systemPrompt` as URL search params.
- **FR-006**: Session page reads `mode` and `systemPrompt` from URL and stores in component state.

## Success Criteria

- **SC-001**: `GET /api/topics` returns exactly 6 topics with non-null `category` and `system_prompt`.
- **SC-002**: Home page shows 3 solo + 3 interactive tiles, zero "Coming soon".
- **SC-003**: Topic tile click produces correct URL params (verifiable in browser address bar).
- **SC-004**: Session page `mode` and `systemPrompt` state correct on mount.
- **SC-005**: `cargo test` passes with updated `insert_topic` helper.
- **SC-006**: Seeding twice leaves exactly 6 rows (idempotency).
