use axum::extract::{Json, Path, State};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use tracing::info;
use uuid::Uuid;

use crate::models::transcript::{upsert_transcript, TranscriptSegment};
use crate::services::{sessions, transcription};
use crate::state::SharedState;

#[derive(Deserialize)]
pub struct FinalizeRequest {
    pub transcript: Vec<TranscriptSegment>,
    pub status: String,
    pub duration_seconds: Option<i32>,
    pub audio_url: Option<String>,
}

#[derive(Serialize)]
pub struct FinalizeResponse {
    pub session_id: Uuid,
    pub status: String,
    pub transcript: Vec<TranscriptSegment>,
    pub audio_url: Option<String>,
    pub duration_seconds: Option<i32>,
}

pub async fn finalize_session(
    State(state): State<SharedState>,
    Path(id): Path<Uuid>,
    Json(payload): Json<FinalizeRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let end_time = Utc::now();
    info!("finalizing session {}", id);

    let finalize = sessions::finalize_session(
        &state.db,
        id,
        end_time,
        payload.duration_seconds,
        &payload.status,
    )
    .await;

    if let Err(err) = finalize {
        eprintln!("finalize failed: {:?}", err);
        return Err(StatusCode::BAD_REQUEST);
    }

    let mut transcript = payload.transcript.clone();

    if transcript.is_empty() {
        if let Some(url) = payload.audio_url.as_ref() {
            match transcription::transcribe_audio_from_url(
                &state.storage,
                url,
                payload.duration_seconds,
            )
            .await
            {
                Ok(segments) => transcript = segments,
                Err(err) => {
                    eprintln!("transcription failed: {:?}", err);
                    return Err(StatusCode::BAD_REQUEST);
                }
            }
        } else {
            eprintln!("no transcript provided and no audio_url to transcribe");
            return Err(StatusCode::BAD_REQUEST);
        }
    }

    if let Err(err) = upsert_transcript(&state.db, id, true, &transcript).await {
        eprintln!("transcript persist failed: {:?}", err);
        return Err(StatusCode::BAD_REQUEST);
    }

    Ok((
        StatusCode::OK,
        Json(FinalizeResponse {
            session_id: id,
            status: payload.status,
            transcript,
            audio_url: payload.audio_url,
            duration_seconds: payload.duration_seconds,
        }),
    ))
}
