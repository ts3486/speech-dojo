# API Contracts: Realtime Speaking Practice

Authentication: Existing app auth (session/cookie/token). All endpoints require authenticated user. OpenAI client secrets are issued only server-side.

## GET /api/topics
- **Purpose**: List predefined speaking topics.
- **Response 200**: `{ topics: [{ id, title, difficulty, prompt_hint }] }`

## POST /api/sessions
- **Purpose**: Create a session record before starting realtime audio.
- **Request**: `{ topic_id }`
- **Response 201**: `{ session_id, status: "active", topic_id, started_at }`
- **Errors**: 400 invalid topic, 401 unauthenticated.

## POST /api/realtime/session
- **Purpose**: Mint short-lived client secret for OpenAI Realtime for this session.
- **Request**: `{ session_id }`
- **Response 200**: `{ client_secret, expires_at, session_id }`
- **Rules**: Server holds main OpenAI key; secret scoped to session; expires quickly.

## POST /api/sessions/{id}/upload
- **Purpose**: Upload final audio recording after session end.
- **Request**: multipart/form-data `file` (audio/webm+opus), optional `duration_seconds`
- **Response 200**: `{ audio_url, duration_seconds }`
- **Errors**: 400 bad file, 401/403 if not owner, 404 if session missing, 409 if already finalized.

## POST /api/sessions/{id}/finalize
- **Purpose**: Persist transcript and finalize session metadata.
- **Request**: `{ transcript: [{ speaker, text, start_ms, end_ms }], status: "ended"|"failed", duration_seconds, audio_url? }`
- **Response 200**: `{ session_id, status, transcript_id }`
- **Rules**: Idempotent; partial transcripts cannot overwrite finalized transcripts.

## GET /api/sessions
- **Purpose**: List history for the authenticated user.
- **Query**: pagination params (optional)
- **Response 200**: `{ sessions: [{ id, topic, started_at, duration_seconds, status, privacy, audio_url? }] }`

## GET /api/sessions/{id}
- **Purpose**: Fetch session detail with transcript and audio reference.
- **Response 200**: `{ id, topic, started_at, duration_seconds, status, privacy, transcript: [...], audio_url? }`
- **Errors**: 401/403 if not owner, 404 if missing.

## DELETE /api/sessions/{id}
- **Purpose**: Delete a session (privacy requirement).
- **Response 204**: No content.
- **Rules**: Removes or tombstones session metadata and associated transcript/audio references; only owner can delete.
