use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct AiFeedback {
    pub id: Uuid,
    pub session_id: Uuid,
    pub overall_score: f64,
    pub clarity_score: f64,
    pub fluency_score: f64,
    pub structure_score: f64,
    pub vocabulary_score: f64,
    pub strengths: String,
    pub improvements: String,
    pub suggestions: String,
    pub created_at: DateTime<Utc>,
}

impl AiFeedback {
    /// Insert a new feedback row, letting the DB generate the `id`.
    pub async fn insert(pool: &PgPool, feedback: AiFeedback) -> anyhow::Result<AiFeedback> {
        let row = sqlx::query_as::<_, AiFeedback>(
            r#"
            INSERT INTO ai_feedback (
                session_id, overall_score, clarity_score, fluency_score,
                structure_score, vocabulary_score, strengths, improvements, suggestions
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING
                id, session_id, overall_score, clarity_score, fluency_score,
                structure_score, vocabulary_score, strengths, improvements, suggestions, created_at
            "#,
        )
        .bind(feedback.session_id)
        .bind(feedback.overall_score)
        .bind(feedback.clarity_score)
        .bind(feedback.fluency_score)
        .bind(feedback.structure_score)
        .bind(feedback.vocabulary_score)
        .bind(feedback.strengths)
        .bind(feedback.improvements)
        .bind(feedback.suggestions)
        .fetch_one(pool)
        .await?;

        Ok(row)
    }

    /// Look up existing feedback for a session, returning `None` if not yet generated.
    pub async fn find_by_session_id(
        pool: &PgPool,
        session_id: Uuid,
    ) -> anyhow::Result<Option<AiFeedback>> {
        let row = sqlx::query_as::<_, AiFeedback>(
            r#"
            SELECT
                id, session_id, overall_score, clarity_score, fluency_score,
                structure_score, vocabulary_score, strengths, improvements, suggestions, created_at
            FROM ai_feedback
            WHERE session_id = $1
            "#,
        )
        .bind(session_id)
        .fetch_optional(pool)
        .await?;

        Ok(row)
    }
}
