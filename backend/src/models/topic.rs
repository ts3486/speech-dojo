use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Topic {
    pub id: Uuid,
    pub title: String,
    pub difficulty: Option<String>,
    pub prompt_hint: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct NewTopic {
    pub title: String,
    pub difficulty: Option<String>,
    pub prompt_hint: Option<String>,
}

impl Topic {
    pub async fn list(pool: &PgPool) -> anyhow::Result<Vec<Topic>> {
        let rows = sqlx::query_as::<_, Topic>(
            r#"
            SELECT id, title, difficulty, prompt_hint, created_at, updated_at
            FROM topics
            ORDER BY created_at DESC
            "#,
        )
        .fetch_all(pool)
        .await?;
        Ok(rows)
    }

    pub async fn insert_many(pool: &PgPool, topics: &[NewTopic]) -> anyhow::Result<()> {
        for topic in topics {
            sqlx::query(
                r#"
                INSERT INTO topics (title, difficulty, prompt_hint)
                VALUES ($1, $2, $3)
                ON CONFLICT (title) DO NOTHING
                "#,
            )
            .bind(&topic.title)
            .bind(&topic.difficulty)
            .bind(&topic.prompt_hint)
            .execute(pool)
            .await?;
        }
        Ok(())
    }
}
