# Speech Dojo

A browser-based realtime speaking practice application. Users select a topic and have a live voice conversation with an AI coach to improve their English speaking skills.

## Features

- **Realtime voice sessions** — WebRTC connection to OpenAI Realtime API with live listening/speaking status
- **Topic selection** — Predefined topics with difficulty levels and AI prompt hints
- **Session history** — Browse past sessions with full transcripts and audio playback
- **Audio recording** — Sessions are recorded and stored for later review
- **Resilient sessions** — Handles network failures and token expiration without data loss

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 18, TanStack Query v5, Tailwind CSS 4 |
| Backend | Rust, Axum 0.7, SQLx, Tokio |
| Database | PostgreSQL 16 |
| Object Storage | MinIO (S3-compatible) |
| Infrastructure | Docker Compose |

## Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- [Rust](https://rustup.rs/) (stable)
- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)

## Setup

### 1. Start infrastructure

```bash
docker-compose up -d
```

This starts PostgreSQL on port `5432` and MinIO on ports `9000` (API) and `9001` (web console).

### 2. Configure the backend

Create `backend/.env`:

```env
DATABASE_URL=postgres://admin:admin@localhost:5432/speech_dojo
S3_BUCKET=speech-dojo-audio
S3_ENDPOINT=http://127.0.0.1:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_REGION=us-east-1
S3_FORCE_PATH_STYLE=true
OPENAI_SECRET_KEY=sk-proj-...
RUST_LOG=info
```

### 3. Configure the frontend

Create `frontend/.env`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_REALTIME_ENABLED=true
NEXT_PUBLIC_REALTIME_MODEL=gpt-realtime-mini
```

### 4. Run the backend

Database migrations run automatically on startup.

```bash
cd backend
cargo run
```

The API server starts on `http://localhost:8000`.

### 5. Run the frontend

```bash
cd frontend
pnpm install
pnpm dev
```

The app is available at `http://localhost:3000`.

## Project Structure

```
speech-dojo/
├── backend/              # Rust/Axum REST API
│   ├── src/
│   │   ├── api/          # Route handlers (sessions, topics, realtime)
│   │   ├── models/       # Database models
│   │   ├── services/     # Business logic (storage, history, transcription)
│   │   └── main.rs       # Entry point
│   └── migrations/       # SQL migrations
├── frontend/             # Next.js app
│   └── src/
│       ├── pages/        # Page components (home, session, history)
│       ├── components/   # Reusable UI components
│       ├── services/     # API client, realtime, recorder
│       └── providers/    # TanStack Query setup
├── specs/                # Feature specifications
└── docker-compose.yaml   # PostgreSQL + MinIO
```

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/topics` | List available topics |
| `POST` | `/api/sessions` | Create a new session |
| `GET` | `/api/sessions` | List user's sessions |
| `GET` | `/api/sessions/:id` | Get session details |
| `POST` | `/api/sessions/:id/upload` | Upload audio recording |
| `POST` | `/api/sessions/:id/finalize` | Finalize a session |
| `DELETE` | `/api/sessions/:id` | Delete a session |
| `POST` | `/api/realtime/session` | Mint a short-lived OpenAI Realtime token |

Authentication uses a simple `x-user-id` header (demo user: `00000000-0000-0000-0000-000000000001`).

## Testing

```bash
# Frontend
cd frontend && pnpm test

# Backend
cd backend && cargo test
```
