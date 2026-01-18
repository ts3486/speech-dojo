# Query Audit Notes

- Topics now fetched via TanStack Query (key: `["topics"]`, staleTime 30s) reused by Home and Session pages.
- History list uses TanStack Query (key: `["sessions"]`, staleTime 15s, retry disabled for faster error surfacing).
- Session detail uses TanStack Query (key: `["session", id]`, retry disabled).
- QueryClient defaults: staleTime 30s, refetchOnWindowFocus false, retry 1; overridden to `retry: false` on error-sensitive queries.
- Mutations (session create/upload/finalize) remain imperative fetches; cache updated on delete via `queryClient.setQueryData`.
