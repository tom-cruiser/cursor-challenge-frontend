import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Plus, UserRound } from "lucide-react";
import { AddChildForm, EmptyState, ParentContactSummary, VaccinationCardUpload } from "@/components/parent";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { sexLabels } from "@/lib/child-labels";
import {
  getCompletionProgress,
  getNextIncompleteMilestone,
} from "@/data/timelineEngine";
import { useParentContext } from "@/contexts";

export function DashboardPage() {
  const {
    user,
    children,
    activeChild,
    activeChildId,
    setActiveChildId,
    setVaccinationCardImage,
    isLoading,
    error,
  } = useParentContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-navy">
            Child Profile Dashboard
          </h2>
          <p className="mt-1 text-sm text-health-text-muted">
            Manage profiles, upload vaccination card backups, and track progress.
          </p>
        </div>
        {!showAddForm && children.length > 0 && (
          <Button size="sm" className="shrink-0" onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Child
          </Button>
        )}
      </div>

      {showAddForm && (
        <AddChildForm
          onSuccess={() => setShowAddForm(false)}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {error && (
        <p className="text-sm text-danger-bright" role="alert">
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-health-text-muted">Loading child profiles...</p>
      ) : children.length === 0 ? (
        <EmptyState
          icon={UserRound}
          title="Welcome to VaxReminder"
          description="You haven't added any child profiles yet. Create your first profile to generate an immunization timeline and receive in-app reminders."
          actionLabel={showAddForm ? undefined : "Add Your First Child"}
          onAction={showAddForm ? undefined : () => setShowAddForm(true)}
        />
      ) : (
        <>
          <ParentContactSummary user={user} />

          <div className="grid gap-4 sm:grid-cols-2">
            {children.map((child) => {
              const isActive = child.id === activeChildId;
              const progress = getCompletionProgress(child.milestones);
              const nextMilestone = getNextIncompleteMilestone(child.milestones);

              return (
                <Card
                  key={child.id}
                  interactive
                  className={isActive ? "ring-1 ring-accent/30 shadow-glow-sm" : undefined}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle>{child.name}</CardTitle>
                        <CardDescription>
                          Born{" "}
                          {new Date(`${child.dateOfBirth}T00:00:00`).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}{" "}
                          · {sexLabels[child.sex]}
                        </CardDescription>
                      </div>
                      <Badge priority={progress.percentage === 100 ? "core" : "medium"}>
                        {progress.percentage}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    <div>
                      <div className="mb-2 flex justify-between text-xs text-health-text-muted">
                        <span>
                          {progress.completed}/{progress.total} milestones
                        </span>
                        <span>{progress.percentage}% complete</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-surface-overlay ring-1 ring-border-subtle">
                        <div
                          className="h-full rounded-full bg-accent transition-all duration-300"
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-sm text-health-text-muted">
                      Next:{" "}
                      <span className="font-medium text-health-text">
                        {nextMilestone ? nextMilestone.label : "All milestones complete"}
                      </span>
                    </p>

                    {child.vaccinationCardImageUrl && (
                      <p className="text-xs text-teal">Vaccination card on file</p>
                    )}

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        variant={isActive ? "primary" : "secondary"}
                        size="sm"
                        className="flex-1"
                        onClick={() => setActiveChildId(child.id)}
                        aria-pressed={isActive}
                      >
                        {isActive ? "Active Profile" : "Select Profile"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setActiveChildId(child.id);
                          navigate("/parent/timeline");
                        }}
                      >
                        <CalendarDays className="h-4 w-4" aria-hidden="true" />
                        View Timeline
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {activeChild && (
            <VaccinationCardUpload
              childName={activeChild.name}
              imageUrl={activeChild.vaccinationCardImageUrl}
              onUpload={(dataUrl) =>
                setVaccinationCardImage(activeChild.id, dataUrl)
              }
              onRemove={() => setVaccinationCardImage(activeChild.id, null)}
            />
          )}
        </>
      )}
    </div>
  );
}
