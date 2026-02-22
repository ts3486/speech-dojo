use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::Json;
use uuid::Uuid;

use crate::auth::CurrentUser;
use crate::services::history::set_session_privacy;
use crate::state::SharedState;

#[derive(serde::Deserialize)]
pub struct SetPrivacyBody {
    pub privacy: String,
}

pub async fn set_privacy_handler(
    State(state): State<SharedState>,
    CurrentUser(user_id): CurrentUser,
    Path(id): Path<Uuid>,
    Json(body): Json<SetPrivacyBody>,
) -> Result<impl IntoResponse, StatusCode> {
    if body.privacy != "public" && body.privacy != "private" {
        return Err(StatusCode::BAD_REQUEST);
    }
    match set_session_privacy(&state.db, id, user_id, &body.privacy).await {
        Ok(result) => Ok(Json(result)),
        Err(err) => {
            eprintln!("set privacy failed: {:?}", err);
            Err(StatusCode::NOT_FOUND)
        }
    }
}
