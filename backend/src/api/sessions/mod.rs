use axum::routing::{delete, get, patch, post};
use axum::Router;

use crate::state::SharedState;

use self::comments::{delete_comment_handler, list_comments_handler, post_comment_handler};
use self::create::create_session;
use self::delete::delete_session;
use self::detail::session_detail;
use self::finalize::finalize_session;
use self::likes::toggle_like_handler;
use self::list::list_sessions;
use self::public_detail::get_public_session_detail;
use self::public_list::list_public_sessions_handler;
use self::set_privacy::set_privacy_handler;
use self::upload::upload_audio;

mod comments;
mod create;
mod delete;
mod detail;
mod feedback;
mod finalize;
mod likes;
mod list;
mod public_detail;
mod public_list;
mod set_privacy;
mod upload;

pub fn sessions_router() -> Router<SharedState> {
    Router::new()
        .route("/sessions", post(create_session).get(list_sessions))
        .route("/sessions/:id", get(session_detail).delete(delete_session))
        .route("/sessions/:id/finalize", post(finalize_session))
        .route("/sessions/:id/upload", post(upload_audio))
        .route(
            "/sessions/:id/feedback",
            get(feedback::get_feedback).post(feedback::post_feedback),
        )
        .route("/sessions/:id/privacy", patch(set_privacy_handler))
}

pub fn public_sessions_router() -> Router<SharedState> {
    Router::new()
        .route("/public/sessions", get(list_public_sessions_handler))
        .route("/public/sessions/:id", get(get_public_session_detail))
        .route("/public/sessions/:id/like", post(toggle_like_handler))
        .route(
            "/public/sessions/:id/comments",
            get(list_comments_handler).post(post_comment_handler),
        )
        .route(
            "/public/sessions/:id/comments/:comment_id",
            delete(delete_comment_handler),
        )
}
