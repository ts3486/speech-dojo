use tracing::{info, warn};
use tracing_subscriber::{fmt, layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};
use uuid::Uuid;

pub fn init_tracing() {
    let env_filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("info,sqlx=warn,aws_config=warn"));

    tracing_subscriber::registry()
        .with(env_filter)
        .with(fmt::layer())
        .init();
}

pub fn log_failure(event: &str, session_id: Option<Uuid>, reason: &str) {
    warn!(
        event,
        session_id = session_id.map(|id| id.to_string()),
        reason = reason,
        "resilience_failure"
    );
}

pub fn log_recovery(event: &str, session_id: Option<Uuid>, detail: &str) {
    info!(
        event,
        session_id = session_id.map(|id| id.to_string()),
        detail = detail,
        "resilience_recovery"
    );
}
