# API Contracts: Design Refresh

No new endpoints. UI redesign reuses existing APIs from speaking practice feature:
- GET /api/topics
- POST /api/sessions
- POST /api/realtime/session
- POST /api/sessions/{id}/upload
- POST /api/sessions/{id}/finalize
- GET /api/sessions
- GET /api/sessions/{id}
- DELETE /api/sessions/{id}

Contract behavior remains unchanged; redesign must not introduce client-side secrets or alter request/response shapes.
