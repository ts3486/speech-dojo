-- Performance index for public feed
CREATE INDEX IF NOT EXISTS idx_sessions_privacy
  ON sessions (privacy, start_time DESC)
  WHERE privacy = 'public';

-- Likes: one per user per session (enforced by UNIQUE)
CREATE TABLE session_likes (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id  UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (session_id, user_id)
);
CREATE INDEX idx_session_likes_session ON session_likes(session_id);

-- Comments
CREATE TABLE session_comments (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id  UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL,
    text        TEXT NOT NULL CHECK (char_length(text) BETWEEN 1 AND 500),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_session_comments_session ON session_comments(session_id, created_at);
