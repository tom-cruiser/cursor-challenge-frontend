import { Bell, Calendar, MapPin, Syringe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "@/components/parent";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { childNeedsPreferredHospital } from "@/data/reminderEngine";
import { useParentContext } from "@/contexts";
import type { MilestoneStatus } from "@/types/user";

const statusPriority: Record<MilestoneStatus, "core" | "high" | "medium"> = {
  completed: "core",
  overdue: "high",
  due_soon: "high",
  upcoming: "medium",
};

const statusLabels: Record<MilestoneStatus, string> = {
  completed: "Completed",
  overdue: "Overdue",
  due_soon: "Due Soon",
  upcoming: "Upcoming",
};

function formatDueDate(dateString: string): string {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function RemindersPage() {
  const navigate = useNavigate();
  const {
    children,
    reminders,
    unreadReminders,
    notificationLeadTime,
    toggleMilestone,
    isLoading,
    error,
  } = useParentContext();

  const childrenAwaitingHospital = children.filter(childNeedsPreferredHospital);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-navy">
            Reminders
          </h2>
          <p className="mt-1 text-sm text-health-text-muted">
            Overdue, due soon, and upcoming doses within your {notificationLeadTime}-day alert window.
          </p>
        </div>
        {unreadReminders > 0 && (
          <Badge priority="high">{unreadReminders} active</Badge>
        )}
      </div>

      {error && (
        <p className="text-sm text-danger-bright" role="alert">
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-health-text-muted">Loading reminders...</p>
      ) : children.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No reminders yet"
          description="Reminders are generated from your children's immunization timelines. Add a profile to get started."
          actionLabel="Go to Dashboard"
          onAction={() => navigate("/parent/dashboard")}
        />
      ) : childrenAwaitingHospital.length > 0 && reminders.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="Choose a preferred hospital"
          description={
            childrenAwaitingHospital.length === 1
              ? `${childrenAwaitingHospital[0]!.name} has no immunization schedule yet. Select a nearby hospital to generate vaccine reminders from that facility's schedule.`
              : `${childrenAwaitingHospital.length} children have no immunization schedule yet. Select a preferred hospital on the Nearby Hospitals page to generate reminders.`
          }
          actionLabel="Find Hospitals"
          onAction={() => navigate("/parent/hospitals")}
        />
      ) : reminders.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All caught up"
          description={`No doses are overdue, due soon, or due within ${notificationLeadTime} day${notificationLeadTime > 1 ? "s" : ""}. Adjust the lead-time setting in the notification drawer for earlier alerts.`}
        />
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder) => (
            <Card key={reminder.id} interactive>
              <CardHeader className="border-b-0 pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-overlay ring-1 ring-border-subtle">
                      <Bell className="h-4 w-4 text-teal" aria-hidden="true" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{reminder.label}</CardTitle>
                      <CardDescription>{reminder.childName}</CardDescription>
                    </div>
                  </div>
                  <Badge priority={statusPriority[reminder.status]}>
                    {statusLabels[reminder.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between pt-3">
                <div className="flex items-center gap-4 text-xs text-health-text-muted">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                    Due {formatDueDate(reminder.dueDate)}
                    {reminder.daysUntilDue < 0 && (
                      <span className="text-alert-bright">
                        ({Math.abs(reminder.daysUntilDue)} day
                        {Math.abs(reminder.daysUntilDue) === 1 ? "" : "s"} overdue)
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Syringe className="h-3.5 w-3.5" aria-hidden="true" />
                    Scheduled
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleMilestone(reminder.childId, reminder.id)}
                >
                  Mark complete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
