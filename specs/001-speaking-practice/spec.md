# Feature Specification: Realtime Speaking Practice

**Feature Branch**: `001-speaking-practice`  
**Created**: 2026-01-11  
**Status**: Draft  
**Input**: User description: "Build a browser-based speaking practice feature where users choose predefined topics and have realtime voice conversations with an AI coach; save audio, transcript, and session metadata to history with replay; handle mic permissions, network failures, and private sessions; exclude social feed, payments, and advanced ratings."

**Constitution Hooks**: Honor security/privacy (no browser secrets; default private sessions; delete/export), realtime WebRTC experience, reliability of audio/transcript persistence, clear frontend/backend boundaries, MVP scope discipline, required testing (Vitest + backend unit/integration), and PII-safe observability.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Guided speaking session (Priority: P1)

User selects a predefined topic (with difficulty/prompt) and completes a realtime voice coaching session with an AI coach, seeing live status and transcript when finished.

**Why this priority**: Core value: delivering a realtime coaching experience on curated topics.

**Independent Test**: User chooses a topic, grants mic access, completes a 2–5 minute session, ends it, and sees transcript and confirmation without needing history or other features.

**Acceptance Scenarios**:

1. **Given** the user selected a topic and mic permissions are granted, **When** they start a session, **Then** the AI coach responds in audio, live status shows listening/speaking, and the user can converse for up to 5 minutes.
2. **Given** the user ends the session, **When** finalization completes, **Then** a combined transcript (user + AI) is shown with session duration and a success message that audio was saved.

---

### User Story 2 - Session history & replay (Priority: P2)

User views their private session history, opens a past session, reads the transcript, and replays the audio.

**Why this priority**: Retention and learning require reviewing prior sessions.

**Independent Test**: With at least one saved session, user navigates to history, sees entries, opens one, reads transcript, and plays audio without starting a new session.

**Acceptance Scenarios**:

1. **Given** saved sessions exist, **When** the user opens history, **Then** entries are listed newest first with topic, timestamp, duration, and privacy status.
2. **Given** a session detail page, **When** the user opens it (via a dedicated `/sessions/:id` route), **Then** the full transcript is visible and audio playback controls work (play/pause/seek).

---

### User Story 3 - Resilient session handling (Priority: P3)

User can recover from common failures (network drop, token/permission issues) without losing captured audio/transcript.

**Why this priority**: Reliability is critical for trust and data retention.

**Independent Test**: Simulate connection loss or permission revocation during a session; user can end or retry and still see saved transcript/audio at finish.

**Acceptance Scenarios**:

1. **Given** a session is active, **When** network drops mid-session, **Then** the user is prompted to retry or end, and any captured audio/transcript is saved with a clear status.
2. **Given** mic permission is revoked or expires, **When** the app detects it, **Then** the user receives guidance to re-enable or end; the session can still finalize with saved data.
3. **Given** a client token expires during a session, **When** it is refreshed or the session is ended, **Then** the user can continue or complete without data loss.

### Edge Cases

- Mic permissions are denied, revoked mid-session, or unavailable on device.
- Network drop or AI response timeout while session is active (must still allow end + save).
- Client secret/token expires during a session (must refresh or allow safe completion).
- History is empty (show helpful empty state with next steps).
- Audio replay fails (fallback messaging and transcript still accessible).
- User attempts to publish/share; must remain private and require explicit opt-in (not enabled here).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Provide a curated topic list with difficulty and prompt hints; user must pick one before starting a session.
- **FR-002**: Request and manage microphone permission with clear messaging, retries, and guidance if denied.
- **FR-003**: Start and stop realtime voice sessions with an AI coach; display live listening/speaking status.
- **FR-004**: Capture and persist audio recording and combined transcript (user + AI) with turn timestamps for each session.
- **FR-005**: Persist session metadata (topic, start/end times, duration, status, privacy) for history.
- **FR-006**: Allow the user to end a session at any time and still save captured audio/transcript/metadata.
- **FR-007**: Detect and handle connection failures or token expiry during a session with options to retry or end without losing captured data.
- **FR-008**: Show a history view listing saved sessions (newest first) with topic, date/time, duration, and status; allow opening a session to view transcript and replay audio.
- **FR-008a**: Provide dedicated routed pages: Session start (`/` or `/session`), History (`/history`), and Session detail (`/sessions/:id`), with nav links between them. Home/landing is not required at this stage.
- **FR-009**: Ensure sessions are private by default; no public publishing; user can delete their session records from history.
- **FR-010**: Provide audio playback controls on session detail (play/pause/seek) and ensure transcript remains available if playback fails.

### Key Entities *(include if feature involves data)*

- **Session**: Topic, participant, start/end timestamps, duration, status (active/ended/failed), privacy flag.
- **Transcript**: Ordered segments with speaker labels and timestamps, linked to a session and audio.
- **AudioRecording**: Stored audio reference, duration, quality status, linked session reference.
- **Topic**: Title, difficulty, prompt hints, and any coaching guidance shown to the user.
- **ClientSecret**: Short-lived token used to authorize realtime interaction for a session.

### Assumptions

- Users are authenticated via the existing app login; session ownership and history are per user account.
- Sessions target 2–5 minutes; longer coaching or group sessions are out of scope for this release.
- AI voice/avatar assets already exist; no custom avatar design is included in this feature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of sessions deliver the first AI response within 3 seconds of start confirmation.
- **SC-002**: 100% of completed or user-ended sessions (2–5 minutes) retain audio and transcript, even after connection issues.
- **SC-003**: 95% of session attempts recover from transient mic/connection/token errors without data loss and with clear user guidance.
- **SC-004**: 100% of saved sessions are readable in history with transcript visible and audio replayable; audio loads within 3 seconds for 95% of plays.
- **SC-005**: Users complete start → converse → end → review transcript/replay on current Chrome and Safari without blockers; 0 sessions are exposed publicly without explicit opt-in.
