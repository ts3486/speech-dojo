use axum::body::{self, Body};
use axum::http::{Method, Request, StatusCode};
use axum::Router;
use backend::api;
use backend::models::topic::NewTopic;
use backend::services::storage::StorageService;
use backend::state::AppState;
use chrono::{Duration, Utc};
use dotenvy::dotenv;
use serde_json::{json, Value};
use sqlx::postgres::PgPoolOptions;
use sqlx::{PgPool, Row};
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
        title: format!("Realtime Refresh {}", Uuid::new_v4()),
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
async fn refreshes_expired_secret_and_updates_status() {
    let pool = test_pool().await;
    let topic_id = insert_topic(&pool).await;
    let app = test_app(pool.clone()).await;
    let user = Uuid::new_v4();

    // create session
    let create_req = Request::builder()
        .method(Method::POST)
        .uri("/api/sessions")
        .header("content-type", "application/json")
        .header("x-user-id", user.to_string())
        .body(Body::from(json!({ "topic_id": topic_id }).to_string()))
        .unwrap();
    let create_resp = app.clone().oneshot(create_req).await.unwrap();
    assert_eq!(create_resp.status(), StatusCode::CREATED);
    let created = read_json(create_resp).await;
    let session_id = created["id"].as_str().unwrap().to_string();

    // initial secret
    let mint_req = Request::builder()
        .method(Method::POST)
        .uri("/api/realtime/session")
        .header("content-type", "application/json")
        .header("x-user-id", user.to_string())
        .body(Body::from(
            json!({ "session_id": session_id, "status": "active" }).to_string(),
        ))
        .unwrap();
    let mint_resp = app.clone().oneshot(mint_req).await.unwrap();
    assert_eq!(mint_resp.status(), StatusCode::OK);
    let mint_body = read_json(mint_resp).await;
    let first_secret = mint_body["client_secret"].as_str().unwrap().to_string();
    let first_expiry = mint_body["expires_at"].as_str().unwrap();
    assert!(chrono::DateTime::parse_from_rfc3339(first_expiry).is_ok());

    // reuse valid secret (no force refresh)
    let reuse_req = Request::builder()
        .method(Method::POST)
        .uri("/api/realtime/session")
        .header("content-type", "application/json")
        .header("x-user-id", user.to_string())
        .body(Body::from(json!({ "session_id": session_id }).to_string()))
        .unwrap();
    let reuse_resp = app.clone().oneshot(reuse_req).await.unwrap();
    assert_eq!(reuse_resp.status(), StatusCode::OK);
    let reuse_body = read_json(reuse_resp).await;
    assert_eq!(
        reuse_body["client_secret"].as_str().unwrap(),
        first_secret
    );

    // expire and refresh
    sqlx::query("UPDATE client_secrets SET expires_at = $1 WHERE token = $2")
        .bind(Utc::now() - Duration::seconds(30))
        .bind(&first_secret)
        .execute(&pool)
        .await
        .unwrap();

    let refresh_req = Request::builder()
        .method(Method::POST)
        .uri("/api/realtime/session")
        .header("content-type", "application/json")
        .header("x-user-id", user.to_string())
        .body(Body::from(
            json!({ "session_id": session_id, "force_refresh": true, "status": "recovering" }).to_string(),
        ))
        .unwrap();
    let refresh_resp = app.clone().oneshot(refresh_req).await.unwrap();
    assert_eq!(refresh_resp.status(), StatusCode::OK);
    let refresh_body = read_json(refresh_resp).await;
    let refreshed_secret = refresh_body["client_secret"].as_str().unwrap();
    assert_ne!(refreshed_secret, first_secret);
    let refreshed_expiry = refresh_body["expires_at"].as_str().unwrap();
    let expiry_ts = chrono::DateTime::parse_from_rfc3339(refreshed_expiry)
        .unwrap()
        .with_timezone(&chrono::Utc);
    assert!(expiry_ts > chrono::Utc::now());

    let status_row: (String,) = sqlx::query_as("SELECT status FROM sessions WHERE id = $1")
        .bind(Uuid::parse_str(&session_id).unwrap())
        .fetch_one(&pool)
        .await
        .unwrap();
    assert_eq!(status_row.0, "recovering");
}
