use crate::api::health::health;
use crate::api::realtime::realtime_router;
use crate::api::sessions::sessions_router;
use crate::api::topics::topics_router;
use crate::state::SharedState;
use axum::body::Body;
use axum::http::Request;
use axum::routing::get;
use axum::{middleware, Router};
use tower_http::trace::TraceLayer;
use axum::middleware::Next;

mod health;
mod realtime;
mod sessions;
mod topics;

pub fn router(state: SharedState) -> Router {
    let api = Router::new()
        .merge(topics_router())
        .merge(sessions_router())
        .merge(realtime_router())
        .layer(TraceLayer::new_for_http())
        .layer(middleware::from_fn(auth_maybe))
        .with_state(state.clone());

    Router::new()
        .route("/health", get(health))
        .nest("/api", api)
        .layer(TraceLayer::new_for_http())
        .layer(middleware::from_fn(auth_maybe))
        .with_state(state)
}

async fn auth_maybe(
    req: Request<Body>,
    next: Next,
) -> Result<axum::response::Response, axum::response::Response> {
    // Allow health unauthenticated; other routes can still use CurrentUser extractor.
    Ok(next.run(req).await)
}
