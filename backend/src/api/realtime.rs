use axum::extract::{Json, State};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::routing::post;
use axum::Router;
use chrono::{Duration, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use tracing::info;

use crate::auth::CurrentUser;
use crate::models::client_secret::{ClientSecret, NewClientSecret};
use crate::state::SharedState;

#[derive(Deserialize)]
pub struct RealtimeSessionRequest {
    pub session_id: Uuid,
}

#[derive(Serialize)]
pub struct RealtimeSessionResponse {
    pub client_secret: String,
    pub expires_at: String,
    pub session_id: Uuid,
}

pub fn realtime_router() -> Router<SharedState> {
    Router::new().route("/realtime/session", post(mint_client_secret))
}

pub async fn mint_client_secret(
    State(state): State<SharedState>,
    CurrentUser(_user): CurrentUser,
    Json(body): Json<RealtimeSessionRequest>,
) -> impl IntoResponse {
    // Placeholder secret generation. In production, call OpenAI to mint an ephemeral client secret.
    let token = format!("client_secret_{}", Uuid::new_v4());
    let expires_at = Utc::now() + Duration::minutes(10);
    info!("issuing client secret for session {}", body.session_id);

    let insert = ClientSecret::insert(
        &state.db,
        NewClientSecret {
            session_id: body.session_id,
            token: token.clone(),
            expires_at,
        },
    )
    .await;

    match insert {
        Ok(_) => (
            StatusCode::OK,
            Json(RealtimeSessionResponse {
                client_secret: token,
                expires_at: expires_at.to_rfc3339(),
                session_id: body.session_id,
            }),
        )
            .into_response(),
        Err(err) => {
            eprintln!("failed to mint client secret: {:?}", err);
            StatusCode::BAD_REQUEST.into_response()
        }
    }
}
