use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TranscriptSegment {
    pub speaker: String,
    pub text: String,
    pub start_ms: i64,
    pub end_ms: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Transcript {
    pub id: Uuid,
    pub session_id: Uuid,
    pub finalized: bool,
    pub segments: serde_json::Value,
    pub created_at: DateTime<Utc>,
}

pub async fn upsert_transcript(
    pool: &PgPool,
    session_id: Uuid,
    finalized: bool,
    segments: &[TranscriptSegment],
) -> anyhow::Result<Uuid> {
    let segments_json = serde_json::to_value(segments)?;
    let record: (Uuid,) = sqlx::query_as(
        r#"
        INSERT INTO transcripts (session_id, finalized, segments)
        VALUES ($1, $2, $3)
        ON CONFLICT (session_id) DO UPDATE
        SET finalized = EXCLUDED.finalized,
            segments = EXCLUDED.segments
        RETURNING id
        "#,
    )
    .bind(session_id)
    .bind(finalized)
    .bind(segments_json)
        .fetch_one(pool)
        .await?;
    Ok(record.0)
}

pub async fn get_transcript_by_session(
    pool: &PgPool,
    session_id: Uuid,
) -> anyhow::Result<Option<Transcript>> {
    let row = sqlx::query_as::<_, Transcript>(
        r#"
        SELECT id, session_id, finalized, segments, created_at
        FROM transcripts
        WHERE session_id = $1
        "#,
    )
    .bind(session_id)
    .fetch_optional(pool)
    .await?;
    Ok(row)
}
