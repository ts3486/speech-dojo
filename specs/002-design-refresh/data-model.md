# Data Model: Design Refresh

No new entities. Reuse existing domain from 001-speaking-practice:
- Topic: id, title, difficulty, prompt_hint.
- Session: id, user_id, topic_id, start/end time, duration_seconds, status, privacy, client_secret_id?, audio_url?, transcript_id.
- ClientSecret: id, session_id, token, expires_at.
- Transcript: id, session_id, finalized, segments[] (speaker, text, start_ms, end_ms, sequence).
- AudioRecording: id, session_id, storage_url, duration_seconds, mime_type, size_bytes, quality_status.

Design refresh is UI/UX-only; backend data model unchanged. Relationships remain: Topic 1..* Session; Session 1..1 Transcript; Session 1..1 AudioRecording; Session 1..* ClientSecret.
