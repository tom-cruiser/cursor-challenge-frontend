import { Bell, Mail, MessageSquare, Smartphone } from "lucide-react";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { formatReminderChannels } from "@/lib/auth-utils";
import type { ParentUser } from "@/types/user";

interface ParentContactSummaryProps {
  user: ParentUser;
}

export function ParentContactSummary({ user }: ParentContactSummaryProps) {
  const channels = [
    {
      key: "sms" as const,
      enabled: user.reminderChannels.sms,
      label: "SMS",
      description: user.phone,
      icon: MessageSquare,
    },
    {
      key: "email" as const,
      enabled: user.reminderChannels.email,
      label: "Email",
      description: user.email,
      icon: Mail,
    },
    {
      key: "inApp" as const,
      enabled: user.reminderChannels.inApp,
      label: "In-app",
      description: "Notification drawer on this website",
      icon: Smartphone,
    },
  ];

  return (
    <Card>
      <CardHeader className="border-b-0 pb-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-sm">Reminder delivery</CardTitle>
            <CardDescription>
              Registered contact methods for vaccination alerts
            </CardDescription>
          </div>
          <Badge priority="core">
            <Bell className="mr-1 h-3 w-3" aria-hidden="true" />
            {formatReminderChannels(user.reminderChannels)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 pt-4 sm:grid-cols-3">
        {channels.map(({ key, enabled, label, description, icon: Icon }) => (
          <div
            key={key}
            className={`rounded-lg border px-3 py-3 ${
              enabled
                ? "border-teal/25 bg-teal-glow/50"
                : "border-health-muted bg-health-muted/50 opacity-60"
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-teal" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-wider text-health-text">
                {label}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-health-text-muted">{description}</p>
            <p className="mt-1 text-[10px] font-medium text-health-text-muted">
              {enabled ? "Active" : "Disabled"}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
