use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Session {
    pub id: Uuid,
    pub user_id: Uuid,
    pub topic_id: Uuid,
    pub start_time: DateTime<Utc>,
    pub end_time: Option<DateTime<Utc>>,
    pub duration_seconds: Option<i32>,
    pub status: String,
    pub privacy: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct NewSession {
    pub user_id: Uuid,
    pub topic_id: Uuid,
    pub status: String,
}

#[derive(Debug, Deserialize)]
pub struct FinalizeSession {
    pub end_time: DateTime<Utc>,
    pub duration_seconds: Option<i32>,
    pub status: String,
}

impl Session {
    pub async fn create(pool: &PgPool, payload: NewSession) -> anyhow::Result<Session> {
        let row = sqlx::query_as::<_, Session>(
            r#"
            INSERT INTO sessions (user_id, topic_id, status)
            VALUES ($1, $2, $3)
            RETURNING id, user_id, topic_id, start_time, end_time, duration_seconds, status, privacy, created_at, updated_at
            "#,
        )
        .bind(payload.user_id)
        .bind(payload.topic_id)
        .bind(payload.status)
        .fetch_one(pool)
        .await?;
        Ok(row)
    }

    pub async fn finalize(
        pool: &PgPool,
        session_id: Uuid,
        payload: FinalizeSession,
    ) -> anyhow::Result<Session> {
        let row = sqlx::query_as::<_, Session>(
            r#"
            UPDATE sessions
            SET end_time = $2,
                duration_seconds = $3,
                status = $4,
                updated_at = now()
            WHERE id = $1
            RETURNING id, user_id, topic_id, start_time, end_time, duration_seconds, status, privacy, created_at, updated_at
            "#,
        )
        .bind(session_id)
        .bind(payload.end_time)
        .bind(payload.duration_seconds)
        .bind(payload.status)
        .fetch_one(pool)
        .await?;
        Ok(row)
    }

    pub async fn get(pool: &PgPool, session_id: Uuid) -> anyhow::Result<Session> {
        let row = sqlx::query_as::<_, Session>(
            r#"
            SELECT id, user_id, topic_id, start_time, end_time, duration_seconds, status, privacy, created_at, updated_at
            FROM sessions
            WHERE id = $1
            "#,
        )
        .bind(session_id)
        .fetch_one(pool)
        .await?;
        Ok(row)
    }
}
