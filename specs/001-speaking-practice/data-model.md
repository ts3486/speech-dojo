# Data Model: Realtime Speaking Practice

## Entities

### Topic
- **Fields**: id, title, difficulty, prompt_hint, created_at, updated_at
- **Notes**: Seeded/predefined; read-only for this feature.

### Session
- **Fields**: id, user_id, topic_id, start_time, end_time, duration_seconds, status (active|ended|failed), privacy (private), client_secret_id, audio_url, transcript_id, created_at, updated_at
- **Rules**: Must have topic_id; status transitions: active → ended|failed. Privacy defaults to private; no public flag in this feature.

### ClientSecret
- **Fields**: id, session_id, token, expires_at, created_at
- **Rules**: Short-lived; rotated/renewed as needed; not exposed beyond the current session context.

### Transcript
- **Fields**: id, session_id, finalized (bool), segments[]
- **Segments**: speaker (user|ai), text, start_ms, end_ms, sequence
- **Rules**: Order preserved by sequence; finalized at session end; partial segments must not overwrite finalized segments.

### AudioRecording
- **Fields**: id, session_id, storage_url, duration_seconds, mime_type (e.g., audio/webm;codecs=opus), size_bytes, quality_status, created_at
- **Rules**: Single primary recording per session; stored in S3-compatible bucket.

### History View (derived)
- **Fields**: session_id, topic_title, started_at, duration_seconds, status, privacy, has_audio, has_transcript
- **Notes**: Used for listing; read-only projection from Session/Transcript/AudioRecording.

## Relationships
- Topic 1..* Session
- User 1..* Session
- Session 1..1 Transcript
- Session 1..1 AudioRecording
- Session 1..* ClientSecret (renewals)

## Validation & Constraints
- Session must reference a valid Topic and authenticated User.
- Duration must be within expected bounds (2–5 minutes target; enforce reasonable max, e.g., 15 minutes hard cap).
- Transcript segments must be ordered and non-overlapping.
- Audio upload allowed only for the owning user/session and after authenticated request.
- Delete operations remove or tombstone session + transcript + audio references per privacy requirement.
