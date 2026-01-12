use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use uuid::Uuid;

use crate::auth::CurrentUser;
use crate::services::history::delete_session_for_user;
use crate::state::SharedState;

pub async fn delete_session(
    State(state): State<SharedState>,
    CurrentUser(user_id): CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, StatusCode> {
    match delete_session_for_user(&state.db, id, user_id).await {
        Ok(_) => Ok(StatusCode::NO_CONTENT),
        Err(err) => {
            eprintln!("delete session failed: {:?}", err);
            Err(StatusCode::NOT_FOUND)
        }
    }
}
