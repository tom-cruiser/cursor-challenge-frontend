import { apiRequest } from "@/lib/api/client";
import type {
  ApiChild,
  ApiChildSchedule,
  ApiNearbyHospital,
  ApiUser,
} from "@/lib/api/types";

export async function getProfile(): Promise<ApiUser> {
  const data = await apiRequest<{ profile: ApiUser }>("/user/profile");
  return data.profile;
}

export async function updateProfile(input: {
  name: string;
  email?: string;
  country: string;
}): Promise<ApiUser> {
  const data = await apiRequest<{ profile: ApiUser }>("/user/profile", {
    method: "PATCH",
    body: input,
  });
  return data.profile;
}

export async function listChildren(): Promise<ApiChild[]> {
  const data = await apiRequest<{ children: ApiChild[] }>("/user/children");
  return data.children;
}

export async function createChild(input: {
  name: string;
  dateOfBirth: string;
  sex?: "male" | "female" | "other";
  notes?: string;
  preferredHospitalId?: string;
}): Promise<{ child: ApiChild; schedule: ApiChildSchedule[] }> {
  return apiRequest("/user/children", {
    method: "POST",
    body: input,
  });
}

export async function getTimeline(childId: string): Promise<ApiChildSchedule[]> {
  const data = await apiRequest<{ timeline: ApiChildSchedule[] }>(
    `/user/children/${childId}/timeline`,
  );
  return data.timeline;
}

export async function markTimelineComplete(
  itemId: string,
  cardPhotoUrl?: string,
): Promise<ApiChildSchedule> {
  const data = await apiRequest<{ item: ApiChildSchedule }>(`/user/timeline/${itemId}`, {
    method: "PATCH",
    body: cardPhotoUrl ? { cardPhotoUrl } : {},
  });
  return data.item;
}

export async function setPreferredHospital(
  childId: string,
  hospitalId: string,
): Promise<{ child: ApiChild; schedule: ApiChildSchedule[] }> {
  return apiRequest(`/user/children/${childId}/preferred-hospital`, {
    method: "PATCH",
    body: { hospitalId },
  });
}

export async function getNearbyHospitals(
  lat: number,
  lng: number,
  options?: { limit?: number; verifiedOnly?: boolean },
): Promise<ApiNearbyHospital[]> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    limit: String(options?.limit ?? 20),
    verifiedOnly: String(options?.verifiedOnly ?? false),
  });

  const data = await apiRequest<{ hospitals: ApiNearbyHospital[] }>(
    `/user/hospitals/nearby?${params.toString()}`,
  );
  return data.hospitals;
}

export async function registerToHospital(hospitalId: string): Promise<void> {
  await apiRequest(`/user/hospitals/${hospitalId}/register`, {
    method: "POST",
  });
}
