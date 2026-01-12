use axum::routing::post;
use axum::Router;

use crate::state::SharedState;

use self::create::create_session;
use self::finalize::finalize_session;
use self::upload::upload_audio;

mod create;
mod finalize;
mod upload;

pub fn sessions_router() -> Router<SharedState> {
    Router::new()
        .route("/sessions", post(create_session))
        .route("/sessions/:id/finalize", post(finalize_session))
        .route("/sessions/:id/upload", post(upload_audio))
}
