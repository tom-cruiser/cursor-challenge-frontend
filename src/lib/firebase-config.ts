import { config } from "@/lib/config";

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  const lower = value.toLowerCase();
  return value.includes("YOUR_") || lower.includes("placeholder") || lower.includes("your-");
}

/** True when all required VITE_FIREBASE_* env vars are set. Does not import firebase SDK. */
export function isFirebaseConfigured(): boolean {
  return (
    !isPlaceholder(config.firebase.apiKey) &&
    !isPlaceholder(config.firebase.projectId) &&
    !isPlaceholder(config.firebase.messagingSenderId) &&
    !isPlaceholder(config.firebase.appId) &&
    !isPlaceholder(config.firebase.vapidKey)
  );
}
