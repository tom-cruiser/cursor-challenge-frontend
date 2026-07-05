import type { ReminderChannels } from "@/types/auth";

export function formatReminderChannels(channels: ReminderChannels): string {
  const active: string[] = [];
  if (channels.sms) active.push("SMS");
  if (channels.email) active.push("Email");
  if (channels.inApp) active.push("In-app");
  return active.join(", ") || "None";
}
