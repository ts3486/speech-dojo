/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_REALTIME_ENABLED?: string;
  readonly VITE_REALTIME_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
