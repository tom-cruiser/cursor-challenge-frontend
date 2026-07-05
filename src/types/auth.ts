export type UserRole = "parent" | "admin";

export type ReminderChannel = "sms" | "email" | "in_app";

export interface ReminderChannels {
  sms: boolean;
  email: boolean;
  inApp: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  initials: string;
  organization?: string;
  phone?: string;
  reminderChannels?: ReminderChannels;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  organization?: string;
  phone?: string;
  country?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  reminderChannels?: ReminderChannels;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface PhoneLoginInput {
  phone: string;
  otp: string;
}

export interface StoredAccount extends AuthUser {
  password: string;
}

export const REMINDER_CHANNEL_LABELS: Record<ReminderChannel, string> = {
  sms: "SMS",
  email: "Email",
  in_app: "In-app",
};

export const DEFAULT_REMINDER_CHANNELS: ReminderChannels = {
  sms: true,
  email: true,
  inApp: true,
};
