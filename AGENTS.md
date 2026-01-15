# speech-dojo Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-11

## Active Technologies
- Frontend TypeScript (React/Vite); Backend Rust (stable, Axum/Tokio) + React, Vite, Tailwind/CSS modules; Axum, SQLx, Chrono, UUID; S3 SDK; OpenAI Realtime client-secret minting (server-side) (001-design-refresh)
- PostgreSQL 15+ for topics/sessions/transcripts/client_secrets/audio_recordings; S3-compatible bucket for audio blobs (001-design-refresh)
- Frontend TypeScript (React/Vite); Backend Rust (stable, Axum/Tokio) + React, Vite, Tailwind/CSS modules; existing OpenAI Realtime client-secret flow; Axum, SQLx, Chrono, UUID; S3 SDK (unchanged) (002-design-refresh)
- PostgreSQL 15+ for topics/sessions/transcripts/client_secrets/audio_recordings; S3-compatible bucket for audio blobs (no change) (002-design-refresh)

- Frontend TypeScript (React), Backend Rust (Axum, Tokio), Postgres 15+ + React, Tailwind CSS, WebRTC, OpenAI Realtime (gpt-realtime-mini), Axum, SQLx (or equivalent), S3-compatible SDK (001-speaking-practice)

## Project Structure

```text
src/
tests/
```

## Commands

cargo test [ONLY COMMANDS FOR ACTIVE TECHNOLOGIES][ONLY COMMANDS FOR ACTIVE TECHNOLOGIES] cargo clippy

## Code Style

Frontend TypeScript (React), Backend Rust (Axum, Tokio), Postgres 15+: Follow standard conventions

## Recent Changes
- 002-design-refresh: Added Frontend TypeScript (React/Vite); Backend Rust (stable, Axum/Tokio) + React, Vite, Tailwind/CSS modules; existing OpenAI Realtime client-secret flow; Axum, SQLx, Chrono, UUID; S3 SDK (unchanged)
- 001-design-refresh: Added Frontend TypeScript (React/Vite); Backend Rust (stable, Axum/Tokio) + React, Vite, Tailwind/CSS modules; Axum, SQLx, Chrono, UUID; S3 SDK; OpenAI Realtime client-secret minting (server-side)

- 001-speaking-practice: Added Frontend TypeScript (React), Backend Rust (Axum, Tokio), Postgres 15+ + React, Tailwind CSS, WebRTC, OpenAI Realtime (gpt-realtime-mini), Axum, SQLx (or equivalent), S3-compatible SDK

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
