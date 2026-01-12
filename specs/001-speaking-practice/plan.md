# Implementation Plan: Realtime Speaking Practice

**Branch**: `001-speaking-practice` | **Date**: 2026-01-11 | **Spec**: specs/001-speaking-practice/spec.md
**Input**: Feature specification from `/specs/001-speaking-practice/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command and should stay aligned with the constitution.

## Summary

Deliver a browser-based speaking coach where users pick a predefined topic, run a realtime WebRTC voice session with an AI coach, and save audio, transcript, and metadata privately. Frontend (React + Tailwind) manages mic permissions, WebRTC to OpenAI Realtime via backend-minted client secrets, shows live status, and uploads the recording on end. Backend (Rust/Axum + Postgres + S3-compatible storage) provides topics, issues client secrets, stores session/transcript/audio metadata, and serves history and playback.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: Frontend TypeScript (React), Backend Rust (Axum, Tokio), Postgres 15+  
**Primary Dependencies**: React, Tailwind CSS, WebRTC, OpenAI Realtime (gpt-realtime-mini), Axum, SQLx (or equivalent), S3-compatible SDK  
**Storage**: PostgreSQL for topics/sessions/transcripts; S3-compatible object storage for audio (local dev bucket ok)  
**Testing**: Frontend Vitest; backend unit + integration tests (Rust)  
**Target Platform**: Modern browsers (Chrome/Safari) for users; Linux server runtime for backend  
**Project Type**: Web (frontend + backend monorepo)  
**Performance Goals**: First AI response ≤3s P95 after start; audio replay loads ≤3s P95; maintain realtime feel during 2–5 minute sessions  
**Constraints**: No OpenAI API keys in frontend; short-lived client secrets only; sessions private by default; must handle mic denial, token expiry, and network drops without data loss  
**Scale/Scope**: MVP scope: single-user coaching sessions with history/replay; social/payments/advanced ratings explicitly out-of-scope

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Security & Privacy: No OpenAI secrets in frontend; backend mints short-lived client secrets; sessions default private with delete/export paths; publishing is explicit opt-in.
- Realtime Experience: WebRTC-first voice path; latency goals defined; graceful handling for mic permission failures, network drops, and token expiry.
- Reliability & Data Integrity: Audio + transcripts persisted even if rating/post-processing fails; session creation/finalization is idempotent; partial transcripts cannot overwrite finalized transcripts.
- Architecture Boundaries: Monorepo layout honored; frontend only handles UI/audio/WebRTC/transcripts/history; backend owns auth, topics, session persistence, uploads, rating workers, and OpenAI integration; business logic stays server-side.
- Product Scope Discipline: Feature fits MVP path (topic → voice session → transcript → history); social/payments/advanced analytics called out as out-of-scope unless explicitly approved.
- Testing & Quality: Vitest coverage for core UI + session state; backend unit tests for services and integration tests for key APIs; user-facing error states covered.
- Observability & Maintainability: Session lifecycle logging without sensitive content; errors are actionable and traceable; code favors clarity over cleverness.

**Gate Status**: PASS (plan aligns with all principles; no exceptions requested).

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   ├── models/
│   ├── services/
│   └── workers/ (if needed for rating/async tasks)
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

specs/
├── 001-speaking-practice/
│   ├── spec.md
│   ├── plan.md
│   ├── research.md
│   ├── data-model.md
│   ├── quickstart.md
│   └── contracts/
└── ...
```

**Structure Decision**: Web app monorepo with frontend/ and backend/ as above; specs per feature in `specs/###-name/`

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
