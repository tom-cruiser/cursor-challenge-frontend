import type { ReminderChannels } from "@/types/auth";

export interface ParentUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  phone: string;
  reminderChannels: ReminderChannels;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  initials: string;
}

export type ChildSex = "male" | "female" | "other";

export type ScheduleStatus = "pending" | "due_soon" | "completed" | "overdue";

export type MilestoneStatus = "completed" | "due_soon" | "upcoming" | "overdue";

export interface ImmunizationMilestone {
  id: string;
  label: string;
  description: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  /** Backend schedule status from GET /user/children/:id/timeline */
  scheduleStatus?: ScheduleStatus;
}

export interface ChildProfile {
  id: string;
  name: string;
  dateOfBirth: string;
  sex: ChildSex;
  milestones: ImmunizationMilestone[];
  preferredHospitalId: string | null;
  vaccinationCardImageUrl: string | null;
}

export interface AddChildInput {
  name: string;
  dateOfBirth: string;
  sex: ChildSex;
}
