use axum::extract::{Multipart, Path, State};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use uuid::Uuid;
use tracing::info;

use crate::models::audio_recording::{AudioRecording, NewAudioRecording};
use crate::state::SharedState;

pub async fn upload_audio(
    State(state): State<SharedState>,
    Path(id): Path<Uuid>,
    mut multipart: Multipart,
) -> impl IntoResponse {
    let mut content: Option<Vec<u8>> = None;
    let mut filename = format!("{}.webm", id);
    let mut mime: Option<String> = None;
    let mut duration: Option<i32> = None;

    while let Some(field) = multipart.next_field().await.unwrap_or(None) {
        let name = field.name().map(|s| s.to_string());
        match name.as_deref() {
            Some("file") => {
                filename = field
                    .file_name()
                    .map(|s| s.to_string())
                    .unwrap_or_else(|| filename.clone());
                mime = field.content_type().map(|s| s.to_string());
                content = Some(
                    field
                        .bytes()
                        .await
                        .map(|b| b.to_vec())
                        .unwrap_or_default(),
                );
            }
            Some("duration_seconds") => {
                let val = field
                    .text()
                    .await
                    .ok()
                    .and_then(|v| v.parse::<i32>().ok());
                duration = val;
            }
            _ => {}
        }
    }

    let bytes = match content {
        Some(c) if !c.is_empty() => c,
        _ => return StatusCode::BAD_REQUEST.into_response(),
    };

    let key = format!("sessions/{}/{}", id, filename);
    info!("uploading audio for session {}", id);
    let url = match state
        .storage
        .upload_bytes(&key, bytes, mime.as_deref())
        .await
    {
        Ok(u) => u,
        Err(err) => {
            eprintln!("upload failed: {:?}", err);
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };

    let record = AudioRecording::insert(
        &state.db,
        NewAudioRecording {
            session_id: id,
            storage_url: url.clone(),
            duration_seconds: duration,
            mime_type: mime,
            size_bytes: None,
            quality_status: None,
        },
    )
    .await;

    match record {
        Ok(rec) => (StatusCode::OK, axum::Json(rec)).into_response(),
        Err(err) => {
            eprintln!("audio record insert failed: {:?}", err);
            StatusCode::BAD_REQUEST.into_response()
        }
    }
}
