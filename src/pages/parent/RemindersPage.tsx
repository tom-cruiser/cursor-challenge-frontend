import { Bell, Calendar, Syringe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "@/components/parent";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { getMilestoneStatus } from "@/data/timelineEngine";
import { useParentContext } from "@/contexts";
import type { ImmunizationMilestone, MilestoneStatus } from "@/types/user";

const statusPriority: Record<MilestoneStatus, "core" | "high" | "medium"> = {
  completed: "core",
  due_soon: "high",
  upcoming: "medium",
};

function formatDueDate(dateString: string): string {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildReminders(
  childName: string,
  milestones: ImmunizationMilestone[],
): Array<ImmunizationMilestone & { childName: string; status: MilestoneStatus }> {
  return milestones
    .filter((milestone) => !milestone.completed)
    .map((milestone) => ({
      ...milestone,
      childName,
      status: getMilestoneStatus(milestone),
    }))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

export function RemindersPage() {
  const navigate = useNavigate();
  const { children, unreadReminders, toggleMilestone, isLoading, error } = useParentContext();

  const reminders = children.flatMap((child) =>
    buildReminders(child.name, child.milestones),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-navy">
            Reminders
          </h2>
          <p className="mt-1 text-sm text-health-text-muted">
            Upcoming and overdue vaccination notifications.
          </p>
        </div>
        {unreadReminders > 0 && (
          <Badge priority="high">{unreadReminders} due soon</Badge>
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
      ) : reminders.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All caught up"
          description="No pending vaccination reminders. Check the notification drawer for lead-time alerts."
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
                    {reminder.status === "due_soon" ? "Due Soon" : "Upcoming"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between pt-3">
                <div className="flex items-center gap-4 text-xs text-health-text-muted">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                    Due {formatDueDate(reminder.dueDate)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Syringe className="h-3.5 w-3.5" aria-hidden="true" />
                    Scheduled
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const child = children.find((c) =>
                      c.milestones.some((m) => m.id === reminder.id),
                    );
                    if (child) {
                      toggleMilestone(child.id, reminder.id);
                    }
                  }}
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
