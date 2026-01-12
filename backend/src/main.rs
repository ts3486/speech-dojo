use axum::Router;
use backend::api;
use backend::services::storage::StorageService;
use backend::state::AppState;
use backend::telemetry;
use sqlx::postgres::PgPoolOptions;
use std::net::SocketAddr;
use std::time::Duration;
use tracing::info;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();
    telemetry::init_tracing();

    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .acquire_timeout(Duration::from_secs(5))
        .connect(&database_url)
        .await?;

    // Ensure migrations run at startup.
    sqlx::migrate!("./migrations").run(&pool).await?;

    let storage = StorageService::from_env().await?;

    let state = AppState::new(pool, storage);
    let app: Router = api::router(state);

    let addr: SocketAddr = std::env::var("BIND_ADDR")
        .unwrap_or_else(|_| "0.0.0.0:8000".into())
        .parse()
        .expect("Invalid BIND_ADDR");

    info!("Listening on {}", addr);
    axum::serve(tokio::net::TcpListener::bind(addr).await?, app).await?;
    Ok(())
}
