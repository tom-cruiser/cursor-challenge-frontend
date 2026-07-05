import { apiRequest } from "@/lib/api/client";
import type {
  ApiChild,
  ApiDayHours,
  ApiHospital,
  ApiHospitalChild,
  ApiHospitalStats,
  ApiHospitalVaccine,
  ApiOverdueScheduleRow,
  ApiUser,
} from "@/lib/api/types";

export interface HospitalProfileInput {
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  helpPhone?: string;
  country?: string;
  services?: string[];
  operatingHours?: Record<string, ApiDayHours>;
}

export async function signup(
  input: HospitalProfileInput,
): Promise<{ hospital: ApiHospital; user: ApiUser }> {
  return apiRequest("/hospital/signup", {
    method: "POST",
    body: input,
  });
}

export async function getProfile(): Promise<ApiHospital> {
  const data = await apiRequest<{ hospital: ApiHospital }>("/hospital/profile");
  return data.hospital;
}

export async function updateProfile(
  input: Partial<HospitalProfileInput>,
): Promise<ApiHospital> {
  const data = await apiRequest<{ hospital: ApiHospital }>("/hospital/profile", {
    method: "PATCH",
    body: input,
  });
  return data.hospital;
}

export interface ApiRegisteredParent {
  parent: ApiUser;
  children: ApiChild[];
  registered_at: string;
}

export async function listParents(): Promise<ApiRegisteredParent[]> {
  const data = await apiRequest<{ parents: ApiRegisteredParent[] }>("/hospital/parents");
  return data.parents;
}

export async function listChildren(): Promise<ApiHospitalChild[]> {
  const data = await apiRequest<{ children: ApiHospitalChild[] }>("/hospital/children");
  return data.children;
}

export async function listVaccines(): Promise<ApiHospitalVaccine[]> {
  const data = await apiRequest<{ vaccines: ApiHospitalVaccine[] }>("/hospital/vaccines");
  return data.vaccines;
}

export async function createVaccine(input: {
  name: string;
  itemType: "vaccine" | "checkup";
  ageMinMonths: number;
  ageMaxMonths: number;
  milestoneAgeMonths: number;
  doseNumber?: number;
  purpose?: string;
  details?: string;
  reminderDays?: number[];
}): Promise<{ vaccine: ApiHospitalVaccine }> {
  return apiRequest("/hospital/vaccines", {
    method: "POST",
    body: input,
  });
}

export async function deleteVaccine(vaccineId: string): Promise<void> {
  await apiRequest(`/hospital/vaccines/${vaccineId}`, {
    method: "DELETE",
  });
}

export async function getStats(): Promise<ApiHospitalStats> {
  const data = await apiRequest<{ stats: ApiHospitalStats }>("/hospital/stats");
  return data.stats;
}

export async function getOverdue(): Promise<ApiOverdueScheduleRow[]> {
  const data = await apiRequest<{ overdue: ApiOverdueScheduleRow[] }>("/hospital/overdue");
  return data.overdue;
}
