import { config } from "@/lib/config";

const TOKEN_KEY = "vaxreminder_access_token";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: string[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getAccessToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string | null): void {
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, auth = true, headers: customHeaders, ...rest } = options;

  const headers = new Headers(customHeaders);
  if (body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let payload: { error?: string; details?: string[] } | null = null;

  if (text) {
    try {
      payload = JSON.parse(text) as { error?: string; details?: string[] };
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const message = payload?.error ?? `Request failed (${response.status})`;
    console.error(`[API] ${options.method ?? "GET"} ${path} → ${response.status}: ${message}`);
    throw new ApiError(message, response.status, payload?.details);
  }

  return (payload ?? {}) as T;
}
