import type { ChildProfile, ImmunizationMilestone } from "@/types/user";
import { getMilestoneStatus } from "@/data/reminderEngine";

export {
  countActionableReminders as countDueSoonMilestones,
  getDaysUntilDue,
  getMilestoneStatus,
} from "@/data/reminderEngine";

export interface MilestoneTemplate {
  label: string;
  description: string;
  monthsFromBirth: number;
}

export const MANDATORY_MILESTONES: MilestoneTemplate[] = [
  {
    label: "Hepatitis B (HepB)",
    description: "First dose administered at birth",
    monthsFromBirth: 0,
  },
  {
    label: "DTaP",
    description: "Diphtheria, tetanus, and pertussis — 1st dose",
    monthsFromBirth: 2,
  },
  {
    label: "Hib",
    description: "Haemophilus influenzae type b — 1st dose",
    monthsFromBirth: 2,
  },
  {
    label: "Polio (IPV)",
    description: "Inactivated poliovirus — 1st dose",
    monthsFromBirth: 4,
  },
  {
    label: "MMR",
    description: "Measles, mumps, and rubella — 1st dose",
    monthsFromBirth: 12,
  },
];

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function toIsoDate(date: Date): string {
  return date.toISOString().split("T")[0]!;
}

export function generateMilestones(
  dateOfBirth: string,
  childId: string,
): ImmunizationMilestone[] {
  const birthDate = new Date(`${dateOfBirth}T00:00:00`);

  return MANDATORY_MILESTONES.map((template, index) => {
    const dueDate = addMonths(birthDate, template.monthsFromBirth);

    return {
      id: `${childId}-milestone-${index + 1}`,
      label: template.label,
      description: template.description,
      dueDate: toIsoDate(dueDate),
      completed: false,
    };
  });
}

export function getNextIncompleteMilestone(
  milestones: ImmunizationMilestone[],
  referenceDate: Date = new Date(),
): ImmunizationMilestone | null {
  const sorted = [...milestones].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
  );

  return (
    sorted.find(
      (milestone) =>
        !milestone.completed && getMilestoneStatus(milestone, referenceDate) !== "completed",
    ) ?? null
  );
}

export function getCompletionProgress(milestones: ImmunizationMilestone[]): {
  completed: number;
  total: number;
  percentage: number;
} {
  const completed = milestones.filter((milestone) => milestone.completed).length;
  const total = milestones.length;

  return {
    completed,
    total,
    percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export function createChildProfile(
  input: Pick<ChildProfile, "id" | "name" | "dateOfBirth" | "sex"> & {
    preferredHospitalId?: string | null;
    vaccinationCardImageUrl?: string | null;
  },
): ChildProfile {
  return {
    ...input,
    preferredHospitalId: input.preferredHospitalId ?? null,
    vaccinationCardImageUrl: input.vaccinationCardImageUrl ?? null,
    milestones: generateMilestones(input.dateOfBirth, input.id),
  };
}

export function applyInitialMilestoneStates(
  child: ChildProfile,
  completedCount: number,
): ChildProfile {
  const milestones = child.milestones.map((milestone, index) => {
    if (index >= completedCount) {
      return milestone;
    }

    return {
      ...milestone,
      completed: true,
      completedAt: milestone.dueDate,
    };
  });

  return { ...child, milestones };
}
