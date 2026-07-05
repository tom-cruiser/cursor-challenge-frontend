import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, UserRound } from "lucide-react";
import { EmptyState, InteractiveTimeline } from "@/components/parent";
import { Button } from "@/components/ui";
import { useParentContext } from "@/contexts";

export function TimelinePage() {
  const navigate = useNavigate();
  const { activeChild, activeChildId, children, setActiveChildId, toggleMilestone, isLoading, error } =
    useParentContext();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-navy">
            Immunization Timeline
          </h2>
          <p className="mt-1 text-sm text-health-text-muted">Loading timeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-navy">
            Immunization Timeline
          </h2>
          <p className="mt-1 text-sm text-danger-bright" role="alert">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-navy">
            Immunization Timeline
          </h2>
          <p className="mt-1 text-sm text-health-text-muted">
            Auto-generated schedules appear after you add a child profile.
          </p>
        </div>
        <EmptyState
          icon={CalendarDays}
          title="No timelines yet"
          description="Add a child on the dashboard to automatically generate their 5-dose immunization timeline."
          actionLabel="Go to Dashboard"
          onAction={() => navigate("/parent/dashboard")}
        />
      </div>
    );
  }

  if (!activeChild) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-navy">
            Immunization Timeline
          </h2>
          <p className="mt-1 text-sm text-health-text-muted">
            Select a child profile to view their timeline.
          </p>
        </div>
        <EmptyState
          icon={UserRound}
          title="No profile selected"
          description="Choose a child below to view and manage their vaccination milestones."
        />
        <div className="flex flex-wrap gap-2">
          {children.map((child) => (
            <Button
              key={child.id}
              variant="secondary"
              size="sm"
              onClick={() => setActiveChildId(child.id)}
            >
              {child.name}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-navy">
            Immunization Timeline
          </h2>
          <p className="mt-1 text-sm text-health-text-muted">
            Track milestones and mark doses as completed.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/parent/dashboard")}
          className="inline-flex items-center gap-1.5 text-sm text-health-text-muted transition-colors hover:text-navy"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Dashboard
        </button>
      </div>

      {children.length > 1 && (
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Select child profile"
        >
          {children.map((child) => (
            <Button
              key={child.id}
              variant={child.id === activeChildId ? "primary" : "secondary"}
              size="sm"
              onClick={() => setActiveChildId(child.id)}
              role="tab"
              aria-selected={child.id === activeChildId}
            >
              {child.name}
            </Button>
          ))}
        </div>
      )}

      <InteractiveTimeline
        milestones={activeChild.milestones}
        childName={activeChild.name}
        onToggleMilestone={(milestoneId) =>
          toggleMilestone(activeChild.id, milestoneId)
        }
      />
    </div>
  );
}
