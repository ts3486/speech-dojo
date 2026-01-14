use axum::extract::{Json, State};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::routing::post;
use axum::Router;
use chrono::{Duration, Utc};
use serde::{Deserialize, Serialize};
use tracing::info;
use uuid::Uuid;

use crate::auth::CurrentUser;
use crate::models::client_secret::{ClientSecret, NewClientSecret};
use crate::models::session::Session;
use crate::services::sessions;
use crate::state::SharedState;
use crate::telemetry;

#[derive(Deserialize)]
pub struct RealtimeSessionRequest {
    pub session_id: Uuid,
    #[serde(default)]
    pub force_refresh: bool,
    pub status: Option<String>,
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
    CurrentUser(user_id): CurrentUser,
    Json(body): Json<RealtimeSessionRequest>,
) -> impl IntoResponse {
    let session = match Session::get(&state.db, body.session_id).await {
        Ok(sess) => sess,
        Err(err) => {
            telemetry::log_failure(
                "client_secret_session_missing",
                Some(body.session_id),
                &format!("{:?}", err),
            );
            return StatusCode::NOT_FOUND.into_response();
        }
    };

    if session.user_id != user_id {
        telemetry::log_failure(
            "client_secret_forbidden",
            Some(body.session_id),
            "user mismatch",
        );
        return StatusCode::FORBIDDEN.into_response();
    }

    if let Some(status) = body.status.as_deref() {
        if let Err(err) = sessions::update_status(&state.db, body.session_id, status).await {
            telemetry::log_failure(
                "client_secret_status_update_failed",
                Some(body.session_id),
                &format!("{:?}", err),
            );
        }
    }

    let existing = ClientSecret::latest_for_session(&state.db, body.session_id)
        .await
        .ok()
        .flatten();
    let now = Utc::now();
    let expiry_buffer = Duration::seconds(30);

    let mut reused = false;
    let (token, expires_at) = if let Some(existing_secret) = existing {
        let needs_refresh =
            body.force_refresh || existing_secret.expires_at <= now + expiry_buffer;
        if needs_refresh {
            let token = format!("client_secret_{}", Uuid::new_v4());
            let expires_at = Utc::now() + Duration::minutes(10);
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
                Ok(_) => (token, expires_at),
                Err(err) => {
                    telemetry::log_failure(
                        "client_secret_refresh_failed",
                        Some(body.session_id),
                        &format!("{:?}", err),
                    );
                    return StatusCode::BAD_REQUEST.into_response();
                }
            }
        } else {
            reused = true;
            (existing_secret.token, existing_secret.expires_at)
        }
    } else {
        let token = format!("client_secret_{}", Uuid::new_v4());
        let expires_at = Utc::now() + Duration::minutes(10);
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
            Ok(_) => (token, expires_at),
            Err(err) => {
                telemetry::log_failure(
                    "client_secret_issue_failed",
                    Some(body.session_id),
                    &format!("{:?}", err),
                );
                return StatusCode::BAD_REQUEST.into_response();
            }
        }
    };

    info!(
        "issuing client secret for session {} ({})",
        body.session_id,
        if reused { "reused" } else { "refreshed" }
    );
    telemetry::log_recovery(
        "client_secret_issued",
        Some(body.session_id),
        if reused { "reused_valid_token" } else { "new_token" },
    );

    (
        StatusCode::OK,
        Json(RealtimeSessionResponse {
            client_secret: token,
            expires_at: expires_at.to_rfc3339(),
            session_id: body.session_id,
        }),
    )
        .into_response()
}
