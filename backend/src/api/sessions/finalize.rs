use axum::extract::{Json, Path, State};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use tracing::info;
use uuid::Uuid;

use crate::auth::CurrentUser;
use crate::models::audio_recording::AudioRecording;
use crate::models::session::Session;
use crate::models::transcript::{
    get_transcript_by_session, upsert_transcript, Transcript, TranscriptSegment,
};
use crate::services::{sessions, transcription};
use crate::state::SharedState;
use crate::telemetry;

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
    CurrentUser(user_id): CurrentUser,
    Path(id): Path<Uuid>,
    Json(payload): Json<FinalizeRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let session = match Session::get(&state.db, id).await {
        Ok(sess) => sess,
        Err(err) => {
            telemetry::log_failure(
                "finalize_session_missing",
                Some(id),
                &format!("session missing: {:?}", err),
            );
            return Err(StatusCode::NOT_FOUND);
        }
    };

    if session.user_id != user_id {
        telemetry::log_failure("finalize_forbidden", Some(id), "user mismatch");
        return Err(StatusCode::FORBIDDEN);
    }

    let existing_transcript: Option<Transcript> =
        get_transcript_by_session(&state.db, id).await.unwrap_or(None);
    let audio_record = AudioRecording::get_by_session(&state.db, id)
        .await
        .unwrap_or(None);
    let mut transcript = payload.transcript.clone();

    if transcript.is_empty() {
        if let Some(existing) = existing_transcript.as_ref() {
            if let Ok(existing_segments) =
                serde_json::from_value::<Vec<TranscriptSegment>>(existing.segments.clone())
            {
                transcript = existing_segments;
            }
        }
    }

    let audio_url = payload
        .audio_url
        .clone()
        .or_else(|| audio_record.as_ref().map(|a| a.storage_url.clone()));

    if transcript.is_empty() {
        if let Some(url) = audio_url.as_ref() {
            match transcription::transcribe_audio_from_url(
                &state.storage,
                url,
                payload.duration_seconds,
            )
            .await
            {
                Ok(segments) => transcript = segments,
                Err(err) => {
                    telemetry::log_failure(
                        "finalize_transcription_failed",
                        Some(id),
                        &format!("{:?}", err),
                    );
                    return Err(StatusCode::BAD_REQUEST);
                }
            }
        } else {
            telemetry::log_failure(
                "finalize_missing_transcript",
                Some(id),
                "no transcript and no audio_url provided",
            );
            return Err(StatusCode::BAD_REQUEST);
        }
    }

    let chosen_status = if session.status == "active" {
        payload.status.clone()
    } else {
        session.status.clone()
    };
    let duration_seconds = session.duration_seconds.or(payload.duration_seconds);
    let end_time = session.end_time.unwrap_or_else(Utc::now);

    let finalize = sessions::finalize_session(
        &state.db,
        id,
        end_time,
        duration_seconds,
        &chosen_status,
    )
    .await;

    if let Err(err) = finalize {
        telemetry::log_failure(
            "finalize_update_failed",
            Some(id),
            &format!("finalize failed: {:?}", err),
        );
        return Err(StatusCode::BAD_REQUEST);
    }

    let mut should_persist = true;
    if let Some(existing) = existing_transcript.as_ref() {
        if existing.finalized {
            if let Ok(existing_segments) =
                serde_json::from_value::<Vec<TranscriptSegment>>(existing.segments.clone())
            {
                if serde_json::to_value(&existing_segments).ok()
                    == serde_json::to_value(&transcript).ok()
                {
                    should_persist = false;
                }
            }
        }
    }

    if should_persist {
        if let Err(err) = upsert_transcript(&state.db, id, true, &transcript).await {
            telemetry::log_failure(
                "finalize_transcript_persist_failed",
                Some(id),
                &format!("{:?}", err),
            );
            return Err(StatusCode::BAD_REQUEST);
        }
    }

    info!("finalized session {}", id);
    Ok((
        StatusCode::OK,
        Json(FinalizeResponse {
            session_id: id,
            status: chosen_status,
            transcript,
            audio_url,
            duration_seconds,
        }),
    ))
}
