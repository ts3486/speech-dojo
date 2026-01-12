use axum::extract::{Json, State};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use serde::Deserialize;
use tracing::info;
use uuid::Uuid;

use crate::auth::CurrentUser;
use crate::services::sessions;
use crate::state::SharedState;

#[derive(Deserialize)]
pub struct CreateSessionRequest {
    pub topic_id: Uuid,
}

pub async fn create_session(
    State(state): State<SharedState>,
    CurrentUser(user_id): CurrentUser,
    Json(payload): Json<CreateSessionRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    info!("creating session for user {}", user_id);
    match sessions::create_session(&state.db, user_id, payload.topic_id).await {
        Ok(session) => Ok((StatusCode::CREATED, Json(session))),
        Err(err) => {
            eprintln!("failed to create session: {:?}", err);
            Err(StatusCode::BAD_REQUEST)
        }
    }
}
