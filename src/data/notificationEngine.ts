import type { AppNotification, LeadTimeDays } from "@/types/notification";
import type { ChildProfile } from "@/types/user";
import {
  buildRemindersFromChildren,
  getDaysUntilDue,
  isActionableReminder,
} from "@/data/reminderEngine";

export function generateLeadTimeNotifications(
  children: ChildProfile[],
  leadTimeDays: LeadTimeDays,
  referenceDate: Date = new Date(),
): AppNotification[] {
  const reminders = buildRemindersFromChildren(children, leadTimeDays, referenceDate);

  return reminders.map((reminder) => {
    const daysUntilDue = getDaysUntilDue(reminder.dueDate, referenceDate);
    const isOverdue = daysUntilDue < 0;

    let message: string;
    if (isOverdue) {
      message = `${reminder.childName} has ${reminder.label} overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) === 1 ? "" : "s"}`;
    } else if (daysUntilDue === 0) {
      message = `${reminder.childName} has ${reminder.label} due today`;
    } else if (daysUntilDue === 1) {
      message = `${reminder.childName} has ${reminder.label} due tomorrow`;
    } else {
      message = `${reminder.childName} has ${reminder.label} due in ${daysUntilDue} days`;
    }

    return {
      id: `notif-${reminder.childId}-${reminder.id}-${leadTimeDays}d`,
      childId: reminder.childId,
      childName: reminder.childName,
      milestoneId: reminder.id,
      doseLabel: reminder.label,
      dueDate: reminder.dueDate,
      daysUntilDue,
      leadTimeDays,
      message,
    };
  });
}

export function formatDueDate(dateString: string): string {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function addDaysToDate(date: Date, days: number): string {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split("T")[0]!;
}

export function applyDemoNotificationDueDates(child: ChildProfile): ChildProfile {
  const today = new Date();

  return {
    ...child,
    milestones: child.milestones.map((milestone) => {
      if (milestone.completed) {
        return milestone;
      }

      if (milestone.label.includes("Polio")) {
        return { ...milestone, dueDate: addDaysToDate(today, 1) };
      }

      if (milestone.label.includes("MMR")) {
        return { ...milestone, dueDate: addDaysToDate(today, 3) };
      }

      return milestone;
    }),
  };
}

export { isActionableReminder };
