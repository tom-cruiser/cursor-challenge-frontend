const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

function isPlaceholderSupabaseValue(value: string): boolean {
  if (!value) return true;
  const lower = value.toLowerCase();
  return value.includes("YOUR_") || lower.includes("placeholder");
}

function areSupabaseCredentialsValid(url: string, anonKey: string): boolean {
  return !isPlaceholderSupabaseValue(url) && !isPlaceholderSupabaseValue(anonKey);
}

export function isSupabaseConfigured(): boolean {
  return areSupabaseCredentialsValid(supabaseUrl, supabaseAnonKey);
}

const mockAuthRequested = import.meta.env.VITE_USE_MOCK_AUTH === "true";
const supabaseConfigured = areSupabaseCredentialsValid(supabaseUrl, supabaseAnonKey);

const backendUrl = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000";

function deriveWebSocketUrl(backend: string): string {
  const url = new URL(backend);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/ws/hospitals";
  url.search = "";
  url.hash = "";
  return url.toString();
}

const wsUrl =
  import.meta.env.VITE_WS_URL ??
  import.meta.env.VITE_WS_HOSPITALS_URL ??
  deriveWebSocketUrl(backendUrl);

export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "/api/v1",
  backendUrl,
  wsUrl,
  supabaseUrl,
  supabaseAnonKey,
  /** HS256 secret for minting dev JWTs when useMockAuth is true (local only). */
  devJwtSecret: import.meta.env.VITE_DEV_JWT_SECRET ?? "",
  /** When true, login/register use local demo email/password instead of Supabase phone OTP. */
  useMockAuth: mockAuthRequested || !supabaseConfigured,
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "",
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY ?? "",
  },
  defaultCountry: "Rwanda",
  defaultLocation: {
    label: "Kigali, Rwanda",
    latitude: -1.9441,
    longitude: 30.0619,
  },
} as const;

export function isApiConfigured(): boolean {
  return Boolean(config.apiBaseUrl);
}

/** WebSocket URL for live hospital create/update events from the backend. */
export function getHospitalWebSocketUrl(): string {
  if (config.wsUrl) {
    return config.wsUrl;
  }

  if (import.meta.env.DEV) {
    return deriveWebSocketUrl(config.backendUrl);
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws/hospitals`;
}
