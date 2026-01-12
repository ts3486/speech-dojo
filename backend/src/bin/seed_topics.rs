use backend::models::topic::{NewTopic, Topic};
use dotenvy::dotenv;
use sqlx::postgres::PgPoolOptions;
use std::fs;
use std::time::Duration;
use tracing::info;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();
    backend::telemetry::init_tracing();

    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .acquire_timeout(Duration::from_secs(5))
        .connect(&database_url)
        .await?;

    sqlx::migrate!("./migrations").run(&pool).await?;

    let fixture_path = std::env::var("TOPICS_FIXTURE").unwrap_or_else(|_| "backend/fixtures/topics.json".into());
    let data = fs::read_to_string(&fixture_path)
        .map_err(|e| anyhow::anyhow!("failed to read fixture {}: {}", fixture_path, e))?;
    let topics: Vec<NewTopic> = serde_json::from_str(&data)?;

    Topic::insert_many(&pool, &topics).await?;

    info!("Seeded {} topics", topics.len());
    Ok(())
}
