use crate::models::session::{FinalizeSession, NewSession, Session};
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

pub async fn create_session(
    pool: &PgPool,
    user_id: Uuid,
    topic_id: Uuid,
) -> anyhow::Result<Session> {
    Session::create(
        pool,
        NewSession {
            user_id,
            topic_id,
            status: "active".into(),
        },
    )
    .await
}

pub async fn finalize_session(
    pool: &PgPool,
    session_id: Uuid,
    end_time: DateTime<Utc>,
    duration_seconds: Option<i32>,
    status: &str,
) -> anyhow::Result<Session> {
    Session::finalize(
        pool,
        session_id,
        FinalizeSession {
            end_time,
            duration_seconds,
            status: status.to_string(),
        },
    )
    .await
}

pub async fn update_status(pool: &PgPool, session_id: Uuid, status: &str) -> anyhow::Result<()> {
    sqlx::query(
        r#"
        UPDATE sessions
        SET status = $2,
            updated_at = now()
        WHERE id = $1
        "#,
    )
    .bind(session_id)
    .bind(status)
    .execute(pool)
    .await?;
    Ok(())
}
