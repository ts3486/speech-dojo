use anyhow::{anyhow, Context};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::models::ai_feedback::AiFeedback;
use crate::services::history::session_detail_for_user;

// ── OpenAI request/response types ──────────────────────────────────────────

#[derive(Serialize)]
struct ChatRequest {
    model: String,
    messages: Vec<ChatMessage>,
    response_format: ResponseFormat,
}

#[derive(Serialize)]
struct ChatMessage {
    role: String,
    content: String,
}

#[derive(Serialize)]
struct ResponseFormat {
    #[serde(rename = "type")]
    kind: String,
}

#[derive(Deserialize)]
struct ChatResponse {
    choices: Vec<ChatChoice>,
}

#[derive(Deserialize)]
struct ChatChoice {
    message: ChatChoiceMessage,
}

#[derive(Deserialize)]
struct ChatChoiceMessage {
    content: String,
}

// ── GPT feedback schema ─────────────────────────────────────────────────────

#[derive(Deserialize)]
struct GptFeedback {
    overall: f64,
    clarity: f64,
    fluency: f64,
    structure: f64,
    vocabulary: f64,
    strengths: String,
    improvements: String,
    suggestions: String,
}

// ── Public service function ─────────────────────────────────────────────────

/// Generate (or return cached) AI feedback for the given session.
///
/// Returns an error if:
/// - the session does not belong to `user_id`
/// - the session has not yet ended
/// - no transcript is available
pub async fn generate_feedback(
    pool: &PgPool,
    session_id: Uuid,
    user_id: Uuid,
) -> anyhow::Result<AiFeedback> {
    let detail = session_detail_for_user(pool, session_id, user_id)
        .await
        .context("load session detail")?;

    if detail.status != "ended" {
        return Err(anyhow!("session is not completed"));
    }
    if detail.transcript.is_empty() {
        return Err(anyhow!("no transcript available"));
    }

    // Return cached feedback if it already exists.
    if let Some(cached) = AiFeedback::find_by_session_id(pool, session_id).await? {
        return Ok(cached);
    }

    // Fetch the topic's prompt_hint directly from the DB.
    let prompt_hint: Option<String> = sqlx::query_scalar(
        "SELECT prompt_hint FROM topics WHERE id = $1",
    )
    .bind(detail.topic_id)
    .fetch_optional(pool)
    .await
    .context("fetch topic prompt_hint")?
    .flatten();

    // Build a readable transcript string.
    let transcript_text = detail
        .transcript
        .iter()
        .map(|seg| format!("{}: {}", seg.speaker, seg.text))
        .collect::<Vec<_>>()
        .join("\n");

    let duration_str = detail
        .duration_seconds
        .map(|d| format!("{}s", d))
        .unwrap_or_else(|| "unknown".to_string());

    let hint_str = prompt_hint.as_deref().unwrap_or("General speech practice");

    let user_prompt = format!(
        r#"Topic: "{topic}" ({hint})

Transcript:
{transcript}

Duration: {duration}

Rate this speech practice on these dimensions (0.0-10.0):
- overall, clarity, fluency, structure, vocabulary

Also provide:
- strengths: 2-3 specific positive observations (as a plain string)
- improvements: 2-3 specific areas to work on (as a plain string)
- suggestions: 2-3 actionable tips (as a plain string)

Respond as valid JSON matching this schema exactly:
{{"overall": number, "clarity": number, "fluency": number, "structure": number, "vocabulary": number, "strengths": "string", "improvements": "string", "suggestions": "string"}}"#,
        topic = detail.topic_title,
        hint = hint_str,
        transcript = transcript_text,
        duration = duration_str,
    );

    let api_key = std::env::var("OPENAI_SECRET_KEY").context("OPENAI_SECRET_KEY missing")?;

    let request = ChatRequest {
        model: "gpt-4o".to_string(),
        messages: vec![
            ChatMessage {
                role: "system".to_string(),
                content: "You are a speech coach evaluating a practice session. Always respond with valid JSON only.".to_string(),
            },
            ChatMessage {
                role: "user".to_string(),
                content: user_prompt,
            },
        ],
        response_format: ResponseFormat {
            kind: "json_object".to_string(),
        },
    };

    let client = reqwest::Client::new();
    let resp = client
        .post("https://api.openai.com/v1/chat/completions")
        .bearer_auth(api_key)
        .json(&request)
        .send()
        .await
        .context("send openai request")?
        .error_for_status()
        .context("openai error response")?;

    let chat_resp: ChatResponse = resp.json().await.context("parse openai response")?;

    let content = chat_resp
        .choices
        .into_iter()
        .next()
        .ok_or_else(|| anyhow!("empty openai response"))?
        .message
        .content;

    let gpt: GptFeedback = serde_json::from_str(&content).context("parse feedback JSON")?;

    // Build the model — `id` and `created_at` are placeholders; the DB
    // will override both via DEFAULT on INSERT (we don't bind `id`).
    let feedback = AiFeedback {
        id: Uuid::new_v4(),           // ignored on insert; DB generates it
        session_id,
        overall_score: gpt.overall,
        clarity_score: gpt.clarity,
        fluency_score: gpt.fluency,
        structure_score: gpt.structure,
        vocabulary_score: gpt.vocabulary,
        strengths: gpt.strengths,
        improvements: gpt.improvements,
        suggestions: gpt.suggestions,
        created_at: chrono::Utc::now(), // ignored on insert; DB generates it
    };

    AiFeedback::insert(pool, feedback)
        .await
        .context("insert feedback")
}
