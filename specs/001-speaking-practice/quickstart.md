# Quickstart: Realtime Speaking Practice

1) **Backend**
- Ensure Postgres and S3-compatible storage are available; set env vars for DB, bucket, and OpenAI secret key.
- Copy `backend/.env.example` to `.env` and fill real secrets/hosts.
- Run migrations to create topics/sessions/transcripts/client_secret tables and seed topics.
- Start Axum server with endpoints: topics, sessions create/list/detail, realtime client secret mint, upload, finalize, delete.

2) **Frontend**
- Configure .env for backend API base URL.
- Copy `frontend/.env.example` to `.env` and set `VITE_API_BASE_URL` to backend origin.
- Implement flows: topic selection, mic permission prompt, session start/stop, live status, transcript display, history list/detail, audio replay.
- Use WebRTC to OpenAI Realtime with backend-issued client secrets; record audio locally (MediaRecorder) and upload on end.
- Install/run with pnpm: `pnpm install`, `pnpm dev`, `pnpm test` (Vitest).

3) **Testing**
- Frontend: Vitest for UI/session-state flows and error handling (mic denial, token expiry, network drop).
- Backend: Unit + integration tests for session lifecycle, client secret issuance, upload/finalize, and authorization.

4) **Validation**
- Verify first AI response ≤3s P95; audio replay loads ≤3s P95.
- Confirm sessions stay private by default; delete removes session, transcript, and audio references.
- Confirm idempotent finalize; partial transcripts do not overwrite finalized data.
