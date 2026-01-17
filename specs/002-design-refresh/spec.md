# Product Specification: Design Refresh

**Feature Branch**: `002-design-refresh`  
**Created**: 2026-01-14  
**Status**: Draft  
**Scope**: Whole-product UI/UX refresh for Speech Dojo, covering shell/navigation, realtime session surfaces, history/detail, and shared design system.

**Constitution Hooks**: Preserve privacy (no frontend secrets; private-by-default sessions; delete/export), realtime resilience (WebRTC path, mic/network/token recovery), reliability (idempotent session finalization and transcript/audio retention), architecture boundaries (frontend owns UX/audio/WebRTC; backend owns auth/persistence/uploads/OpenAI), testing discipline, and PII-safe observability. Accessibility (AA+ contrast, focus-visible) is elevated as a first-class constraint for the redesign.

## Design Direction (UI)

- **Theme**: Calm coaching; warm neutral base (#f8f6f1), deep charcoal text (#1f1f1f), amber primary (#f4a261, hover #e48f3e), teal secondary (#2a9d8f), danger (#c44536), subtle surfaces (#fffaf2), borders (#d8d3c8).
- **Typography**: Headings = Sora (700/600); Body = Inter (400/500). Base 16px; H1 28px, H2 22px, H3 18px; line-height 1.35/1.55.
- **Layout**: Max width 1100px, 24px gutters; 8px radius; soft shadow; focus ring 2px teal. Responsive breakpoints 640/900/1200; stack columns on mobile.
- **Interaction**: Inline alerts with actionable retries (network/mic/token), persistent status bar for session health, accessible audio controls, skip-to-main, `:focus-visible` everywhere. Motion is subtle (150–200ms fade/slide), no heavy animations.
- **Token source**: CSS variables and typography definitions live in `frontend/src/style.css`; UI kit hover/focus styles are injected via `frontend/src/components/ui/Button.tsx` (`ButtonStyles`). See `specs/002-design-refresh/design.md` for usage guidance.

## Wireframe Fit (Home → Session → History → Detail)

- **Home**: Top nav highlights Home; two sections: “Practice your speech” with three topic tiles, and “Practice with an agent” with three topic tiles. Tiles are large tappable cards that start a session (self-practice or agent) with the topic prefilled.
- **Session**: Nav highlights Session; heading reads `Topic: <name>`. Main area is a two-column layout: wide left panel for “Speech recording display” and narrower right column for “Conversation log/transcript.”
- **History**: Nav highlights History; heading “History” with a vertical list of wide row cards representing past sessions.
- **History Detail**: Nav highlights History; heading “History Detail” with a large detail panel for transcript/audio playback and metadata.

## User Scenarios & Testing *(mandatory)*

### User Story 0 - Home topic entry (Priority: P1)
User lands on Home, sees two groups of topic tiles (“Practice your speech” and “Practice with an agent”), and can start a session by choosing any tile.

**Independent Test**: Keyboard-only user can tab through all six tiles, activate one, and land on the Session page showing `Topic: <tile label>`.

### User Story 1 - App shell & navigation (Priority: P1)
User lands on the app, sees the refreshed header/nav, and can move between Session, History, and Session Detail routes with consistent theming and focus-visible navigation.

**Independent Test**: Keyboard-only user can tab through header/nav, activate Session and History routes, and see consistent shell styling without layout jumps.

### User Story 2 - Realtime session experience (Priority: P1)
User selects a topic, starts a session, and sees the redesigned two-column layout with status bar, alerts, Start/End controls, timer, transcript, and debug log. Layout matches the wireframe: large speech recording display on the left, conversation log/transcript on the right.

**Independent Test**: User can start/end a session; status bar reflects states; alerts appear for mic/network/token issues with inline retry/end actions; transcript renders with speaker pills and alternating rows.

### User Story 3 - History & session detail (Priority: P2)
User opens history, sees stacked row cards per wireframe with status chips and empty state, opens a session detail with styled audio player/transcript presentation.

**Independent Test**: With saved sessions, history cards show topic/time/duration/status chips; empty state appears when none exist; session detail shows audio player + transcript with alternating rows and ARIA labels.

### User Story 4 - Design system & accessibility (Priority: P2)
Design tokens, reusable components (buttons, chips, cards, alerts, status bar), and accessibility primitives are defined and applied across pages.

**Independent Test**: Tokens are consumed in components; focus-visible and skip-to-main work; contrast AA+; components render consistently in Storybook-style previews or unit/component tests.

### Edge Cases

- Offline or token expiry during session shows actionable alert and status bar change.
- Mic denial shows retry guidance and focusable action.
- Audio missing in session detail shows fallback message but transcript remains.
- History empty state provides clear CTA to start a session.
- Screen reader users can navigate alerts, status bar, audio controls, and transcript.

## Requirements *(mandatory)*

### Functional/Design Requirements

- **DR-001**: Implement app shell/header with nav links and brand using new theme; responsive and keyboard navigable.
- **DR-002**: Apply design tokens (colors, typography, radius, shadow, focus) globally via CSS/Tailwind variables.
- **DR-003**: Provide reusable UI components: Button, StatusChip, Card, AlertStack, StatusBar, TranscriptList styling.
- **DR-004**: Redesign session page (topic picker, status bar, alerts, Start/End controls, timer, transcript, debug log) per two-column layout: wide “Speech recording display” area left, “Conversation log/transcript” column right.
- **DR-005**: Redesign history list with stacked row cards (per wireframe), status chips, empty state illustration placeholder, and CTA.
- **DR-006**: Redesign session detail with prominent audio player, large transcript/detail panel, status chip, and alternating transcript rows; include ARIA labels and focus handling.
- **DR-007**: Accessibility: AA+ contrast, `:focus-visible`, skip-to-main, ARIA on alerts/status/audio/transcript; avoid color-only signals.
- **DR-008**: Maintain existing backend contracts and resilience behaviors; no secrets in frontend; respect privacy/delete.
- **DR-009**: Implement Home landing with two topic sections (“Practice your speech” and “Practice with an agent”), each with three large topic tiles; tiles are keyboard/touch activatable and route to Session with the chosen topic prefilled.

### Assumptions

- Existing backend APIs remain unchanged; redesign is UI/UX + accessibility.
- Design tokens can live in global CSS (Vite) and/or Tailwind config without ejecting.
- No dark theme required for this phase.

## Success Criteria *(mandatory)*

- **SC-001**: Navigation and primary flows are keyboard-accessible with visible focus states.
- **SC-002**: Contrast checks pass AA for text/buttons/chips/alerts.
- **SC-003**: Session page shows status bar + alerts with actionable retries for mic/network/token issues; Start/End controls usable on mobile/desktop.
- **SC-004**: History/detail pages render with new cards/audio/transcript styling; empty state is helpful.
- **SC-005**: Design tokens are centrally defined and referenced in components; no hard-coded ad-hoc colors/spacing outside tokens.
- **SC-006**: Home page shows two labeled topic sections with six accessible tiles; selecting a tile navigates to Session and displays the topic in the session header.

## Notes

- Keep feature-scoped artifacts under `specs/002-design-refresh/`; reference `specs/001-speaking-practice/` behavior where needed but do not change backend contracts.
- Tests remain Vitest (frontend) and cargo test (backend, regression only). No backend API changes expected.
