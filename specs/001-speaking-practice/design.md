# Design Guide: Realtime Speaking Practice

Source of truth for visual and interaction patterns. Keep aligned with constitution (privacy, realtime resilience) and spec user stories.

## Theme & Tokens

- **Palette**:
  - Background: #f8f6f1
  - Text: #1f1f1f
  - Primary (actions): #f4a261 (hover: #e48f3e)
  - Secondary/Success: #2a9d8f
  - Danger: #c44536
  - Borders/Lines: #d8d3c8
  - Surface (cards): #fffaf2
- **Typography**: Headings → Sora (700/600); Body → Inter (400/500). Base 16px; H1 28px, H2 22px, H3 18px. Line-height: headings 1.35, body 1.55.
- **Radius & Shadows**: 8px corners; soft shadow `0 10px 30px rgba(0,0,0,0.06)`.
- **Focus**: 2px teal glow (#2a9d8f) around focusable elements; ensure focus-visible only.
- **Spacing**: 8px unit; page gutters 24px; max content width 1100px centered.
- **Motion**: 150–200ms ease for hover/focus; fade-slide in alerts/cards; no heavy animations.

## Layout Patterns

- **Shell**: Centered column with header (brand + nav links Session/History), main with max-width 1100px, generous breathing room.
- **Session Page**: Two-column at ≥900px.
  - Left (30–40%): topic selector, live status bar, start/end controls, timer.
  - Right (60–70%): alerts stack, transcript with speaker tags + timestamps, compact debug log.
  - On mobile: stack sections; keep status bar sticky at top of main.
- **History Page**: Vertical list of cards; each card with topic, timestamp, duration, status chip, and quick actions (Open, Delete). Empty state with illustration placeholder + “Start a session” CTA.
- **Session Detail**: Header with topic + status chip; audio player prominent; transcript list with alternating row background per speaker; fallback message if audio missing.

## Components

- **Buttons**:
  - Primary: filled amber, dark text, 8px radius, bold label. Hover darkens; disabled muted.
  - Secondary: outline charcoal; hover fills lightly (#f0eae0).
  - Danger: filled #c44536 or outline variant for deletes.
- **Chips/Status**:
  - Active/listening: teal (#2a9d8f)
  - Connecting/recovering: amber (#f4a261)
  - Error/failed: danger (#c44536)
- **Alerts**: Stacked banners with icon, message, and inline actions (Retry connection, End and save, Retry mic). Background #fff7ed; border amber; fade-slide in.
- **Forms**: Select + labels with 12px top labels, 8px radius inputs, border #d8d3c8, focus teal ring.
- **Transcript Rows**: Speaker label (pill), timestamp, text. Alternate row background (#f3eee4 / #fffaf2).
- **Cards (history/detail)**: Surface #fffaf2, 20–24px padding, shadow; content grid for metadata; actions aligned right/bottom.

## Accessibility

- Maintain AA+ contrast for all text/button states.
- `:focus-visible` on all interactive elements; skip-to-main link at top.
- ARIA labels on audio controls, alerts (`role="alert"`), and status bar.
- Avoid color-only signaling; pair chips with text labels.

## Content & Microcopy

- Status bar messages: “Ready”, “Connecting…”, “Listening”, “Recovering… retrying connection”, “Error — try again”.
- Alerts:
  - Network drop: “Network connection lost. Retry or end to save.”
  - Token expired: “Realtime token expired. Refresh to continue or end to save.”
  - Mic denied: “Microphone permission required. Allow access to continue.”
- Empty history: “No sessions yet. Start a new session to see your progress here.”

## Assets & Icons

- Use simple line icons (24px) for mic, network, token, warning, play/pause.
- Placeholder illustration for empty states (non-essential; can be a colored block with rounded corners).

## Implementation Notes

- Tailwind/CSS: define CSS variables for palette and fonts in global stylesheet; set base font-family to Inter with Sora for headings.
- Use responsive layout breakpoints at 640px/900px/1200px. Stack columns below 900px.
- Keep error/retry controls visible without modal dialogs; prefer inline alerts.
- Ensure buttons and audio controls remain reachable and visually distinct in both light/dim environments (no dark theme needed now).
