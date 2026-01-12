# Research: Realtime Speaking Practice

## Decisions

### Realtime voice path
- **Decision**: Use browser WebRTC to OpenAI Realtime (gpt-realtime-mini) with backend-minted ephemeral client secrets.
- **Rationale**: Meets latency target (<3s first response) while keeping API keys server-only.
- **Alternatives considered**: Long-polling/REST (too slow, no live audio), WebSockets with streaming audio (higher overhead vs WebRTC, weaker media support).

### Audio capture and upload
- **Decision**: Capture via MediaRecorder (Opus in WebM), store locally during session, upload final file to backend after user ends session.
- **Rationale**: Stable browser support; smaller files; aligns with session-end finalize flow.
- **Alternatives considered**: Live chunk uploads (adds complexity and failure modes); PCM/WAV (larger payloads).

### Transcript source of truth
- **Decision**: Use Realtime transcript events as the authoritative turn list; persist ordered segments with speaker labels and timestamps.
- **Rationale**: Avoid double transcription; aligns with low-latency experience.
- **Alternatives considered**: Re-transcribe uploads server-side (extra cost/latency, duplicate logic).

### Token expiry and recovery
- **Decision**: Short-lived client secrets; allow refresh mid-session, and allow safe end-and-save if refresh fails.
- **Rationale**: Protects keys; keeps sessions recoverable per constitution (no data loss).
- **Alternatives considered**: Long-lived tokens (higher exposure risk); blocking end on refresh failure (violates reliability).

### Storage choices
- **Decision**: Postgres for sessions/topics/transcripts; S3-compatible object storage for audio; signed URL or backend upload endpoint for final file.
- **Rationale**: Fits durability and retrieval needs; separates metadata from binary assets.
- **Alternatives considered**: Storing audio in DB (size/perf issues); unmanaged local FS (fragile, harder to scale).

### Privacy and scope
- **Decision**: Sessions are private-only; delete allowed; no publishing/sharing flows in this feature.
- **Rationale**: Matches spec and constitution security/privacy principles.
- **Alternatives considered**: Public links or sharing (out of scope and conflicts with privacy gate).
