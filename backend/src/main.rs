use axum::Router;
use backend::api;
use backend::models::topic::{NewTopic, Topic};
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

    // Seed preset topics (idempotent upsert on title).
    let preset: Vec<NewTopic> = vec![
        NewTopic {
            title: "Introduce Yourself".into(),
            difficulty: Some("beginner".into()),
            prompt_hint: Some("Talk about who you are, where you're from, and what you do".into()),
            category: Some("solo".into()),
            system_prompt: Some(
                "You are a supportive speech coach helping the learner practice introducing themselves. \
                Listen attentively without interrupting while they speak. After the learner pauses for \
                3 seconds or indicates they are done, provide concise, encouraging feedback (no longer \
                than 60 seconds when read aloud). Comment on clarity, confidence, and what they did \
                well before suggesting one or two specific improvements.".into(),
            ),
        },
        NewTopic {
            title: "Describe Your Ideal Day".into(),
            difficulty: Some("beginner".into()),
            prompt_hint: Some("Paint a picture of a perfect day from morning to night".into()),
            category: Some("solo".into()),
            system_prompt: Some(
                "You are a supportive speech coach helping the learner practice descriptive storytelling. \
                Listen without interrupting while they paint a picture of their ideal day. After the \
                learner pauses for 3 seconds or indicates they are done, provide concise, encouraging \
                feedback (no longer than 60 seconds when read aloud). Highlight vivid details they used, \
                note the flow of their narrative, and offer one or two specific suggestions to make the \
                description even more engaging.".into(),
            ),
        },
        NewTopic {
            title: "Talk About a Hobby".into(),
            difficulty: Some("beginner".into()),
            prompt_hint: Some("Explain a hobby you love and why it matters to you".into()),
            category: Some("solo".into()),
            system_prompt: Some(
                "You are a supportive speech coach helping the learner practice speaking about a personal \
                interest. Listen without interrupting while they describe their hobby. After the learner \
                pauses for 3 seconds or indicates they are done, provide concise, encouraging feedback \
                (no longer than 60 seconds when read aloud). Praise genuine enthusiasm and any concrete \
                examples they gave, then suggest one or two ways to make the explanation clearer or more \
                compelling for a listener who knows nothing about the hobby.".into(),
            ),
        },
        NewTopic {
            title: "Job Interview Practice".into(),
            difficulty: Some("intermediate".into()),
            prompt_hint: Some("Practice answering common interview questions with a mock interviewer".into()),
            category: Some("interactive".into()),
            system_prompt: Some(
                "You are a professional job interviewer conducting a mock interview. Start by introducing \
                yourself briefly and asking a standard opening question such as 'Tell me about yourself.' \
                Listen actively, ask natural follow-up questions, and keep the conversation flowing like \
                a real interview. Maintain a friendly but professional tone. After the learner indicates \
                they want to end the session or after roughly 5 exchanges, step out of character and give \
                constructive feedback on their answers: what came across well, what could be clearer, and \
                tips for handling pressure questions.".into(),
            ),
        },
        NewTopic {
            title: "Small Talk at a Party".into(),
            difficulty: Some("beginner".into()),
            prompt_hint: Some("Practice light, friendly conversation with a fellow party guest".into()),
            category: Some("interactive".into()),
            system_prompt: Some(
                "You are a friendly fellow guest at a casual social gathering. Strike up a natural \
                conversation — comment on the event, ask how the learner knows the host, share a light \
                anecdote, and keep things warm and relaxed. Respond naturally to whatever the learner \
                says, introduce new small-talk topics if the conversation stalls, and mirror the energy \
                they bring. After the learner wraps up or after roughly 5 exchanges, gently step out of \
                character and offer brief feedback on their conversational flow, listening skills, and \
                how naturally they transitioned between topics.".into(),
            ),
        },
        NewTopic {
            title: "Asking for Directions".into(),
            difficulty: Some("beginner".into()),
            prompt_hint: Some("Practice asking a local for directions to a nearby landmark".into()),
            category: Some("interactive".into()),
            system_prompt: Some(
                "You are a helpful local resident standing on a street corner. When the learner \
                approaches, respond naturally to their request for directions. Give realistic, slightly \
                detailed directions (include landmarks and turns). If their question is unclear, ask for \
                clarification just as a real person would. Keep the interaction feeling authentic. After \
                the learner thanks you and ends the conversation, step out of character and provide short \
                feedback on how clearly they asked, how well they confirmed understanding, and any polite \
                phrases that worked especially well or could be improved.".into(),
            ),
        },
    ];
    Topic::insert_many(&pool, &preset).await?;
    info!("Seeded {} preset topics", preset.len());

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
