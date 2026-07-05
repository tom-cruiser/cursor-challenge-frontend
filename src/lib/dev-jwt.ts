import * as jose from "jose";
import { config } from "@/lib/config";

/**
 * Mint a Supabase-compatible HS256 JWT for local mock auth.
 * Mirrors cursor-challenge-backend/scripts/generate-dev-jwt.ts.
 */
export async function mintDevJwt(phone: string, hours = 24): Promise<string> {
  const secret = config.devJwtSecret;
  if (!secret) {
    throw new Error(
      "VITE_DEV_JWT_SECRET is not set. Copy SUPABASE_JWT_SECRET from the backend .env for local mock auth.",
    );
  }

  if (!phone.startsWith("+")) {
    throw new Error("Dev JWT phone must be in E.164 format (e.g. +250780000001).");
  }

  const now = Math.floor(Date.now() / 1000);
  return new jose.SignJWT({
    phone,
    role: "authenticated",
    user_metadata: { phone },
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(phone)
    .setIssuedAt(now)
    .setExpirationTime(now + hours * 3600)
    .setAudience("authenticated")
    .sign(new TextEncoder().encode(secret));
}
