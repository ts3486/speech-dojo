use crate::models::topic::Topic;
use crate::state::SharedState;
use axum::extract::State;
use axum::{routing::get, Json, Router};

pub fn topics_router() -> Router<SharedState> {
    Router::new().route("/topics", get(list_topics))
}

async fn list_topics(State(state): State<SharedState>) -> Json<Vec<Topic>> {
    let topics = Topic::list(&state.db).await.unwrap_or_default();
    Json(topics)
}
