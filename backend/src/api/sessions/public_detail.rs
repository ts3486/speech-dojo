use axum::extract::{Path, State};
use axum::http::{HeaderMap, StatusCode};
use axum::response::IntoResponse;
use axum::Json;
use uuid::Uuid;

use crate::services::history::{public_session_detail, PublicSessionDetail};
use crate::state::SharedState;

#[derive(serde::Serialize)]
pub struct PublicSessionDetailResponse {
    pub session: PublicSessionDetail,
}

pub async fn get_public_session_detail(
    State(state): State<SharedState>,
    headers: HeaderMap,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, StatusCode> {
    let requesting_user_id = headers
        .get("x-user-id")
        .and_then(|h| h.to_str().ok())
        .and_then(|s| Uuid::parse_str(s).ok());

    match public_session_detail(&state.db, id, requesting_user_id).await {
        Ok(session) => Ok(Json(PublicSessionDetailResponse { session })),
        Err(err) => {
            eprintln!("public session detail failed: {:?}", err);
            Err(StatusCode::NOT_FOUND)
        }
    }
}
