use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::Json;
use uuid::Uuid;

use crate::auth::CurrentUser;
use crate::services::history::{session_detail_for_user, SessionDetail};
use crate::state::SharedState;

#[derive(serde::Serialize)]
pub struct SessionDetailResponse {
    pub session: SessionDetail,
}

pub async fn session_detail(
    State(state): State<SharedState>,
    CurrentUser(user_id): CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, StatusCode> {
    match session_detail_for_user(&state.db, id, user_id).await {
        Ok(session) => Ok(Json(SessionDetailResponse { session })),
        Err(err) => {
            eprintln!("session detail failed: {:?}", err);
            Err(StatusCode::NOT_FOUND)
        }
    }
}
