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

fn speaker_tag_from_uuid(user_id: Uuid) -> String {
    // Take the raw UUID bytes, use the last 2 bytes as u16
    let bytes = user_id.as_bytes();
    let n = u16::from_be_bytes([bytes[14], bytes[15]]);
    format!("Speaker #{:04}", n)
}

#[derive(FromRow)]
struct PublicSessionListRow {
    id: Uuid,
    user_id: Uuid,
    topic_title: String,
    topic_category: Option<String>,
    start_time: DateTime<Utc>,
    duration_seconds: Option<i32>,
    has_audio: bool,
    has_transcript: bool,
    like_count: i64,
}

#[derive(Debug, Serialize)]
pub struct PublicSessionListItem {
    pub id: Uuid,
    pub topic_title: String,
    pub topic_category: Option<String>,
    pub start_time: DateTime<Utc>,
    pub duration_seconds: Option<i32>,
    pub speaker_tag: String,
    pub has_audio: bool,
    pub has_transcript: bool,
    pub like_count: i64,
}

pub async fn list_public_sessions(pool: &PgPool) -> anyhow::Result<Vec<PublicSessionListItem>> {
    let rows = sqlx::query_as::<_, PublicSessionListRow>(
        r#"
        SELECT s.id, s.user_id, t.title as topic_title, t.category as topic_category,
               s.start_time, s.duration_seconds,
               (ar.id IS NOT NULL) as has_audio,
               (tr.id IS NOT NULL) as has_transcript,
               COALESCE(lc.like_count, 0) as like_count
        FROM sessions s
        JOIN topics t ON t.id = s.topic_id
        LEFT JOIN audio_recordings ar ON ar.session_id = s.id
        LEFT JOIN transcripts tr ON tr.session_id = s.id
        LEFT JOIN (SELECT session_id, COUNT(*) as like_count FROM session_likes GROUP BY session_id) lc
          ON lc.session_id = s.id
        WHERE s.privacy = 'public' AND s.status = 'ended'
        ORDER BY s.start_time DESC LIMIT 50
        "#,
    )
    .fetch_all(pool)
    .await?;

    Ok(rows
        .into_iter()
        .map(|r| PublicSessionListItem {
            id: r.id,
            topic_title: r.topic_title,
            topic_category: r.topic_category,
            start_time: r.start_time,
            duration_seconds: r.duration_seconds,
            speaker_tag: speaker_tag_from_uuid(r.user_id),
            has_audio: r.has_audio,
            has_transcript: r.has_transcript,
            like_count: r.like_count,
        })
        .collect())
}

#[derive(FromRow)]
struct PublicSessionDetailRow {
    id: Uuid,
    user_id: Uuid,
    topic_id: Uuid,
    topic_title: String,
    topic_category: Option<String>,
    start_time: DateTime<Utc>,
    end_time: Option<DateTime<Utc>>,
    duration_seconds: Option<i32>,
    status: String,
    audio_url: Option<String>,
    transcript_segments: Option<Json<serde_json::Value>>,
    like_count: i64,
    user_has_liked: bool,
}

#[derive(Debug, Serialize)]
pub struct PublicSessionDetail {
    pub id: Uuid,
    pub topic_id: Uuid,
    pub topic_title: String,
    pub topic_category: Option<String>,
    pub start_time: DateTime<Utc>,
    pub end_time: Option<DateTime<Utc>>,
    pub duration_seconds: Option<i32>,
    pub status: String,
    pub audio_url: Option<String>,
    pub transcript: Vec<TranscriptSegment>,
    pub speaker_tag: String,
    pub like_count: i64,
    pub user_has_liked: bool,
}

pub async fn public_session_detail(
    pool: &PgPool,
    session_id: Uuid,
    requesting_user_id: Option<Uuid>,
) -> anyhow::Result<PublicSessionDetail> {
    let uid = requesting_user_id.unwrap_or_else(Uuid::nil);
    let row = sqlx::query_as::<_, PublicSessionDetailRow>(
        r#"
        SELECT s.id, s.user_id, s.topic_id, t.title as topic_title, t.category as topic_category,
               s.start_time, s.end_time, s.duration_seconds, s.status,
               ar.storage_url as audio_url,
               tr.segments as transcript_segments,
               COALESCE(lc.like_count, 0) as like_count,
               (CASE WHEN $2 != '00000000-0000-0000-0000-000000000000'::uuid
                     THEN EXISTS(SELECT 1 FROM session_likes WHERE session_id = s.id AND user_id = $2)
                     ELSE false END) as user_has_liked
        FROM sessions s
        JOIN topics t ON t.id = s.topic_id
        LEFT JOIN audio_recordings ar ON ar.session_id = s.id
        LEFT JOIN transcripts tr ON tr.session_id = s.id
        LEFT JOIN (SELECT session_id, COUNT(*) as like_count FROM session_likes GROUP BY session_id) lc
          ON lc.session_id = s.id
        WHERE s.id = $1 AND s.privacy = 'public'
        "#,
    )
    .bind(session_id)
    .bind(uid)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| anyhow!("session not found"))?;

    let transcript = match row.transcript_segments {
        Some(Json(value)) => serde_json::from_value::<Vec<TranscriptSegment>>(value)
            .context("parse transcript segments")?,
        None => Vec::new(),
    };

    Ok(PublicSessionDetail {
        id: row.id,
        topic_id: row.topic_id,
        topic_title: row.topic_title,
        topic_category: row.topic_category,
        start_time: row.start_time,
        end_time: row.end_time,
        duration_seconds: row.duration_seconds,
        status: row.status,
        audio_url: row.audio_url,
        transcript,
        speaker_tag: speaker_tag_from_uuid(row.user_id),
        like_count: row.like_count,
        user_has_liked: row.user_has_liked,
    })
}

#[derive(Debug, Serialize, FromRow)]
pub struct PrivacyUpdate {
    pub id: Uuid,
    pub privacy: String,
}

pub async fn set_session_privacy(
    pool: &PgPool,
    session_id: Uuid,
    user_id: Uuid,
    privacy: &str,
) -> anyhow::Result<PrivacyUpdate> {
    let result = sqlx::query_as::<_, PrivacyUpdate>(
        r#"
        UPDATE sessions SET privacy = $2
        WHERE id = $1 AND user_id = $3
        RETURNING id, privacy
        "#,
    )
    .bind(session_id)
    .bind(privacy)
    .bind(user_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| anyhow!("session not found"))?;

    Ok(result)
}

#[derive(Debug, Serialize)]
pub struct LikeResult {
    pub like_count: i64,
    pub user_has_liked: bool,
}

pub async fn toggle_like(
    pool: &PgPool,
    session_id: Uuid,
    user_id: Uuid,
) -> anyhow::Result<LikeResult> {
    // Try to insert; if conflict (already liked), skip
    let insert_result = sqlx::query(
        r#"INSERT INTO session_likes (session_id, user_id) VALUES ($1, $2) ON CONFLICT (session_id, user_id) DO NOTHING"#,
    )
    .bind(session_id)
    .bind(user_id)
    .execute(pool)
    .await?;

    let was_inserted = insert_result.rows_affected() == 1;
    if !was_inserted {
        // Already existed, delete it (toggle off)
        sqlx::query(
            r#"DELETE FROM session_likes WHERE session_id = $1 AND user_id = $2"#,
        )
        .bind(session_id)
        .bind(user_id)
        .execute(pool)
        .await?;
    }

    let like_count: i64 = sqlx::query_scalar(
        r#"SELECT COUNT(*) FROM session_likes WHERE session_id = $1"#,
    )
    .bind(session_id)
    .fetch_one(pool)
    .await?;

    Ok(LikeResult {
        like_count,
        user_has_liked: was_inserted,
    })
}

#[derive(FromRow)]
struct CommentRow {
    id: Uuid,
    user_id: Uuid,
    text: String,
    created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct CommentItem {
    pub id: Uuid,
    pub speaker_tag: String,
    pub text: String,
    pub created_at: DateTime<Utc>,
}

pub async fn list_comments(
    pool: &PgPool,
    session_id: Uuid,
) -> anyhow::Result<Vec<CommentItem>> {
    let rows = sqlx::query_as::<_, CommentRow>(
        r#"
        SELECT id, user_id, text, created_at
        FROM session_comments
        WHERE session_id = $1
        ORDER BY created_at ASC
        "#,
    )
    .bind(session_id)
    .fetch_all(pool)
    .await?;

    Ok(rows
        .into_iter()
        .map(|r| CommentItem {
            id: r.id,
            speaker_tag: speaker_tag_from_uuid(r.user_id),
            text: r.text,
            created_at: r.created_at,
        })
        .collect())
}

pub async fn add_comment(
    pool: &PgPool,
    session_id: Uuid,
    user_id: Uuid,
    text: &str,
) -> anyhow::Result<CommentItem> {
    let row = sqlx::query_as::<_, CommentRow>(
        r#"
        INSERT INTO session_comments (session_id, user_id, text)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, text, created_at
        "#,
    )
    .bind(session_id)
    .bind(user_id)
    .bind(text)
    .fetch_one(pool)
    .await?;

    Ok(CommentItem {
        id: row.id,
        speaker_tag: speaker_tag_from_uuid(row.user_id),
        text: row.text,
        created_at: row.created_at,
    })
}

pub async fn delete_comment(
    pool: &PgPool,
    comment_id: Uuid,
    requesting_user_id: Uuid,
) -> anyhow::Result<u64> {
    let result = sqlx::query(
        r#"
        DELETE FROM session_comments
        WHERE id = $1
          AND (user_id = $2 OR session_id IN (SELECT id FROM sessions WHERE user_id = $2))
        "#,
    )
    .bind(comment_id)
    .bind(requesting_user_id)
    .execute(pool)
    .await?;

    Ok(result.rows_affected())
}
