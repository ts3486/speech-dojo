<!--
Sync Impact Report
Version change: N/A → 1.0.0
Modified principles:
- Non-negotiables list → P1 Security & Privacy, P2 Realtime Experience, P3 Reliability & Data Integrity, P4 Architecture Boundaries, P5 Product Scope Discipline, P6 Testing & Quality, P7 Observability & Maintainability
Added sections:
- Governance rules populated
Removed sections:
- None
Templates requiring updates:
- ✅ .specify/templates/plan-template.md
- ✅ .specify/templates/spec-template.md
- ✅ .specify/templates/tasks-template.md
Follow-up TODOs:
- None
-->
# Speech Dojo Constitution

## Core Principles

### P1. Security & Privacy
- OpenAI API keys MUST never be exposed to the browser; the Rust backend mints short-lived client secrets.
- Sessions default to private; publishing requires explicit user action and consent.
- Users MUST be able to delete or export their sessions and data without backend overrides.
- Backend services and logs MUST avoid storing sensitive content; data retention follows least-privilege.
**Rationale**: Protect user trust and prevent credential leakage.

### P2. Realtime Experience
- Voice interactions MUST use WebRTC for browser sessions unless a justified fallback is documented.
- Latency-sensitive paths SHOULD prioritize low-overhead codecs and minimal server hops.
- Network interruptions MUST be handled gracefully so sessions can end and save without data loss.
**Rationale**: The product value depends on conversational, low-latency feedback.

### P3. Reliability & Data Integrity
- Audio recordings and transcripts MUST be persisted even if AI rating or post-processing fails.
- Session creation, finalization, and storage MUST be idempotent.
- Partial transcripts MUST NOT overwrite finalized transcripts.
**Rationale**: Users need trustworthy records of every coaching session.

### P4. Architecture Boundaries
- Monorepo layout: frontend/ (React + Tailwind + Vitest), backend/ (Rust Axum API, DB, OpenAI token mint), specs/ (feature specs), .specify/ (Spec Kit config/templates).
- Frontend owns UI state, audio capture, WebRTC connection to OpenAI Realtime, and rendering transcripts/history.
- Backend owns authentication, topics, session persistence, file uploads, rating workers, and OpenAI integration.
- Business logic MUST NOT leak into the frontend; the backend mints all OpenAI client secrets.
**Rationale**: Clear ownership prevents coupling and keeps secrets server-side.

### P5. Product Scope Discipline
- MVP path: topic selection → voice session → transcript → history (rating optional but preferred).
- Social features, payments, and advanced analytics are out of scope until core retention is validated.
- Avoid premature optimization; prefer iterative delivery with measurable user impact.
**Rationale**: Focus keeps the product shippable and learning-driven.

### P6. Testing & Quality
- Frontend uses Vitest for core UI and session-state coverage.
- Backend includes unit tests for services and integration tests for key APIs.
- Error states MUST be handled for mic permissions, network drops, and token expiration with user feedback.
**Rationale**: Quality gates ensure reliable coaching experiences.

### P7. Observability & Maintainability
- Log session lifecycle events and failures without storing sensitive user content.
- Errors MUST be actionable and traceable; avoid noisy or personal data in logs.
- Code favors clarity over cleverness to ease future changes.
**Rationale**: PII-safe observability enables fast diagnosis without privacy risk.

### Definition of Done
- Feature works end-to-end in a modern browser (Chrome/Safari).
- Acceptance criteria in the spec are satisfied.
- Security and privacy constraints are upheld.
- Deterministic acceptance checks pass; error states are covered.

## Governance

- This constitution governs delivery and review; deviations require a documented exception in the spec/plan with owner approval.
- Amendments require a PR, a semantic version bump, and updates to plan/spec/tasks templates when principles change.
- Compliance: Every PR/review includes a Constitution Check covering all principles and the Definition of Done.
- Versioning: MAJOR for breaking principle/governance changes; MINOR for new or expanded principles; PATCH for clarifications.
- Ratification: Maintainers record the ratification date at first adoption; last amended date updates on merged changes.
- Runtime guidance: /speckit.* commands and resulting artifacts MUST cite any intentional deviations.

**Version**: 1.0.0 | **Ratified**: 2026-01-11 | **Last Amended**: 2026-01-11
