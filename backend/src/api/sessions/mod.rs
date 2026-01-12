use axum::routing::{get, post};
use axum::Router;

use crate::state::SharedState;

use self::create::create_session;
use self::delete::delete_session;
use self::detail::session_detail;
use self::finalize::finalize_session;
use self::list::list_sessions;
use self::upload::upload_audio;

mod create;
mod delete;
mod detail;
mod finalize;
mod list;
mod upload;

pub fn sessions_router() -> Router<SharedState> {
    Router::new()
        .route("/sessions", post(create_session).get(list_sessions))
        .route("/sessions/:id", get(session_detail).delete(delete_session))
        .route("/sessions/:id/finalize", post(finalize_session))
        .route("/sessions/:id/upload", post(upload_audio))
}
