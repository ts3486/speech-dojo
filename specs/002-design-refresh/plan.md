# Implementation Plan: Design Refresh (Product-wide)

**Branch**: `002-design-refresh` | **Date**: 2026-01-14 | **Spec**: specs/002-design-refresh/spec.md  
**Input**: Feature specification from `/specs/002-design-refresh/spec.md`

**Note**: Generated via /speckit.plan. Aligns with constitution and product-wide redesign scope.

## Summary

Refresh the Speech Dojo UI/UX across app shell, session surfaces, history/detail, and shared design system. Apply the calm neutral/amber/teal theme, Sora/Inter typography, responsive layouts, and accessibility upgrades without changing backend contracts. Frontend (React/Vite/CSS/Tailwind) adopts tokens and reusable components; backend (Rust/Axum) remains stable (regression-only).

## Technical Context

**Language/Version**: Frontend TypeScript (React/Vite); Backend Rust (stable, Axum/Tokio)  
**Primary Dependencies**: React, Vite, Tailwind/CSS modules; existing OpenAI Realtime client-secret flow; Axum, SQLx, Chrono, UUID; S3 SDK (unchanged)  
**Storage**: PostgreSQL 15+ for topics/sessions/transcripts/client_secrets/audio_recordings; S3-compatible bucket for audio blobs (no change)  
**Testing**: Frontend Vitest (integration/component); Backend cargo test (regression)  
**Target Platform**: Modern browsers (Chrome/Safari) for UI; Linux server runtime for backend  
**Project Type**: Web monorepo (frontend + backend)  
**Performance Goals**: First response ≤3s P95; audio load ≤3s P95; smooth UI interactions with minimal layout shift  
**Constraints**: No OpenAI secrets in frontend; private-by-default sessions; WebRTC realtime path maintained; AA+ contrast, focus-visible, skip links; graceful mic/network/token recovery  
**Scale/Scope**: Product-wide UX refresh, no new backend entities/endpoints; reuse existing session/topic/history domain

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Security & Privacy: No OpenAI secrets in frontend; backend mints short-lived client secrets; sessions default private with delete/export paths; publishing is explicit opt-in.
- Realtime Experience: WebRTC-first voice path; latency goals defined; graceful handling for mic permission failures, network drops, and token expiry.
- Reliability & Data Integrity: Audio + transcripts persisted even if rating/post-processing fails; session creation/finalization is idempotent; partial transcripts cannot overwrite finalized transcripts.
- Architecture Boundaries: Monorepo layout honored; frontend only handles UI/audio/WebRTC/transcripts/history; backend owns auth, topics, session persistence, uploads, rating workers, and OpenAI integration; business logic stays server-side.
- Product Scope Discipline: Feature fits MVP path (topic → voice session → transcript → history); social/payments/advanced analytics called out as out-of-scope unless explicitly approved.
- Testing & Quality: Vitest coverage for core UI + session state; backend unit tests for services and integration tests for key APIs; user-facing error states covered.
- Observability & Maintainability: Session lifecycle logging without sensitive content; errors are actionable and traceable; code favors clarity over cleverness.

## Project Structure

### Documentation (this feature)

```text
specs/002-design-refresh/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   ├── models/
│   ├── services/
│   └── telemetry/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── style.css / theme tokens
└── tests/
```

**Structure Decision**: Web app monorepo with backend (Rust/Axum) and frontend (React/Vite/Tailwind/CSS), reusing existing domain; redesign is front-end focused with regression coverage on backend.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
