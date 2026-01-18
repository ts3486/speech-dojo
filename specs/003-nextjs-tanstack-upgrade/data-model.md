# Data Model: Upgrade Next.js + TanStack

**Feature**: specs/003-nextjs-tanstack-upgrade  
**Date**: 2026-01-17  
**Scope**: Frontend dependency upgrade only; no new domain entities or schema changes.

## Entities

- No changes. Existing application entities (topics, sessions, transcripts, history records) remain unchanged and are owned by the backend.

## Relationships

- Unchanged; frontend continues to consume existing APIs.

## Validation Rules

- Unchanged; ensure client-side validation logic (if any) continues to run without behavioral change post-upgrade.

## Notes

- Keep query cache keys stable to avoid accidental cache fragmentation during the upgrade.
