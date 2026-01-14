use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct AudioRecording {
    pub id: Uuid,
    pub session_id: Uuid,
    pub storage_url: String,
    pub duration_seconds: Option<i32>,
    pub mime_type: Option<String>,
    pub size_bytes: Option<i64>,
    pub quality_status: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct NewAudioRecording {
    pub session_id: Uuid,
    pub storage_url: String,
    pub duration_seconds: Option<i32>,
    pub mime_type: Option<String>,
    pub size_bytes: Option<i64>,
    pub quality_status: Option<String>,
}

impl AudioRecording {
    pub async fn insert(
        pool: &PgPool,
        payload: NewAudioRecording,
    ) -> anyhow::Result<AudioRecording> {
        let row = sqlx::query_as::<_, AudioRecording>(
            r#"
            INSERT INTO audio_recordings (session_id, storage_url, duration_seconds, mime_type, size_bytes, quality_status)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (session_id) DO UPDATE
            SET storage_url = EXCLUDED.storage_url,
                duration_seconds = EXCLUDED.duration_seconds,
                mime_type = EXCLUDED.mime_type,
                size_bytes = EXCLUDED.size_bytes,
                quality_status = EXCLUDED.quality_status
            RETURNING id, session_id, storage_url, duration_seconds, mime_type, size_bytes, quality_status, created_at
            "#,
        )
        .bind(payload.session_id)
        .bind(payload.storage_url)
        .bind(payload.duration_seconds)
        .bind(payload.mime_type)
        .bind(payload.size_bytes)
        .bind(payload.quality_status)
        .fetch_one(pool)
        .await?;
        Ok(row)
    }

    pub async fn get_by_session(
        pool: &PgPool,
        session_id: Uuid,
    ) -> anyhow::Result<Option<AudioRecording>> {
        let row = sqlx::query_as::<_, AudioRecording>(
            r#"
            SELECT id, session_id, storage_url, duration_seconds, mime_type, size_bytes, quality_status, created_at
            FROM audio_recordings
            WHERE session_id = $1
            "#,
        )
        .bind(session_id)
        .fetch_optional(pool)
        .await?;
        Ok(row)
    }
}
