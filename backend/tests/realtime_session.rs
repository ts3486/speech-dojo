use axum::body::{self, Body};
use axum::http::{Method, Request, StatusCode};
use backend::models::topic::NewTopic;
use serde_json::json;
use sqlx::{PgPool, Row};
use sqlx::postgres::PgPoolOptions;
use tower::util::ServiceExt;
use uuid::Uuid;

use backend::api;
use backend::services::storage::StorageService;
use backend::state::AppState;
use axum::Router;
use dotenvy::dotenv;

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
        title: format!("Realtime Topic {}", Uuid::new_v4()),
        difficulty: None,
        prompt_hint: None,
    };
    sqlx::query("INSERT INTO topics (title) VALUES ($1) RETURNING id")
        .bind(&topic.title)
        .fetch_one(pool)
        .await
        .unwrap()
        .get::<Uuid, _>(0)
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
async fn realtime_session_returns_secret() {
    let pool = test_pool().await;
    let topic_id = insert_topic(&pool).await;
    let app = test_app(pool.clone()).await;
    let user = Uuid::new_v4();

    // Create session first
    let create_req = Request::builder()
        .method(Method::POST)
        .uri("/api/sessions")
        .header("content-type", "application/json")
        .header("x-user-id", user.to_string())
        .body(Body::from(json!({ "topic_id": topic_id }).to_string()))
        .unwrap();
    let create_resp = app.clone().oneshot(create_req).await.unwrap();
    assert_eq!(create_resp.status(), StatusCode::CREATED);
    let bytes = body::to_bytes(create_resp.into_body(), usize::MAX)
        .await
        .unwrap();
    let created: serde_json::Value = serde_json::from_slice(&bytes).unwrap();
    let session_id = created["id"].as_str().unwrap();

    let req = Request::builder()
        .method(Method::POST)
        .uri("/api/realtime/session")
        .header("content-type", "application/json")
        .header("x-user-id", user.to_string())
        .body(Body::from(json!({ "session_id": session_id }).to_string()))
        .unwrap();

    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body_bytes = body::to_bytes(resp.into_body(), usize::MAX)
        .await
        .unwrap();
    let body: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();
    assert!(body["client_secret"].as_str().is_some());
    assert_eq!(body["session_id"].as_str(), Some(session_id));
}
