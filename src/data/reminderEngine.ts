import type { LeadTimeDays } from "@/types/notification";
import type { ChildProfile, ImmunizationMilestone, MilestoneStatus } from "@/types/user";

export interface VaccinationReminder {
  id: string;
  childId: string;
  childName: string;
  label: string;
  description: string;
  dueDate: string;
  status: MilestoneStatus;
  daysUntilDue: number;
}

export function getDaysUntilDue(dueDate: string, referenceDate: Date = new Date()): number {
  const due = new Date(`${dueDate}T00:00:00`);
  const ref = new Date(referenceDate);
  ref.setHours(0, 0, 0, 0);
  const diffMs = due.getTime() - ref.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/** Resolve display status from backend schedule status or due-date heuristics. */
export function getMilestoneStatus(
  milestone: ImmunizationMilestone,
  referenceDate: Date = new Date(),
): MilestoneStatus {
  if (milestone.completed || milestone.scheduleStatus === "completed") {
    return "completed";
  }

  if (milestone.scheduleStatus === "overdue") {
    return "overdue";
  }

  if (milestone.scheduleStatus === "due_soon") {
    return "due_soon";
  }

  const daysUntilDue = getDaysUntilDue(milestone.dueDate, referenceDate);

  if (daysUntilDue < 0) {
    return "overdue";
  }

  // Match backend cron: due_soon = within 7 days
  if (daysUntilDue <= 7) {
    return "due_soon";
  }

  return "upcoming";
}

/** Whether a dose should appear on Reminders page / notification drawer. */
export function isActionableReminder(
  milestone: ImmunizationMilestone,
  leadTimeDays: LeadTimeDays,
  referenceDate: Date = new Date(),
): boolean {
  const status = getMilestoneStatus(milestone, referenceDate);
  if (status === "completed") {
    return false;
  }

  if (status === "overdue" || status === "due_soon") {
    return true;
  }

  const daysUntilDue = getDaysUntilDue(milestone.dueDate, referenceDate);
  return daysUntilDue > 0 && daysUntilDue <= leadTimeDays;
}

export function buildRemindersFromChildren(
  children: ChildProfile[],
  leadTimeDays: LeadTimeDays,
  referenceDate: Date = new Date(),
): VaccinationReminder[] {
  const reminders: VaccinationReminder[] = [];

  for (const child of children) {
    for (const milestone of child.milestones) {
      if (!isActionableReminder(milestone, leadTimeDays, referenceDate)) {
        continue;
      }

      reminders.push({
        id: milestone.id,
        childId: child.id,
        childName: child.name,
        label: milestone.label,
        description: milestone.description,
        dueDate: milestone.dueDate,
        status: getMilestoneStatus(milestone, referenceDate),
        daysUntilDue: getDaysUntilDue(milestone.dueDate, referenceDate),
      });
    }
  }

  return reminders.sort((a, b) => {
    const statusOrder: Record<MilestoneStatus, number> = {
      overdue: 0,
      due_soon: 1,
      upcoming: 2,
      completed: 3,
    };
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) {
      return statusDiff;
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
}

export function countActionableReminders(
  milestones: ImmunizationMilestone[],
  leadTimeDays: LeadTimeDays = 3,
  referenceDate: Date = new Date(),
): number {
  return milestones.filter((milestone) =>
    isActionableReminder(milestone, leadTimeDays, referenceDate),
  ).length;
}

export function childNeedsPreferredHospital(child: ChildProfile): boolean {
  return !child.preferredHospitalId && child.milestones.length === 0;
}
