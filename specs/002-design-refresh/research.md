# Research: Design Refresh (Product-wide)

## Decisions

### Design system & tokens
- **Decision**: Use warm neutral base (#f8f6f1), amber primary (#f4a261), teal secondary (#2a9d8f), charcoal text (#1f1f1f), 8px radius, soft shadows; typography Sora (headings) and Inter (body).
- **Rationale**: Supports calm coaching feel, clear hierarchy, and AA+ contrast with minimal complexity.
- **Alternatives considered**: Gradient-heavy or dark theme; rejected to keep clarity and reduce rework.

### Layout & navigation
- **Decision**: Max width 1100px, 24px gutters; breakpoints at 640/900/1200; two-column session layout (controls/status left, transcript/alerts/log right); card-based history/detail; accessible header/nav.
- **Rationale**: Mirrors core flows and keeps resilience controls visible while responsive to mobile.
- **Alternatives considered**: Single-column desktop and modal-heavy flows; rejected to avoid burying retry actions and to improve scanability.

### Components & accessibility
- **Decision**: Standardize Button, StatusChip, Card, AlertStack, StatusBar, TranscriptList styling; enforce `:focus-visible`, skip-to-main, ARIA on alerts/status/audio/transcript; avoid color-only signals; light motion (150–200ms fade/slide).
- **Rationale**: Ensures consistency and accessibility across pages; keeps interactions stable for realtime UX.
- **Alternatives considered**: Ad-hoc per-page styling or heavier animations; rejected for maintainability and to avoid distraction.

### Backend/API scope
- **Decision**: No new endpoints or entities; reuse existing session/topic/history APIs; backend changes limited to regression testing/telemetry if needed.
- **Rationale**: Redesign is UI-focused; avoids risk to stable contracts.
- **Alternatives considered**: Adding API changes for design-only needs; rejected to maintain stability and constitution boundaries.
