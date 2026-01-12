use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::{async_trait, extract::FromRequestParts};
use std::fmt;
use uuid::Uuid;

#[derive(Clone, Debug)]
pub struct CurrentUser(pub Uuid);

#[derive(Debug)]
pub struct AuthError(pub &'static str);

impl IntoResponse for AuthError {
    fn into_response(self) -> axum::response::Response {
        (StatusCode::UNAUTHORIZED, self.0).into_response()
    }
}

impl fmt::Display for AuthError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl std::error::Error for AuthError {}

#[async_trait]
impl<S> FromRequestParts<S> for CurrentUser
where
    S: Send + Sync,
{
    type Rejection = AuthError;

    async fn from_request_parts(
        parts: &mut axum::http::request::Parts,
        _state: &S,
    ) -> Result<Self, Self::Rejection> {
        let user_header = parts
            .headers
            .get("x-user-id")
            .and_then(|h| h.to_str().ok())
            .ok_or(AuthError("missing x-user-id header"))?;

        let user_id = Uuid::parse_str(user_header).map_err(|_| AuthError("invalid x-user-id"))?;
        Ok(CurrentUser(user_id))
    }
}
