ALTER TABLE topics
    ADD COLUMN IF NOT EXISTS category      TEXT,
    ADD COLUMN IF NOT EXISTS system_prompt TEXT;
