# Design Guide: Product Design Refresh (002)

Source of truth for visual and interaction patterns for the redesign. Keep aligned with constitution hooks (privacy, realtime resilience, AA accessibility) and the spec user stories.

## Theme & Tokens (Warm Supportive)

- **Token source**: Tailwind theme in `frontend/tailwind.config.cjs`; base/global styles via `frontend/src/index.css`.
- **Palette**:
  - Background: #FFFBF7 (warm off-white), optional hero gradient into #FFF2E6
  - Surface: #FFFFFF (cards/panels), SurfaceAlt: #FFF2E6
  - Text: #1F2937 (primary), #6B7280 (secondary), #9CA3AF (muted), text on primary: #FFFFFF
  - Primary (actions): #FB923C (hover: #F97316, active: #EA580C, soft: #FED7AA)
  - Accent: #0F766E (links/secondary), AccentSoft: #99F6E4
  - Status: success #22C55E / #DCFCE7; warning #F59E0B / #FEF3C7; error #EF4444 / #FEE2E2
  - Borders/Lines: #E7E2DA
- **Typography**: Headings → Sora (700/600); Body → Manrope (500/400). Base 16px; H1 30px, H2 24px, H3 18px. Line-height: headings 1.35, body 1.6.
- **Radius & Shadows**: 12px radius; airy shadow `0 16px 40px rgba(0,0,0,0.12)`.
- **Focus**: 2px ring using primaryHover at ~40% opacity via `:focus-visible`.
- **Spacing**: 8px unit; generous padding; max content width ~1100px.
- **Motion**: 150–220ms ease for hover/focus; gentle fade/slide for cards/alerts; light lifts on tiles/buttons; avoid bouncy animations.

## Layout Patterns

- **Shell**: Full-width header wrapper with centered content; header background uses surface; nav links teal by default with primary underline on active; sticky at top. Skip link lands on `#main`.
- **Home Page**: Bright hero on light canvas, then two stacked sections: “Practice your speech” and “Practice with an agent” with three lifted tiles each; hover/focus glow and playful shadows. Selecting a tile routes to Session with topic prefilled.
- **Session Page**: Two-column at ≥900px.
  - Left: topic picker, status bar, start/end controls, timer, and a large “Speech recording display” panel with soft pattern.
  - Right: conversation log/transcript column with alternating rows, plus alerts/debug stack.
  - Mobile: stack with controls first, then recording display, then transcript/alerts.
- **History Page**: Vertical list of wide row cards on the light canvas; each row shows topic, timestamp, duration, status chip, and actions (Open/Delete). Empty state uses a warm illustration block and CTA.
- **Session Detail**: Header with topic + status chip; large panel with audio player and transcript; alternating transcript rows and fallback if audio missing.

## Wireframe Mapping (Home → Session → History → Detail)

- **Home**: Highlight Home in nav; two labeled sections with three tiles each.
- **Session**: Highlight Session; `Topic: <name>` header; left = speech recording display, right = conversation log/transcript.
- **History**: Highlight History; stacked row cards.
- **History Detail**: Highlight History; “History Detail” heading with a large panel for transcript/audio/metadata.

## Components

- **Buttons** (see `components/ui/Button.tsx`):
  - Primary: background primary, text white, 12px radius; hover primaryHover; active primaryActive.
  - Secondary: surface/transparent with border; text primary; hover primarySoft background.
  - Danger: filled error with white text.
- **Chips/Status** (`components/ui/StatusChip.tsx`):
  - Active/listening: teal (#0F766E)
  - Connecting/recovering: primarySoft/primary
  - Error/failed: error
- **Cards** (`components/ui/Card.tsx`): Surface, border #E7E2DA, 20–24px padding, shadow; primarySoft only for small highlights.
- **Alerts** (`components/AlertStack.tsx`): Stacked banners with tone-specific borders/backgrounds; use primarySoft/warningSoft for token/network/mic, errorSoft for errors; fade/slide in.
- **Status Bar** (`components/StatusBar.tsx`): Uses StatusChips for connection/mic/token states with optional info text.
- **Forms**: Input border #E7E2DA; focus ring in primaryHover; error border error + errorSoft background.
- **Transcript Rows**: Speaker pill, timestamp, text. Alternate row background using surfaceAlt/primarySoft.

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

- Tokens defined in `frontend/tailwind.config.cjs`; base/shared classes in `frontend/src/index.css` using Tailwind layers; ensure components reference theme utilities instead of ad-hoc colors.
- Responsive breakpoints at ~640px/900px/1200px; stack columns below 900px.
- Keep error/retry controls inline (avoid modals for critical paths).
- Ensure buttons and audio controls remain visible/distinct in bright environments (no dark theme required).
