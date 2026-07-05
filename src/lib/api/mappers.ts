import type {
  ApiChild,
  ApiChildSchedule,
  ApiHospitalVaccine,
  ApiNearbyHospital,
  ApiOverdueScheduleRow,
  ApiUser,
} from "@/lib/api/types";
import type { AccountRecord, AlertLog, FamilyRecord } from "@/types/admin";
import type { AdminHospitalFacility, VaccineScheduleVersion } from "@/types/catalog";
import type { AuthUser, UserRole } from "@/types/auth";
import type { MapCluster, NearbyHospital } from "@/types/hospital";
import type { ApiHospital } from "@/lib/api/types";
import type { ApiRegisteredParent } from "@/lib/api/hospital";
import type { ChildProfile, ImmunizationMilestone } from "@/types/user";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function backendRoleToFrontend(role: "parent" | "hospital"): UserRole {
  return role === "hospital" ? "admin" : "parent";
}

export function frontendRoleToBackend(role: UserRole): "parent" | "hospital" {
  return role === "admin" ? "hospital" : "parent";
}

export function mapUserToAuthUser(user: ApiUser, role: UserRole): AuthUser {
  return {
    id: user.id,
    name: user.name ?? "User",
    email: user.email ?? "",
    role,
    initials: getInitials(user.name ?? "User"),
    phone: user.phone,
    organization: role === "admin" ? user.name ?? undefined : undefined,
  };
}

export function mapScheduleToMilestone(item: ApiChildSchedule): ImmunizationMilestone {
  const label = item.vaccine?.name ?? "Vaccination";
  const description =
    item.vaccine?.purpose ?? item.vaccine?.details ?? "Scheduled immunization dose";

  return {
    id: item.id,
    label,
    description,
    dueDate: item.due_date,
    completed: item.status === "completed",
    completedAt: item.completed_at?.split("T")[0],
    scheduleStatus: item.status,
  };
}

export function mapChildWithTimeline(
  child: ApiChild,
  timeline: ApiChildSchedule[],
): ChildProfile {
  const cardPhoto = timeline.find((item) => item.card_photo_url)?.card_photo_url ?? null;

  return {
    id: child.id,
    name: child.name,
    dateOfBirth: child.date_of_birth,
    sex: child.sex ?? "other",
    milestones: timeline.map(mapScheduleToMilestone),
    preferredHospitalId: child.preferred_hospital_id,
    vaccinationCardImageUrl: cardPhoto,
  };
}

function buildClinicDays(
  operatingHours: ApiNearbyHospital["operating_hours"],
  vaccinationDays: string[] | null,
): NearbyHospital["clinicDays"] {
  if (!vaccinationDays?.length) {
    return [];
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return vaccinationDays.slice(0, 3).map((day, index) => {
    const schedule = operatingHours[day];
    const date = new Date(today);
    date.setDate(date.getDate() + (index + 1) * 7);

    const open = schedule?.open ?? "08:00";
    const close = schedule?.close ?? "17:00";

    return {
      date: date.toISOString().split("T")[0]!,
      label: `${day.charAt(0).toUpperCase()}${day.slice(1)} Immunization Clinic`,
      timeRange: `${open} – ${close}`,
    };
  });
}

export function mapNearbyHospital(hospital: ApiNearbyHospital, index: number): NearbyHospital {
  const clusters: MapCluster[] = ["north", "central", "west"];

  return {
    id: hospital.id,
    name: hospital.name,
    address: hospital.address ?? "Address not listed",
    distanceKm: hospital.distance_km,
    services: ((hospital.services ?? []).length ? hospital.services : ["vaccination"]) as NearbyHospital["services"],
    clinicDays: buildClinicDays(hospital.operating_hours, hospital.vaccination_days),
    cluster: clusters[index % clusters.length]!,
    gridPosition: { row: (index % 4) + 1, col: (index % 5) + 1 },
    isOpen: true,
  };
}

export function mapVaccineToScheduleVersion(vaccine: ApiHospitalVaccine): VaccineScheduleVersion {
  const year = new Date(vaccine.created_at).getFullYear();

  return {
    id: vaccine.id,
    catalogId: vaccine.id,
    vaccineName: vaccine.name,
    version: `${year}.1`,
    status: vaccine.is_active ? "active" : "archived",
    priority: "core",
    dosingRules: [
      {
        doseNumber: vaccine.dose_number,
        ageMonths: vaccine.milestone_age_months,
        label: `${vaccine.dose_number}${vaccine.dose_number === 1 ? "st" : vaccine.dose_number === 2 ? "nd" : vaccine.dose_number === 3 ? "rd" : "th"} dose`,
      },
    ],
    checkUpAgeMonths:
      vaccine.item_type === "checkup" ? [vaccine.milestone_age_months] : [],
    effectiveFrom: vaccine.created_at.split("T")[0]!,
    createdAt: vaccine.created_at,
    notes: vaccine.details ?? vaccine.purpose ?? "",
  };
}

export function mapOverdueToAlertLog(row: ApiOverdueScheduleRow): AlertLog {
  return {
    id: row.id,
    timestamp: row.due_date,
    childName: row.child.name,
    doseLabel: row.vaccine?.name ?? "Overdue dose",
    region: "Hospital",
    phoneNumber: row.child.parent.phone,
    severity: "high",
    message: `${row.child.name} — ${row.vaccine?.name ?? "vaccination"} overdue since ${row.due_date}`,
  };
}

export function mapParentToAccountRecord(row: ApiRegisteredParent): AccountRecord {
  return {
    id: row.parent.id,
    parentName: row.parent.name ?? "Unknown",
    phoneNumber: row.parent.phone,
    childCount: row.children.length,
    region: row.parent.country ?? "—",
    duplicateGroupId: null,
  };
}

function ageInMonthsFromDateOfBirth(dateOfBirth: string): number {
  const birth = new Date(dateOfBirth);
  const now = new Date();
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) {
    months -= 1;
  }
  return Math.max(0, months);
}

function formatChildSex(sex: ApiChild["sex"]): string {
  if (!sex) {
    return "—";
  }
  return sex.charAt(0).toUpperCase() + sex.slice(1);
}

export function mapParentToFamilyRecord(row: ApiRegisteredParent): FamilyRecord {
  return {
    id: row.parent.id,
    parentName: row.parent.name ?? "Unknown",
    phoneNumber: row.parent.phone,
    region: row.parent.country ?? "—",
    registeredAt: row.registered_at,
    children: row.children.map((child) => ({
      id: child.id,
      name: child.name,
      dateOfBirth: child.date_of_birth,
      ageMonths: ageInMonthsFromDateOfBirth(child.date_of_birth),
      sex: formatChildSex(child.sex),
    })),
  };
}

export function mapHospitalToAdminFacility(
  hospital: ApiHospital,
  vaccinesAvailable: number,
): AdminHospitalFacility {
  return {
    id: hospital.id,
    name: hospital.name,
    address: hospital.address ?? "—",
    region: hospital.country ?? "—",
    helpPhone: hospital.help_phone ?? "—",
    coordinates: {
      latitude: hospital.latitude,
      longitude: hospital.longitude,
    },
    verifiedTags: hospital.is_verified ? ["government_verified"] : [],
    services: (hospital.services.length
      ? hospital.services
      : ["vaccination"]) as AdminHospitalFacility["services"],
    status: hospital.is_verified ? "active" : "pending",
    vaccinesAvailable,
    registeredAt: hospital.created_at.split("T")[0]!,
  };
}

export function createScheduleInputToVaccinePayload(input: {
  vaccineName: string;
  dosingRules: Array<{ doseNumber: number; ageMonths: number; label: string }>;
  notes: string;
}) {
  const ages = input.dosingRules.map((rule) => rule.ageMonths);
  const minAge = Math.min(...ages);
  const maxAge = Math.max(...ages);
  const primaryRule = input.dosingRules[0]!;

  return {
    name: input.vaccineName,
    itemType: "vaccine" as const,
    ageMinMonths: minAge,
    ageMaxMonths: maxAge,
    milestoneAgeMonths: primaryRule.ageMonths,
    doseNumber: primaryRule.doseNumber,
    purpose: input.notes || undefined,
    details: input.notes || undefined,
    reminderDays: [3, 1],
  };
}
