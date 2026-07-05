import type { MapCluster, NearbyHospital } from "@/types/hospital";

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

export function getUpcomingClinicDays(
  clinicDays: NearbyHospital["clinicDays"],
  referenceDate: Date = new Date(),
): NearbyHospital["clinicDays"] {
  const ref = new Date(referenceDate);
  ref.setHours(0, 0, 0, 0);

  return clinicDays
    .filter((day) => new Date(`${day.date}T00:00:00`) >= ref)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getHospitalsByCluster(
  hospitals: NearbyHospital[],
): Record<MapCluster, NearbyHospital[]> {
  return hospitals.reduce(
    (groups, hospital) => {
      groups[hospital.cluster].push(hospital);
      return groups;
    },
    { north: [], central: [], west: [] } as Record<MapCluster, NearbyHospital[]>,
  );
}

export function sortHospitalsByDistance(hospitals: NearbyHospital[]): NearbyHospital[] {
  return [...hospitals].sort((a, b) => a.distanceKm - b.distanceKm);
}

export function filterNearbyHospitals(
  hospitals: NearbyHospital[],
  query: string,
): NearbyHospital[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return hospitals;
  }

  return hospitals.filter(
    (hospital) =>
      hospital.name.toLowerCase().includes(normalized) ||
      hospital.address.toLowerCase().includes(normalized),
  );
}
