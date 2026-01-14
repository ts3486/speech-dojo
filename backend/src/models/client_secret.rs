use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ClientSecret {
    pub id: Uuid,
    pub session_id: Uuid,
    pub token: String,
    pub expires_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct NewClientSecret {
    pub session_id: Uuid,
    pub token: String,
    pub expires_at: DateTime<Utc>,
}

impl ClientSecret {
    pub async fn insert(pool: &PgPool, payload: NewClientSecret) -> anyhow::Result<ClientSecret> {
        let row = sqlx::query_as::<_, ClientSecret>(
            r#"
            INSERT INTO client_secrets (session_id, token, expires_at)
            VALUES ($1, $2, $3)
            RETURNING id, session_id, token, expires_at, created_at
            "#,
        )
        .bind(payload.session_id)
        .bind(payload.token)
        .bind(payload.expires_at)
        .fetch_one(pool)
        .await?;
        Ok(row)
    }

    pub async fn latest_for_session(
        pool: &PgPool,
        session_id: Uuid,
    ) -> anyhow::Result<Option<ClientSecret>> {
        let row = sqlx::query_as::<_, ClientSecret>(
            r#"
            SELECT id, session_id, token, expires_at, created_at
            FROM client_secrets
            WHERE session_id = $1
            ORDER BY expires_at DESC
            LIMIT 1
            "#,
        )
        .bind(session_id)
        .fetch_optional(pool)
        .await?;
        Ok(row)
    }
}
