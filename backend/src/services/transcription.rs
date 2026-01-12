use anyhow::Context;
use reqwest::multipart;
use serde::Deserialize;

use crate::models::transcript::TranscriptSegment;
use crate::services::storage::StorageService;

#[derive(Deserialize)]
struct WhisperSegment {
    start: f64,
    end: f64,
    text: String,
}

#[derive(Deserialize)]
struct WhisperVerboseResponse {
    text: String,
    segments: Option<Vec<WhisperSegment>>,
}

pub async fn transcribe_audio_from_url(
    storage: &StorageService,
    audio_url: &str,
    duration_seconds: Option<i32>,
) -> anyhow::Result<Vec<TranscriptSegment>> {
    let audio_bytes = storage
        .get_bytes_from_url(audio_url)
        .await
        .context("fetch audio from storage")?;

    let api_key = std::env::var("OPENAI_SECRET_KEY").context("OPENAI_SECRET_KEY missing")?;

    let file_part = multipart::Part::bytes(audio_bytes)
        .file_name("audio.webm")
        .mime_str("audio/webm")?;

    let form = multipart::Form::new()
        .part("file", file_part)
        .text("model", "whisper-1")
        .text("response_format", "verbose_json");

    let client = reqwest::Client::new();
    let resp = client
        .post("https://api.openai.com/v1/audio/transcriptions")
        .bearer_auth(api_key)
        .multipart(form)
        .send()
        .await?
        .error_for_status()?;

    let body: WhisperVerboseResponse = resp.json().await?;

    if let Some(segments) = body.segments {
        let mapped = segments
            .into_iter()
            .map(|seg| TranscriptSegment {
                speaker: "user".into(),
                text: seg.text,
                start_ms: (seg.start * 1000.0) as i64,
                end_ms: (seg.end * 1000.0) as i64,
            })
            .collect();
        Ok(mapped)
    } else {
        let end_ms = duration_seconds.unwrap_or_default().max(0) as i64 * 1000;
        Ok(vec![TranscriptSegment {
            speaker: "user".into(),
            text: body.text,
            start_ms: 0,
            end_ms: end_ms,
        }])
    }
}
