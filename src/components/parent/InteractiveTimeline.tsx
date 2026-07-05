import { AlertTriangle, Calendar, Check, Circle } from "lucide-react";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import {
  getCompletionProgress,
  getMilestoneStatus,
} from "@/data/timelineEngine";
import { cn } from "@/lib/cn";
import type { ImmunizationMilestone, MilestoneStatus } from "@/types/user";

interface InteractiveTimelineProps {
  milestones: ImmunizationMilestone[];
  childName: string;
  onToggleMilestone: (milestoneId: string) => void;
}

const statusConfig: Record<
  MilestoneStatus,
  {
    label: string;
    sectionClass: string;
    cardClass: string;
    icon: typeof Check;
    iconClass: string;
    badgePriority: "core" | "high" | "medium";
  }
> = {
  completed: {
    label: "Completed",
    sectionClass: "border-teal/25 bg-teal-glow/40",
    cardClass: "border-teal/30 bg-teal-glow/25",
    icon: Check,
    iconClass: "bg-teal text-white ring-teal/40",
    badgePriority: "core" as const,
  },
  overdue: {
    label: "Overdue",
    sectionClass: "border-alert/25 bg-alert-glow/40",
    cardClass: "border-alert/30 bg-alert-glow/30",
    icon: AlertTriangle,
    iconClass: "bg-alert text-white ring-alert/40",
    badgePriority: "high" as const,
  },
  due_soon: {
    label: "Due Soon",
    sectionClass: "border-caution/25 bg-caution-glow/60",
    cardClass: "border-caution/30 bg-caution-glow/40",
    icon: AlertTriangle,
    iconClass: "bg-caution text-white ring-caution/40",
    badgePriority: "high" as const,
  },
  upcoming: {
    label: "Upcoming",
    sectionClass: "border-health-muted bg-health-muted/60",
    cardClass: "border-health-muted bg-health-raised/90",
    icon: Circle,
    iconClass: "bg-health-muted text-health-text-muted ring-health-muted",
    badgePriority: "medium" as const,
  },
};

const statusOrder: MilestoneStatus[] = ["overdue", "due_soon", "upcoming", "completed"];

function formatDueDate(dateString: string): string {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function groupMilestonesByStatus(milestones: ImmunizationMilestone[]) {
  const groups: Record<MilestoneStatus, ImmunizationMilestone[]> = {
    completed: [],
    overdue: [],
    due_soon: [],
    upcoming: [],
  };

  for (const milestone of milestones) {
    const status = getMilestoneStatus(milestone);
    groups[status].push(milestone);
  }

  for (const status of statusOrder) {
    groups[status].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );
  }

  return groups;
}

function MilestoneToggle({
  milestone,
  onToggle,
}: {
  milestone: ImmunizationMilestone;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={milestone.completed}
      aria-label={`Mark ${milestone.label} as ${milestone.completed ? "incomplete" : "completed"}`}
      onClick={onToggle}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
        milestone.completed ? "bg-accent" : "bg-slate-700",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200",
          milestone.completed ? "translate-x-5" : "translate-x-0.5",
        )}
      >
        {milestone.completed && (
          <Check className="h-3 w-3 text-teal" aria-hidden="true" />
        )}
      </span>
    </button>
  );
}

function MilestoneCard({
  milestone,
  status,
  onToggle,
}: {
  milestone: ImmunizationMilestone;
  status: MilestoneStatus;
  onToggle: () => void;
}) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card className={cn("transition-all duration-200", config.cardClass)}>
      <CardHeader className="border-b-0 pb-0">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1",
              config.iconClass,
            )}
            aria-hidden="true"
          >
            <Icon className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-sm">{milestone.label}</CardTitle>
              <Badge priority={config.badgePriority}>{config.label}</Badge>
            </div>
            <CardDescription className="mt-1">{milestone.description}</CardDescription>
          </div>

          <MilestoneToggle milestone={milestone} onToggle={onToggle} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-4 pt-3 text-xs text-health-text-muted">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
          Due {formatDueDate(milestone.dueDate)}
        </span>
        {milestone.completed && milestone.completedAt && (
          <span className="text-teal">
            Completed {formatDueDate(milestone.completedAt)}
          </span>
        )}
      </CardContent>
    </Card>
  );
}

export function InteractiveTimeline({
  milestones,
  childName,
  onToggleMilestone,
}: InteractiveTimelineProps) {
  const groups = groupMilestonesByStatus(milestones);
  const progress = getCompletionProgress(milestones);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-navy">
              {childName}&apos;s Immunization Timeline
            </h3>
            <p className="text-sm text-health-text-muted">
              {progress.completed} of {progress.total} milestones completed
            </p>
          </div>
          <Badge priority="core">{progress.percentage}% complete</Badge>
        </div>

        <div
          className="h-2 overflow-hidden rounded-full bg-surface-overlay ring-1 ring-border-subtle"
          role="progressbar"
          aria-valuenow={progress.percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Vaccination progress"
        >
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {statusOrder.map((status) => {
        const items = groups[status];
        const config = statusConfig[status];

        if (items.length === 0) {
          return null;
        }

        return (
          <section
            key={status}
            aria-labelledby={`timeline-section-${status}`}
            className={cn("space-y-3 rounded-xl border p-4", config.sectionClass)}
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full ring-1",
                  config.iconClass,
                )}
                aria-hidden="true"
              >
                <config.icon className="h-3.5 w-3.5" />
              </div>
              <h4
                id={`timeline-section-${status}`}
                className="text-sm font-semibold uppercase tracking-wider text-health-text"
              >
                {config.label}
              </h4>
              <span className="text-xs text-health-text-muted">({items.length})</span>
            </div>

            <div className="space-y-3">
              {items.map((milestone) => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  status={getMilestoneStatus(milestone)}
                  onToggle={() => onToggleMilestone(milestone.id)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
