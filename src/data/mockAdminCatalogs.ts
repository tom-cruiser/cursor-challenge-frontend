import type {
  AdminHospitalFacility,
  CreateScheduleInput,
  RegisterHospitalInput,
  VaccineScheduleVersion,
  VersionScheduleInput,
} from "@/types/catalog";

export const mockAdminHospitals: AdminHospitalFacility[] = [
  {
    id: "fac-001",
    name: "City General Hospital",
    address: "1200 Medical Center Dr",
    region: "Central District",
    helpPhone: "+250788111111",
    coordinates: { latitude: 40.7128, longitude: -74.006 },
    verifiedTags: ["who_certified", "government_verified", "emergency_ready"],
    services: ["vaccination", "growth_monitoring", "maternity"],
    status: "active",
    vaccinesAvailable: 12,
    registeredAt: "2024-03-15",
  },
  {
    id: "fac-002",
    name: "Westside Pediatric Clinic",
    address: "845 Oak Lane, Suite 200",
    region: "West District",
    helpPhone: "+250788222222",
    coordinates: { latitude: 40.7282, longitude: -74.0776 },
    verifiedTags: ["pediatric_specialist", "government_verified"],
    services: ["vaccination", "growth_monitoring"],
    status: "active",
    vaccinesAvailable: 8,
    registeredAt: "2024-06-02",
  },
  {
    id: "fac-003",
    name: "Community Health Center",
    address: "300 Riverside Ave",
    region: "North District",
    helpPhone: "+250788333333",
    coordinates: { latitude: 40.7614, longitude: -73.9776 },
    verifiedTags: ["government_verified"],
    services: ["vaccination", "maternity"],
    status: "pending",
    vaccinesAvailable: 5,
    registeredAt: "2025-11-20",
  },
  {
    id: "fac-004",
    name: "Metro Children's Wellness",
    address: "77 Parkview Circle",
    region: "East District",
    helpPhone: "+250788444444",
    coordinates: { latitude: 40.6892, longitude: -73.9442 },
    verifiedTags: ["who_certified", "pediatric_specialist"],
    services: ["vaccination", "growth_monitoring"],
    status: "active",
    vaccinesAvailable: 9,
    registeredAt: "2025-01-08",
  },
];

export const mockScheduleVersions: VaccineScheduleVersion[] = [
  {
    id: "ver-mmr-001",
    catalogId: "cat-mmr",
    vaccineName: "MMR",
    version: "2024.1",
    status: "archived",
    priority: "core",
    dosingRules: [
      { doseNumber: 1, ageMonths: 12, label: "1st dose" },
      { doseNumber: 2, ageMonths: 48, label: "2nd dose" },
    ],
    checkUpAgeMonths: [12, 48],
    effectiveFrom: "2024-01-01",
    createdAt: "2023-11-10",
    notes: "Initial CDC-aligned MMR schedule.",
  },
  {
    id: "ver-mmr-002",
    catalogId: "cat-mmr",
    vaccineName: "MMR",
    version: "2026.1",
    status: "active",
    priority: "core",
    dosingRules: [
      { doseNumber: 1, ageMonths: 12, label: "1st dose" },
      { doseNumber: 2, ageMonths: 54, label: "2nd dose (revised window)" },
    ],
    checkUpAgeMonths: [12, 54],
    effectiveFrom: "2026-01-01",
    createdAt: "2025-09-14",
    notes: "Extended 2nd dose window; v2024.1 archived.",
  },
  {
    id: "ver-hepb-001",
    catalogId: "cat-hepb",
    vaccineName: "HepB",
    version: "2025.1",
    status: "active",
    priority: "core",
    dosingRules: [
      { doseNumber: 1, ageMonths: 0, label: "Birth dose" },
      { doseNumber: 2, ageMonths: 1, label: "2nd dose" },
      { doseNumber: 3, ageMonths: 6, label: "3rd dose" },
    ],
    checkUpAgeMonths: [0, 1, 6],
    effectiveFrom: "2025-01-01",
    createdAt: "2024-08-01",
    notes: "Standard 3-dose HepB series.",
  },
  {
    id: "ver-dtap-001",
    catalogId: "cat-dtap",
    vaccineName: "DTaP",
    version: "2024.2",
    status: "active",
    priority: "high",
    dosingRules: [
      { doseNumber: 1, ageMonths: 2, label: "1st dose" },
      { doseNumber: 2, ageMonths: 4, label: "2nd dose" },
      { doseNumber: 3, ageMonths: 6, label: "3rd dose" },
      { doseNumber: 4, ageMonths: 16, label: "4th dose" },
      { doseNumber: 5, ageMonths: 48, label: "5th dose" },
    ],
    checkUpAgeMonths: [2, 4, 6, 16, 48],
    effectiveFrom: "2024-06-01",
    createdAt: "2024-04-12",
    notes: "5-dose DTaP series with booster.",
  },
  {
    id: "ver-flu-001",
    catalogId: "cat-flu",
    vaccineName: "Influenza",
    version: "2026.1",
    status: "active",
    priority: "medium",
    dosingRules: [{ doseNumber: 1, ageMonths: 6, label: "Annual dose" }],
    checkUpAgeMonths: [6, 18, 30],
    effectiveFrom: "2026-01-01",
    createdAt: "2025-12-01",
    notes: "Annual influenza with seasonal check-ups.",
  },
];

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function bumpVersion(currentVersion: string): string {
  const [year, minor] = currentVersion.split(".");
  const nextMinor = minor ? String(Number(minor) + 1) : "1";
  return `${year}.${nextMinor}`;
}

export function filterHospitals(
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

export function registerHospital(
  hospitals: AdminHospitalFacility[],
  input: RegisterHospitalInput,
): AdminHospitalFacility[] {
  const newHospital: AdminHospitalFacility = {
    id: createId("fac"),
    name: input.name.trim(),
    address: input.address.trim(),
    region: input.country.trim(),
    helpPhone: input.helpPhone.trim() || "—",
    coordinates: {
      latitude: input.latitude,
      longitude: input.longitude,
    },
    verifiedTags: [],
    services: input.services,
    status: "pending",
    vaccinesAvailable: 0,
    registeredAt: new Date().toISOString().split("T")[0]!,
  };

  return [newHospital, ...hospitals];
}

export function createScheduleVersion(
  versions: VaccineScheduleVersion[],
  input: CreateScheduleInput,
): VaccineScheduleVersion[] {
  const catalogId = createId("cat");
  const year = new Date().getFullYear();

  const newVersion: VaccineScheduleVersion = {
    id: createId("ver"),
    catalogId,
    vaccineName: input.vaccineName.trim(),
    version: `${year}.1`,
    status: "active",
    priority: input.priority,
    dosingRules: input.dosingRules,
    checkUpAgeMonths: input.checkUpAgeMonths,
    effectiveFrom: input.effectiveFrom,
    createdAt: new Date().toISOString().split("T")[0]!,
    notes: input.notes.trim(),
  };

  return [newVersion, ...versions];
}

export function versionExistingSchedule(
  versions: VaccineScheduleVersion[],
  input: VersionScheduleInput,
): VaccineScheduleVersion[] {
  const currentActive = versions.find(
    (version) => version.catalogId === input.catalogId && version.status === "active",
  );

  if (!currentActive) {
    return versions;
  }

  const archivedVersions = versions.map((version) =>
    version.catalogId === input.catalogId && version.status === "active"
      ? { ...version, status: "archived" as const }
      : version,
  );

  const newVersion: VaccineScheduleVersion = {
    id: createId("ver"),
    catalogId: input.catalogId,
    vaccineName: currentActive.vaccineName,
    version: bumpVersion(currentActive.version),
    status: "active",
    priority: currentActive.priority,
    dosingRules: input.dosingRules,
    checkUpAgeMonths: input.checkUpAgeMonths,
    effectiveFrom: input.effectiveFrom,
    createdAt: new Date().toISOString().split("T")[0]!,
    notes: input.notes.trim() || `Supersedes v${currentActive.version}; prior version archived.`,
  };

  return [newVersion, ...archivedVersions];
}

export function getActiveSchedules(
  versions: VaccineScheduleVersion[],
): VaccineScheduleVersion[] {
  return versions.filter((version) => version.status === "active");
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
