/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_BACKEND_URL: string;
  readonly VITE_WS_URL: string;
  /** @deprecated use VITE_WS_URL */
  readonly VITE_WS_HOSPITALS_URL: string;
  readonly VITE_USE_MOCK_AUTH: string;
  readonly VITE_DEV_JWT_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
