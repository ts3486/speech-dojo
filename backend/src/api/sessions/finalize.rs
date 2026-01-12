use axum::extract::{Json, Path, State};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use chrono::Utc;
use serde::Deserialize;
use uuid::Uuid;
use tracing::info;

use crate::models::transcript::{upsert_transcript, TranscriptSegment};
use crate::services::sessions;
use crate::state::SharedState;

#[derive(Deserialize)]
pub struct FinalizeRequest {
    pub transcript: Vec<TranscriptSegment>,
    pub status: String,
    pub duration_seconds: Option<i32>,
    pub audio_url: Option<String>,
}

pub async fn finalize_session(
    State(state): State<SharedState>,
    Path(id): Path<Uuid>,
    Json(payload): Json<FinalizeRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let end_time = Utc::now();
    info!("finalizing session {}", id);

    let finalize =
        sessions::finalize_session(&state.db, id, end_time, payload.duration_seconds, &payload.status).await;

    if let Err(err) = finalize {
        eprintln!("finalize failed: {:?}", err);
        return Err(StatusCode::BAD_REQUEST);
    }

    if let Err(err) = upsert_transcript(&state.db, id, true, &payload.transcript).await {
        eprintln!("transcript persist failed: {:?}", err);
        return Err(StatusCode::BAD_REQUEST);
    }

    Ok((StatusCode::OK, Json(payload.audio_url)))
}
