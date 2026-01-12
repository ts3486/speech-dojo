use crate::models::transcript::TranscriptSegment;
use anyhow::{anyhow, Context};
use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::{types::Json, FromRow, PgPool};
use uuid::Uuid;

#[derive(Debug, Serialize, FromRow)]
pub struct SessionListItem {
    pub id: Uuid,
    pub topic_id: Uuid,
    pub topic_title: String,
    pub start_time: DateTime<Utc>,
    pub duration_seconds: Option<i32>,
    pub status: String,
    pub privacy: String,
    pub audio_url: Option<String>,
    pub has_audio: bool,
    pub has_transcript: bool,
}

#[derive(FromRow)]
struct SessionDetailRow {
    id: Uuid,
    topic_id: Uuid,
    topic_title: String,
    start_time: DateTime<Utc>,
    end_time: Option<DateTime<Utc>>,
    duration_seconds: Option<i32>,
    status: String,
    privacy: String,
    audio_url: Option<String>,
    transcript_segments: Option<Json<serde_json::Value>>,
}

#[derive(Debug, Serialize)]
pub struct SessionDetail {
    pub id: Uuid,
    pub topic_id: Uuid,
    pub topic_title: String,
    pub start_time: DateTime<Utc>,
    pub end_time: Option<DateTime<Utc>>,
    pub duration_seconds: Option<i32>,
    pub status: String,
    pub privacy: String,
    pub audio_url: Option<String>,
    pub transcript: Vec<TranscriptSegment>,
}

pub async fn list_sessions_for_user(
    pool: &PgPool,
    user_id: Uuid,
) -> anyhow::Result<Vec<SessionListItem>> {
    let rows = sqlx::query_as::<_, SessionListItem>(
        r#"
        SELECT
            s.id,
            s.topic_id,
            t.title as topic_title,
            s.start_time,
            s.duration_seconds,
            s.status,
            s.privacy,
            ar.storage_url as audio_url,
            (ar.id IS NOT NULL) AS has_audio,
            (tr.id IS NOT NULL) AS has_transcript
        FROM sessions s
        JOIN topics t ON t.id = s.topic_id
        LEFT JOIN audio_recordings ar ON ar.session_id = s.id
        LEFT JOIN transcripts tr ON tr.session_id = s.id
        WHERE s.user_id = $1
        ORDER BY s.start_time DESC
        "#,
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;

    Ok(rows)
}

pub async fn session_detail_for_user(
    pool: &PgPool,
    session_id: Uuid,
    user_id: Uuid,
) -> anyhow::Result<SessionDetail> {
    let row = sqlx::query_as::<_, SessionDetailRow>(
        r#"
        SELECT
            s.id,
            s.topic_id,
            t.title as topic_title,
            s.start_time,
            s.end_time,
            s.duration_seconds,
            s.status,
            s.privacy,
            ar.storage_url as audio_url,
            tr.segments as transcript_segments
        FROM sessions s
        JOIN topics t ON t.id = s.topic_id
        LEFT JOIN audio_recordings ar ON ar.session_id = s.id
        LEFT JOIN transcripts tr ON tr.session_id = s.id
        WHERE s.id = $1 AND s.user_id = $2
        "#,
    )
    .bind(session_id)
    .bind(user_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| anyhow!("session not found"))?;

    let transcript = match row.transcript_segments {
        Some(Json(value)) => serde_json::from_value::<Vec<TranscriptSegment>>(value)
            .context("parse transcript segments")?,
        None => Vec::new(),
    };

    Ok(SessionDetail {
        id: row.id,
        topic_id: row.topic_id,
        topic_title: row.topic_title,
        start_time: row.start_time,
        end_time: row.end_time,
        duration_seconds: row.duration_seconds,
        status: row.status,
        privacy: row.privacy,
        audio_url: row.audio_url,
        transcript,
    })
}

pub async fn delete_session_for_user(
    pool: &PgPool,
    session_id: Uuid,
    user_id: Uuid,
) -> anyhow::Result<()> {
    let res = sqlx::query(
        r#"
        DELETE FROM sessions
        WHERE id = $1 AND user_id = $2
        "#,
    )
    .bind(session_id)
    .bind(user_id)
    .execute(pool)
    .await?;

    if res.rows_affected() == 0 {
        return Err(anyhow!("session not found"));
    }

    Ok(())
}
