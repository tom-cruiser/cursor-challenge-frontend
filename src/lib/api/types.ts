export type BackendUserRole = "parent" | "hospital";
export type ScheduleStatus = "pending" | "due_soon" | "completed" | "overdue";
export type ChildSex = "male" | "female" | "other";

export interface ApiUser {
  id: string;
  phone: string;
  email: string | null;
  name: string | null;
  country: string | null;
  role: BackendUserRole;
  created_at: string;
  updated_at: string;
}

export interface ApiChild {
  id: string;
  parent_id: string;
  name: string;
  date_of_birth: string;
  sex: ChildSex | null;
  notes: string | null;
  preferred_hospital_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiHospitalChild extends ApiChild {
  age_months: number;
  parent: ApiUser;
}

export interface ApiHospitalVaccine {
  id: string;
  hospital_id: string;
  name: string;
  item_type: "vaccine" | "checkup";
  age_min_months: number;
  age_max_months: number;
  milestone_age_months: number;
  dose_number: number;
  purpose: string | null;
  details: string | null;
  reminder_days: number[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiChildSchedule {
  id: string;
  child_id: string;
  hospital_id: string;
  hospital_vaccine_id: string;
  due_date: string;
  status: ScheduleStatus;
  completed_at: string | null;
  completed_by: string | null;
  card_photo_url: string | null;
  created_at: string;
  vaccine?: ApiHospitalVaccine;
}

export interface ApiDayHours {
  open: string | null;
  close: string | null;
  vaccination: boolean;
}

export interface ApiHospital {
  id: string;
  owner_id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  help_phone: string | null;
  country: string | null;
  services: string[];
  operating_hours: Record<string, ApiDayHours>;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiNearbyHospital extends ApiHospital {
  distance_km: number;
  vaccination_days: string[] | null;
}

export interface ApiHospitalStats {
  total_registered_parents: number;
  total_children: number;
  schedules_completed: number;
  schedules_overdue: number;
  schedules_due_soon: number;
  schedules_pending: number;
  completion_rate: number;
  delinquency_rate: number;
  active_vaccines: number;
}

export interface ApiOverdueScheduleRow {
  id: string;
  child_id: string;
  hospital_id: string;
  hospital_vaccine_id: string;
  due_date: string;
  status: ScheduleStatus;
  completed_at: string | null;
  completed_by: string | null;
  card_photo_url: string | null;
  created_at: string;
  child: ApiChild & {
    parent: Pick<ApiUser, "id" | "name" | "phone">;
  };
  vaccine: Pick<ApiHospitalVaccine, "name" | "purpose">;
}
