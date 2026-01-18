# speech-dojo Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-11

## Active Technologies
- Frontend TypeScript (React/Vite); Backend Rust (stable, Axum/Tokio) + React, Vite, Tailwind/CSS modules; Axum, SQLx, Chrono, UUID; S3 SDK; OpenAI Realtime client-secret minting (server-side) (001-design-refresh)
- PostgreSQL 15+ for topics/sessions/transcripts/client_secrets/audio_recordings; S3-compatible bucket for audio blobs (001-design-refresh)
- Frontend TypeScript (React/Vite); Backend Rust (stable, Axum/Tokio) + React, Vite, Tailwind/CSS modules; existing OpenAI Realtime client-secret flow; Axum, SQLx, Chrono, UUID; S3 SDK (unchanged) (002-design-refresh)
- PostgreSQL 15+ for topics/sessions/transcripts/client_secrets/audio_recordings; S3-compatible bucket for audio blobs (no change) (002-design-refresh)
- Frontend TypeScript (React/Vite), Backend Rust (stable/Axum) + React, Vite, Tailwind, Vitest; Rust Axum/Tokio, SQLx; WebRTC/OpenAI Realtime client secrets; S3 SDK (003-nextjs-tanstack-upgrade)
- PostgreSQL for sessions/topics/transcripts/client_secrets/audio metadata; S3-compatible bucket for audio blobs (003-nextjs-tanstack-upgrade)
- TypeScript 5.x; React 18+; Next.js latest stable (current v15.x line); TanStack Query v5 lates + Next.js app router, React, TanStack Query, Tailwind/PostCSS pipeline, Vite-era tooling to be aligned with Next (if present) (003-nextjs-tanstack-upgrade)
- N/A (frontend-only upgrade; backend unchanged) (003-nextjs-tanstack-upgrade)

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
- 003-nextjs-tanstack-upgrade: Added TypeScript 5.x; React 18+; Next.js latest stable (current v15.x line); TanStack Query v5 lates + Next.js app router, React, TanStack Query, Tailwind/PostCSS pipeline, Vite-era tooling to be aligned with Next (if present)
- 003-nextjs-tanstack-upgrade: Added Frontend TypeScript (React/Vite), Backend Rust (stable/Axum) + React, Vite, Tailwind, Vitest; Rust Axum/Tokio, SQLx; WebRTC/OpenAI Realtime client secrets; S3 SDK
- 003-nextjs-tanstack-upgrade: Added [if applicable, e.g., PostgreSQL, CoreData, files or N/A]


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
