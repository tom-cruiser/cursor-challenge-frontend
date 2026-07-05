import { ApiError, setAccessToken } from "@/lib/api/client";
import * as hospitalApi from "@/lib/api/hospital";
import { mapUserToAuthUser } from "@/lib/api/mappers";
import * as parentApi from "@/lib/api/parent";
import { config } from "@/lib/config";
import { mintDevJwt } from "@/lib/dev-jwt";
import { getSupabase, isSupabaseAvailable } from "@/lib/supabase";
import {
  getDemoCredentials,
  getSession,
  loginUser as mockLogin,
  logoutUser as mockLogout,
  registerUser as mockRegister,
  setSession,
} from "@/data/authStore";
import type { AuthUser, LoginInput, RegisterInput, UserRole } from "@/types/auth";

export { getDemoCredentials };

async function ensureMockAccessToken(user: AuthUser): Promise<void> {
  if (!config.useMockAuth) {
    return;
  }

  const phone = user.phone?.trim();
  if (!phone) {
    throw new Error("Demo account is missing a phone number for API authentication.");
  }

  const token = await mintDevJwt(phone);
  setAccessToken(token);
}

function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.startsWith("+")) {
    return trimmed;
  }

  const digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("250")) {
    return `+${digits}`;
  }

  return `+${digits}`;
}

export async function sendPhoneOtp(phone: string): Promise<void> {
  if (!isSupabaseAvailable()) {
    throw new Error("Phone OTP requires Supabase configuration.");
  }

  const supabase = getSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    phone: normalizePhone(phone),
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function verifyPhoneOtp(phone: string, token: string): Promise<string> {
  if (!isSupabaseAvailable()) {
    throw new Error("Phone OTP requires Supabase configuration.");
  }

  const supabase = getSupabase();
  const { data, error } = await supabase.auth.verifyOtp({
    phone: normalizePhone(phone),
    token,
    type: "sms",
  });

  if (error || !data.session?.access_token) {
    throw new Error(error?.message ?? "Invalid verification code.");
  }

  setAccessToken(data.session.access_token);
  return data.session.access_token;
}

async function resolveAuthUser(role: UserRole): Promise<AuthUser> {
  if (role === "parent") {
    try {
      const profile = await parentApi.getProfile();
      const authUser = mapUserToAuthUser(profile, "parent");
      setSession(authUser);
      return authUser;
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        throw new Error("This phone number is registered as a hospital account.");
      }
      throw error;
    }
  }

  try {
    const hospital = await hospitalApi.getProfile();
    const authUser: AuthUser = {
      id: hospital.owner_id,
      name: hospital.name,
      email: "",
      role: "admin",
      initials: hospital.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      organization: hospital.name,
      phone: hospital.help_phone ?? undefined,
    };
    setSession(authUser);
    return authUser;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new Error("No hospital is registered for this account. Please sign up first.");
    }
    if (error instanceof ApiError && error.status === 403) {
      throw new Error("This phone number is registered as a parent account.");
    }
    throw error;
  }
}

export async function loginWithOtp(
  phone: string,
  otp: string,
  role: UserRole,
): Promise<AuthUser> {
  if (config.useMockAuth) {
    throw new Error("Phone login requires Supabase configuration.");
  }

  await verifyPhoneOtp(phone, otp);
  return resolveAuthUser(role);
}

export async function registerWithOtp(
  input: RegisterInput,
  role: UserRole,
  otp: string,
): Promise<AuthUser> {
  if (config.useMockAuth) {
    throw new Error("Phone registration requires Supabase configuration.");
  }

  const phone = input.phone?.trim();
  if (!phone) {
    throw new Error("Phone number is required.");
  }

  await verifyPhoneOtp(phone, otp);

  if (role === "parent") {
    const profile = await parentApi.updateProfile({
      name: input.name.trim(),
      email: input.email.trim() || undefined,
      country: input.country?.trim() || config.defaultCountry,
    });
    const authUser = mapUserToAuthUser(profile, "parent");
    setSession(authUser);
    return authUser;
  }

  await hospitalApi.signup({
    name: input.organization?.trim() || input.name.trim(),
    address: input.address?.trim(),
    latitude: input.latitude ?? config.defaultLocation.latitude,
    longitude: input.longitude ?? config.defaultLocation.longitude,
    helpPhone: normalizePhone(phone),
    country: input.country?.trim() || config.defaultCountry,
    services: ["vaccination"],
  });

  return resolveAuthUser("admin");
}

async function syncMockSessionWithBackend(role: UserRole): Promise<AuthUser> {
  const session = getSession();
  if (!session) {
    throw new Error("Login failed — no session was created.");
  }

  await ensureMockAccessToken(session);

  try {
    const authUser = await resolveAuthUser(role);
    setSession(authUser);
    return authUser;
  } catch (error) {
    logout();
    throw error;
  }
}

export async function login(input: LoginInput, role: UserRole): Promise<AuthUser> {
  mockLogin(input, role);
  return syncMockSessionWithBackend(role);
}

export async function register(input: RegisterInput, role: UserRole): Promise<AuthUser> {
  mockRegister(input, role);
  return syncMockSessionWithBackend(role);
}

export function logout(): void {
  mockLogout();
  setAccessToken(null);

  if (isSupabaseAvailable()) {
    void getSupabase().auth.signOut();
  }
}

export async function restoreSession(): Promise<AuthUser | null> {
  const session = getSession();
  if (!session) {
    return null;
  }

  if (config.useMockAuth) {
    await ensureMockAccessToken(session);

    try {
      const authUser = await resolveAuthUser(session.role);
      setSession(authUser);
      return authUser;
    } catch (err) {
      console.warn("Session restored locally but backend profile sync failed:", err);
      return session;
    }
  }

  if (isSupabaseAvailable()) {
    const { data } = await getSupabase().auth.getSession();
    if (data.session?.access_token) {
      setAccessToken(data.session.access_token);
    }
  }

  return session;
}

export function isUsingMockAuth(): boolean {
  return config.useMockAuth;
}
