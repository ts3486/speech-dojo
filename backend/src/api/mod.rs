use crate::api::health::health;
use crate::state::SharedState;
use axum::body::Body;
use axum::http::Request;
use axum::routing::get;
use axum::{middleware, Router};
use tower_http::trace::TraceLayer;
use axum::middleware::Next;

mod health;

pub fn router(state: SharedState) -> Router {
    Router::new()
        .route("/health", get(health))
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
