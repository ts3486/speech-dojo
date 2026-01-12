use axum::body::{self, Body};
use axum::http::{Method, Request, StatusCode};
use axum::Router;
use backend::api;
use backend::models::topic::NewTopic;
use backend::services::storage::StorageService;
use backend::state::AppState;
use dotenvy::dotenv;
use serde_json::{json, Value};
use sqlx::{PgPool, Row};
use sqlx::postgres::PgPoolOptions;
use tower::util::ServiceExt;
use uuid::Uuid;

async fn test_app(pool: PgPool) -> Router {
    std::env::set_var("S3_BUCKET", "test-bucket");
    std::env::set_var("S3_ENDPOINT", "http://localhost:9000");
    std::env::set_var("S3_ACCESS_KEY", "test");
    std::env::set_var("S3_SECRET_KEY", "test");
    let storage = StorageService::from_env().await.expect("storage");
    let state = AppState::new(pool, storage);
    api::router(state)
}

async fn insert_topic(pool: &PgPool) -> Uuid {
    let topic = NewTopic {
        title: format!("Test Topic {}", Uuid::new_v4()),
        difficulty: Some("easy".into()),
        prompt_hint: Some("hint".into()),
    };
    sqlx::query(
        r#"
        INSERT INTO topics (title, difficulty, prompt_hint)
        VALUES ($1, $2, $3)
        RETURNING id
        "#,
    )
    .bind(&topic.title)
    .bind(&topic.difficulty)
    .bind(&topic.prompt_hint)
    .fetch_one(pool)
    .await
    .unwrap()
    .get::<Uuid, _>(0)
}

async fn read_json(res: axum::response::Response) -> Value {
    let bytes = body::to_bytes(res.into_body(), usize::MAX).await.unwrap();
    serde_json::from_slice(&bytes).unwrap()
}

async fn test_pool() -> PgPool {
    dotenv().ok();
    let url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set for tests");
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&url)
        .await
        .expect("connect db");
    sqlx::migrate!("./migrations").run(&pool).await.unwrap();
    sqlx::query("TRUNCATE client_secrets, transcripts, audio_recordings, sessions, topics RESTART IDENTITY CASCADE")
        .execute(&pool)
        .await
        .unwrap();
    pool
}

#[tokio::test]
async fn create_session_returns_201() {
    let pool = test_pool().await;
    let topic_id = insert_topic(&pool).await;
    let app = test_app(pool.clone()).await;
    let user = Uuid::new_v4();

    let req = Request::builder()
        .method(Method::POST)
        .uri("/api/sessions")
        .header("content-type", "application/json")
        .header("x-user-id", user.to_string())
        .body(Body::from(json!({ "topic_id": topic_id }).to_string()))
        .unwrap();

    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::CREATED);

    let body = read_json(resp).await;
    assert_eq!(
        body.get("topic_id").and_then(Value::as_str),
        Some(topic_id.to_string().as_str())
    );
    assert_eq!(
        body.get("user_id").and_then(Value::as_str),
        Some(user.to_string().as_str())
    );
    assert_eq!(
        body.get("status").and_then(Value::as_str),
        Some("active")
    );
}
