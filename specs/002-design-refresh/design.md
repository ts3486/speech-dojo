# Design Guide: Product Design Refresh (002)

Source of truth for visual and interaction patterns for the redesign. Keep aligned with constitution hooks (privacy, realtime resilience, AA accessibility) and the spec user stories.

## Theme & Tokens

- **Token source**: CSS custom properties live in `frontend/src/style.css` (colors, radius, shadow, focus, typography). UI kit styles are injected via `frontend/src/components/ui/Button.tsx` (`ButtonStyles`).
- **Palette**:
  - Background: #f8f6f1
  - Surface: #fffaf2
  - Text: #1f1f1f
  - Primary (actions): #f4a261 (hover: #e48f3e)
  - Secondary/Success: #2a9d8f
  - Danger: #c44536
  - Borders/Lines: #d8d3c8
  - Muted text: #5c5c5c
- **Typography**: Headings → Sora (700/600); Body → Inter (400/500). Base 16px; H1 28px, H2 22px, H3 18px. Line-height: headings 1.35, body 1.55.
- **Radius & Shadows**: 8px corners; soft shadow `0 10px 30px rgba(0,0,0,0.06)`.
- **Focus**: 2px teal glow (#2a9d8f) via `:focus-visible` only; see `style.css`.
- **Spacing**: 8px unit; page gutters 24px; max content width 1100px centered.
- **Motion**: 150–200ms ease for hover/focus; fade-slide in alerts/cards; avoid heavy animations.

## Layout Patterns

- **Shell**: Centered column with header (brand + nav links Session/History), sticky header, max-width 1100px with 24px gutters. Skip link lands on `#main`.
- **Session Page**: Two-column at ≥900px.
  - Left (30–40%): topic selector, status bar, start/end controls, timer.
  - Right (60–70%): alert stack, transcript with speaker tags + timestamps, compact debug log.
  - Mobile: stack sections; keep status bar near top of main.
- **History Page**: Vertical list of cards; each card with topic, timestamp, duration, status chip, and quick actions (Open, Delete). Empty state with illustration placeholder + “Start a session” CTA.
- **Session Detail**: Header with topic + status chip; audio player prominent; transcript list with alternating row background per speaker; fallback message if audio missing.

## Components

- **Buttons** (see `components/ui/Button.tsx`):
  - Primary: filled amber, dark text, 8px radius, bold label. Hover darkens; disabled muted.
  - Secondary: outline charcoal; hover fills lightly (#f0eae0).
  - Danger: filled #c44536 or outline variant for deletes.
- **Chips/Status** (`components/ui/StatusChip.tsx`):
  - Active/listening: teal (#2a9d8f)
  - Connecting/recovering: amber (#f4a261)
  - Error/failed: danger (#c44536)
- **Cards** (`components/ui/Card.tsx`): Surface #fffaf2, 20–24px padding, shadow; content grid for metadata; actions aligned right/bottom.
- **Alerts** (`components/AlertStack.tsx`): Stacked banners with icon/label, message, and inline actions (Retry connection, End and save, Retry mic). Background #fff7ed; border amber; fade-slide in.
- **Status Bar** (`components/StatusBar.tsx`): Uses StatusChips for connection/mic/token states with optional info text.
- **Forms**: Labels above inputs (12px), 8px radius inputs, border #d8d3c8, focus teal ring.
- **Transcript Rows**: Speaker pill, timestamp, text. Alternate row background (#f3eee4 / #fffaf2).

## Accessibility

- Maintain AA+ contrast for all text/button states.
- `:focus-visible` on all interactive elements; skip-to-main link at top of shell.
- ARIA labels on audio controls, alerts (`role="alert"`), status bar, and transcript rows; avoid color-only signaling.
- Keyboard order: skip link → header/nav → page controls; ensure focus trap is not introduced.
- Shell main region uses `role="main"`; skip link targets `#main`. StatusBar exposes `aria-label="session status"`, transcript list uses `aria-label="transcript"`, audio player uses `aria-label="session audio player"`.

## Content & Microcopy

- Status bar messages: “Ready”, “Connecting…”, “Listening”, “Recovering… retrying connection”, “Error — try again”.
- Alerts:
  - Network drop: “Network connection lost. Retry or end to save.”
  - Token expired: “Realtime token expired. Refresh to continue or end to save.”
  - Mic denied: “Microphone permission required. Allow access to continue.”
- Empty history: “No sessions yet. Start a new session to see your progress here.”

## Assets & Icons

- Prefer simple line icons (24px) for mic, network, token, warning, play/pause.
- Placeholder illustration for empty states (non-essential; can be a colored block with rounded corners).

## Implementation Notes

- CSS variables declared in `frontend/src/style.css`; ensure components reference tokens instead of hard-coded colors.
- Responsive breakpoints at ~640px/900px/1200px; stack columns below 900px.
- Keep error/retry controls inline (avoid modals for critical paths).
- Ensure buttons and audio controls remain visible/distinct in bright environments (no dark theme required).
