# Route Map (pre-upgrade)

Date: 2026-01-17  
Source: `frontend/src/App.tsx`, `frontend/src/pages/*`

## Navigation
- Primary nav (header): Home (`/`), Session (`/session`), History (`/history`); History tab also considered active for `/sessions/:id`.
- Skip link: `#main`.

## Routes
- `/` → `HomePage` (topic cards, practice selections)
- `/session` → `SessionPage` (speech recording/conversation)
- `/history` → `HistoryPage` (list of sessions/history entries)
- `/sessions/:id` → `SessionDetailPage` (history detail for a specific session)

## Notes
- Routing uses `BrowserRouter` with `Routes`/`Route` (React Router v6).
- Active state via `aria-current` on nav links; History active when path starts with `/sessions`.
