use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::Json;
use uuid::Uuid;

use crate::auth::CurrentUser;
use crate::services::history::toggle_like;
use crate::state::SharedState;

pub async fn toggle_like_handler(
    State(state): State<SharedState>,
    CurrentUser(user_id): CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, StatusCode> {
    match toggle_like(&state.db, id, user_id).await {
        Ok(result) => Ok(Json(result)),
        Err(err) => {
            eprintln!("toggle like failed: {:?}", err);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}
