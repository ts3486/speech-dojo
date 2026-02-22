use axum::extract::State;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::Json;

use crate::services::history::{list_public_sessions, PublicSessionListItem};
use crate::state::SharedState;

#[derive(serde::Serialize)]
pub struct PublicSessionsResponse {
    pub sessions: Vec<PublicSessionListItem>,
}

pub async fn list_public_sessions_handler(
    State(state): State<SharedState>,
) -> Result<impl IntoResponse, StatusCode> {
    match list_public_sessions(&state.db).await {
        Ok(sessions) => Ok(Json(PublicSessionsResponse { sessions })),
        Err(err) => {
            eprintln!("list public sessions failed: {:?}", err);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}
