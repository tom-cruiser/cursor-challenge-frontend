import type { AdminHospitalFacility, VaccineScheduleVersion } from "@/types/catalog";

export function filterAdminHospitals(
  hospitals: AdminHospitalFacility[],
  query: string,
): AdminHospitalFacility[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return hospitals;
  }

  return hospitals.filter(
    (hospital) =>
      hospital.name.toLowerCase().includes(normalized) ||
      hospital.region.toLowerCase().includes(normalized) ||
      hospital.address.toLowerCase().includes(normalized),
  );
}

export function filterScheduleVersions(
  versions: VaccineScheduleVersion[],
  query: string,
): VaccineScheduleVersion[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return versions;
  }

  return versions.filter(
    (version) =>
      version.vaccineName.toLowerCase().includes(normalized) ||
      version.version.toLowerCase().includes(normalized) ||
      version.notes.toLowerCase().includes(normalized),
  );
}

export function formatCoordinates(coords: { latitude: number; longitude: number }): string {
  return `${coords.latitude.toFixed(4)}°, ${coords.longitude.toFixed(4)}°`;
}

export function formatAgeMonths(months: number): string {
  if (months === 0) {
    return "Birth";
  }
  if (months < 12) {
    return `${months} mo`;
  }
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  return remaining > 0 ? `${years}y ${remaining}mo` : `${years}y`;
}
