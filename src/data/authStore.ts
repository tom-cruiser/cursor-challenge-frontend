import type {
  AuthUser,
  LoginInput,
  RegisterInput,
  ReminderChannels,
  StoredAccount,
  UserRole,
} from "@/types/auth";
import { DEFAULT_REMINDER_CHANNELS } from "@/types/auth";

const USERS_KEY = "vaxreminder_users";
const SESSION_KEY = "vaxreminder_session";

/** Demo phones must match backend seed users (see supabase migration + scripts/seed-data.ts). */
const DEMO_PARENT_PHONE = "+250788000001";
const DEMO_ADMIN_PHONE = "+250780000001";

const DEMO_ACCOUNTS: StoredAccount[] = [
  {
    id: "user-parent-demo",
    name: "Sarah Chen",
    email: "parent@demo.com",
    password: "password123",
    role: "parent",
    initials: "SC",
    phone: DEMO_PARENT_PHONE,
    reminderChannels: { sms: true, email: true, inApp: true },
  },
  {
    id: "user-admin-demo",
    name: "Dr. Marcus Webb",
    email: "admin@demo.com",
    password: "password123",
    role: "admin",
    initials: "MW",
    organization: "VaxReminder Health Network",
    phone: DEMO_ADMIN_PHONE,
  },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function validateParentContacts(input: RegisterInput): void {
  const phone = input.phone?.trim() ?? "";

  if (!phone) {
    throw new Error("Phone number is required for SMS reminders.");
  }

  const digits = normalizePhone(phone);
  if (digits.length < 10) {
    throw new Error("Enter a valid phone number with at least 10 digits.");
  }

  const channels = input.reminderChannels ?? DEFAULT_REMINDER_CHANNELS;
  const hasChannel = channels.sms || channels.email || channels.inApp;

  if (!hasChannel) {
    throw new Error("Select at least one reminder delivery method.");
  }

  if (channels.sms && digits.length < 10) {
    throw new Error("A valid phone number is required for SMS reminders.");
  }
}

function patchDemoAccountPhones(user: StoredAccount): StoredAccount {
  if (user.email === "admin@demo.com" && user.role === "admin") {
    return { ...user, phone: user.phone ?? DEMO_ADMIN_PHONE };
  }
  if (user.email === "parent@demo.com" && user.role === "parent") {
    return { ...user, phone: user.phone ?? DEMO_PARENT_PHONE };
  }
  return user;
}

function loadUsers(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_ACCOUNTS));
      return DEMO_ACCOUNTS;
    }
    const users = (JSON.parse(raw) as StoredAccount[]).map(patchDemoAccountPhones);
    saveUsers(users);
    return users;
  } catch {
    return DEMO_ACCOUNTS;
  }
}

function saveUsers(users: StoredAccount[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function toAuthUser(account: StoredAccount): AuthUser {
  const { password: _, ...user } = account;
  return user;
}

export function getSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    const session = JSON.parse(raw) as AuthUser;
    if (session.email === "admin@demo.com" && session.role === "admin") {
      return { ...session, phone: session.phone ?? DEMO_ADMIN_PHONE };
    }
    if (session.email === "parent@demo.com" && session.role === "parent") {
      return { ...session, phone: session.phone ?? DEMO_PARENT_PHONE };
    }
    return session;
  } catch {
    return null;
  }
}

export function setSession(user: AuthUser | null): void {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function registerUser(input: RegisterInput, role: UserRole): AuthUser {
  const users = loadUsers();
  const email = input.email.trim().toLowerCase();

  if (users.some((user) => user.email.toLowerCase() === email && user.role === role)) {
    throw new Error("An account with this email already exists.");
  }

  if (input.password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  if (input.password !== input.confirmPassword) {
    throw new Error("Passwords do not match.");
  }

  if (role === "parent") {
    validateParentContacts(input);
  } else if (!input.phone?.trim()) {
    throw new Error("Phone number is required for hospital accounts.");
  }

  const reminderChannels: ReminderChannels | undefined =
    role === "parent"
      ? {
          sms: input.reminderChannels?.sms ?? true,
          email: input.reminderChannels?.email ?? true,
          inApp: input.reminderChannels?.inApp ?? true,
        }
      : undefined;

  const account: StoredAccount = {
    id: `user-${Date.now()}`,
    name: input.name.trim(),
    email,
    password: input.password,
    role,
    initials: getInitials(input.name.trim()),
    organization:
      role === "admin" ? input.organization?.trim() || "VaxReminder Network" : undefined,
    phone:
      role === "parent"
        ? input.phone?.trim()
        : input.phone?.trim() || DEMO_ADMIN_PHONE,
    reminderChannels,
  };

  saveUsers([...users, account]);
  const authUser = toAuthUser(account);
  setSession(authUser);
  return authUser;
}

export function loginUser(input: LoginInput, role: UserRole): AuthUser {
  const users = loadUsers();
  const email = input.email.trim().toLowerCase();
  const account = users.find(
    (user) => user.email.toLowerCase() === email && user.role === role,
  );

  if (!account || account.password !== input.password) {
    throw new Error("Invalid email or password.");
  }

  const authUser = toAuthUser(account);
  setSession(authUser);
  return authUser;
}

export function logoutUser(): void {
  setSession(null);
}

export function getDemoCredentials(role: UserRole): { email: string; password: string } {
  return role === "parent"
    ? { email: "parent@demo.com", password: "password123" }
    : { email: "admin@demo.com", password: "password123" };
}

export function formatReminderChannels(channels: ReminderChannels): string {
  const active: string[] = [];
  if (channels.sms) active.push("SMS");
  if (channels.email) active.push("Email");
  if (channels.inApp) active.push("In-app");
  return active.join(", ") || "None";
}
