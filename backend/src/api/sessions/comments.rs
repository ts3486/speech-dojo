use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::Json;
use uuid::Uuid;

use crate::auth::CurrentUser;
use crate::services::history::{add_comment, delete_comment, list_comments, CommentItem};
use crate::state::SharedState;

#[derive(serde::Serialize)]
pub struct CommentsResponse {
    pub comments: Vec<CommentItem>,
}

pub async fn list_comments_handler(
    State(state): State<SharedState>,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, StatusCode> {
    match list_comments(&state.db, id).await {
        Ok(comments) => Ok(Json(CommentsResponse { comments })),
        Err(err) => {
            eprintln!("list comments failed: {:?}", err);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

#[derive(serde::Deserialize)]
pub struct PostCommentBody {
    pub text: String,
}

pub async fn post_comment_handler(
    State(state): State<SharedState>,
    CurrentUser(user_id): CurrentUser,
    Path(id): Path<Uuid>,
    Json(body): Json<PostCommentBody>,
) -> Result<impl IntoResponse, StatusCode> {
    if body.text.is_empty() || body.text.len() > 500 {
        return Err(StatusCode::BAD_REQUEST);
    }
    match add_comment(&state.db, id, user_id, &body.text).await {
        Ok(comment) => Ok((StatusCode::CREATED, Json(comment))),
        Err(err) => {
            eprintln!("post comment failed: {:?}", err);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn delete_comment_handler(
    State(state): State<SharedState>,
    CurrentUser(user_id): CurrentUser,
    Path((_session_id, comment_id)): Path<(Uuid, Uuid)>,
) -> Result<impl IntoResponse, StatusCode> {
    match delete_comment(&state.db, comment_id, user_id).await {
        Ok(0) => Err(StatusCode::NOT_FOUND),
        Ok(_) => Ok(StatusCode::NO_CONTENT),
        Err(err) => {
            eprintln!("delete comment failed: {:?}", err);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}
