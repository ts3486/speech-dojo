use axum::body::{self, Body};
use axum::http::{Method, Request, StatusCode};
use axum::Router;
use backend::api;
use backend::models::audio_recording::NewAudioRecording;
use backend::models::topic::NewTopic;
use backend::models::transcript::{upsert_transcript, TranscriptSegment};
use backend::services::storage::StorageService;
use backend::state::AppState;
use dotenvy::dotenv;
use serde_json::Value;
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
        title: format!("History Topic {}", Uuid::new_v4()),
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

async fn insert_session(pool: &PgPool, user: Uuid, topic_id: Uuid) -> Uuid {
    sqlx::query(
        r#"
        INSERT INTO sessions (user_id, topic_id, status)
        VALUES ($1, $2, 'ended')
        RETURNING id
        "#,
    )
    .bind(user)
    .bind(topic_id)
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
async fn list_and_detail_sessions_include_audio_and_transcript() {
    let pool = test_pool().await;
    let topic_id = insert_topic(&pool).await;
    let user = Uuid::new_v4();
    let session_id = insert_session(&pool, user, topic_id).await;

    // add audio record
    backend::models::audio_recording::AudioRecording::insert(
        &pool,
        NewAudioRecording {
            session_id,
            storage_url: "http://example.com/audio.webm".into(),
            duration_seconds: Some(5),
            mime_type: Some("audio/webm".into()),
            size_bytes: None,
            quality_status: None,
        },
    )
    .await
    .unwrap();

    // add transcript
    let segments = vec![TranscriptSegment {
        speaker: "user".into(),
        text: "hello history".into(),
        start_ms: 0,
        end_ms: 1000,
    }];
    upsert_transcript(&pool, session_id, true, &segments)
        .await
        .unwrap();

    let app = test_app(pool.clone()).await;

    // list
    let list_req = Request::builder()
        .method(Method::GET)
        .uri("/api/sessions")
        .header("x-user-id", user.to_string())
        .body(Body::empty())
        .unwrap();
    let list_resp = app.clone().oneshot(list_req).await.unwrap();
    assert_eq!(list_resp.status(), StatusCode::OK);
    let list_body = read_json(list_resp).await;
    let sessions = list_body["sessions"].as_array().unwrap();
    assert_eq!(sessions.len(), 1);
    assert_eq!(sessions[0]["id"].as_str(), Some(session_id.to_string().as_str()));
    assert_eq!(sessions[0]["has_audio"], true);
    assert_eq!(sessions[0]["has_transcript"], true);

    // detail
    let detail_req = Request::builder()
        .method(Method::GET)
        .uri(&format!("/api/sessions/{session_id}"))
        .header("x-user-id", user.to_string())
        .body(Body::empty())
        .unwrap();
    let detail_resp = app.clone().oneshot(detail_req).await.unwrap();
    assert_eq!(detail_resp.status(), StatusCode::OK);
    let detail_body = read_json(detail_resp).await;
    let session = detail_body
        .get("session")
        .or_else(|| detail_body.get("session_detail"))
        .unwrap();
    assert_eq!(session["audio_url"].as_str(), Some("http://example.com/audio.webm"));
    assert_eq!(
        session["transcript"].as_array().unwrap()[0]["text"].as_str(),
        Some("hello history")
    );
}

#[tokio::test]
async fn delete_session_removes_record() {
    let pool = test_pool().await;
    let topic_id = insert_topic(&pool).await;
    let user = Uuid::new_v4();
    let session_id = insert_session(&pool, user, topic_id).await;

    let app = test_app(pool.clone()).await;

    let delete_req = Request::builder()
        .method(Method::DELETE)
        .uri(&format!("/api/sessions/{session_id}"))
        .header("x-user-id", user.to_string())
        .body(Body::empty())
        .unwrap();
    let delete_resp = app.clone().oneshot(delete_req).await.unwrap();
    assert_eq!(delete_resp.status(), StatusCode::NO_CONTENT);

    let reget = sqlx::query("SELECT count(*) FROM sessions WHERE id = $1")
        .bind(session_id)
        .fetch_one(&pool)
        .await
        .unwrap();
    let remaining: i64 = reget.get(0);
    assert_eq!(remaining, 0);
}
