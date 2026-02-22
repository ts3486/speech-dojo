CREATE TABLE ai_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
  overall_score NUMERIC(4,1) NOT NULL,
  clarity_score NUMERIC(4,1) NOT NULL,
  fluency_score NUMERIC(4,1) NOT NULL,
  structure_score NUMERIC(4,1) NOT NULL,
  vocabulary_score NUMERIC(4,1) NOT NULL,
  strengths TEXT NOT NULL,
  improvements TEXT NOT NULL,
  suggestions TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
