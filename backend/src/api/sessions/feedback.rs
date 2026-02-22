use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::Json;
use uuid::Uuid;

use crate::auth::CurrentUser;
use crate::models::ai_feedback::AiFeedback;
use crate::services::feedback::generate_feedback as generate_feedback_service;
use crate::state::SharedState;

/// GET /sessions/:id/feedback
///
/// Returns existing AI feedback for the session if it has already been
/// generated, otherwise responds with 404.
pub async fn get_feedback(
    State(state): State<SharedState>,
    CurrentUser(user_id): CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, StatusCode> {
    // Verify the session belongs to this user.
    match crate::services::history::session_detail_for_user(&state.db, id, user_id).await {
        Err(_) => return Err(StatusCode::NOT_FOUND),
        Ok(_) => {}
    }

    match AiFeedback::find_by_session_id(&state.db, id).await {
        Ok(Some(fb)) => Ok(Json(fb)),
        Ok(None) => Err(StatusCode::NOT_FOUND),
        Err(err) => {
            eprintln!("get feedback failed: {:?}", err);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

/// POST /sessions/:id/feedback
///
/// Generates AI feedback for the session (or returns cached feedback if it
/// already exists).  The session must be in `ended` status and must have a
/// transcript; otherwise responds with 422.
pub async fn post_feedback(
    State(state): State<SharedState>,
    CurrentUser(user_id): CurrentUser,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, StatusCode> {
    match generate_feedback_service(&state.db, id, user_id).await {
        Ok(fb) => Ok(Json(fb)),
        Err(err) => {
            let msg = err.to_string();
            eprintln!("generate feedback failed: {:?}", err);
            if msg.contains("not found") {
                Err(StatusCode::NOT_FOUND)
            } else if msg.contains("not completed") || msg.contains("no transcript") {
                Err(StatusCode::UNPROCESSABLE_ENTITY)
            } else {
                Err(StatusCode::INTERNAL_SERVER_ERROR)
            }
        }
    }
}
