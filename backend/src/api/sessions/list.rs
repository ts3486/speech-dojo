use axum::extract::State;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::Json;

use crate::auth::CurrentUser;
use crate::services::history::{list_sessions_for_user, SessionListItem};
use crate::state::SharedState;

#[derive(serde::Serialize)]
pub struct SessionsListResponse {
    pub sessions: Vec<SessionListItem>,
}

pub async fn list_sessions(
    State(state): State<SharedState>,
    CurrentUser(user_id): CurrentUser,
) -> Result<impl IntoResponse, StatusCode> {
    match list_sessions_for_user(&state.db, user_id).await {
        Ok(sessions) => Ok(Json(SessionsListResponse { sessions })),
        Err(err) => {
            eprintln!("failed to list sessions: {:?}", err);
            Err(StatusCode::BAD_REQUEST)
        }
    }
}
