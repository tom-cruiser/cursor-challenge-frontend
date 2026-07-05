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

export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "/api/v1",
  supabaseUrl,
  supabaseAnonKey,
  /** HS256 secret for minting dev JWTs when useMockAuth is true (local only). */
  devJwtSecret: import.meta.env.VITE_DEV_JWT_SECRET ?? "",
  /** When true, login/register use local demo email/password instead of Supabase phone OTP. */
  useMockAuth: mockAuthRequested || !supabaseConfigured,
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
