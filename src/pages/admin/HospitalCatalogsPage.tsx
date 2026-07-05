import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, MapPin, Pencil, Plus } from "lucide-react";
import {
  DataTable,
  RegisterHospitalForm,
  SlideOver,
  createDefaultOperatingHours,
} from "@/components/admin";
import { Badge, Button, Input } from "@/components/ui";
import { ApiError } from "@/lib/api/client";
import {
  filterAdminHospitals,
  formatCoordinates,
} from "@/lib/catalog-utils";
import * as hospitalApi from "@/lib/api/hospital";
import { mapHospitalToAdminFacility } from "@/lib/api/mappers";
import type { ApiHospital } from "@/lib/api/types";
import {
  VERIFIED_TAG_LABELS,
  type AdminHospitalFacility,
  type RegisterHospitalInput,
} from "@/types/catalog";
import { SERVICE_LABELS, type HospitalService } from "@/types/hospital";

function hospitalToFormInput(hospital: ApiHospital): RegisterHospitalInput {
  const operatingHours = createDefaultOperatingHours();

  for (const [day, hours] of Object.entries(hospital.operating_hours ?? {})) {
    if (day in operatingHours) {
      operatingHours[day as keyof typeof operatingHours] = {
        open: hours.open,
        close: hours.close,
        vaccination: hours.vaccination,
      };
    }
  }

  return {
    name: hospital.name,
    address: hospital.address ?? "",
    latitude: hospital.latitude,
    longitude: hospital.longitude,
    helpPhone: hospital.help_phone ?? "",
    country: hospital.country ?? "",
    services: (hospital.services.length
      ? hospital.services
      : ["vaccination"]) as HospitalService[],
    operatingHours,
  };
}

export function HospitalCatalogsPage() {
  const [hospitals, setHospitals] = useState<AdminHospitalFacility[]>([]);
  const [profile, setProfile] = useState<ApiHospital | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [slideOverOpen, setSlideOverOpen] = useState(false);

  const loadHospitalProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [loadedProfile, vaccines] = await Promise.all([
        hospitalApi.getProfile(),
        hospitalApi.listVaccines(),
      ]);
      setProfile(loadedProfile);
      setHasProfile(true);
      setHospitals([mapHospitalToAdminFacility(loadedProfile, vaccines.length)]);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setProfile(null);
        setHasProfile(false);
        setHospitals([]);
      } else {
        setError(err instanceof Error ? err.message : "Failed to load hospital profile.");
        setProfile(null);
        setHasProfile(false);
        setHospitals([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHospitalProfile();
  }, [loadHospitalProfile]);

  const filteredHospitals = useMemo(
    () => filterAdminHospitals(hospitals, searchQuery),
    [hospitals, searchQuery],
  );

  function openForm() {
    setSlideOverOpen(true);
  }

  function closeForm() {
    setSlideOverOpen(false);
  }

  async function handleSubmit(input: RegisterHospitalInput) {
    setIsSaving(true);
    setError(null);

    const payload = {
      name: input.name.trim(),
      address: input.address.trim(),
      latitude: input.latitude,
      longitude: input.longitude,
      helpPhone: input.helpPhone.trim() || undefined,
      country: input.country.trim() || undefined,
      services: input.services,
      operatingHours: input.operatingHours,
    };

    try {
      if (hasProfile) {
        await hospitalApi.updateProfile(payload);
        setSuccessMessage("Hospital profile updated successfully.");
      } else {
        await hospitalApi.signup(payload);
        setSuccessMessage("Hospital registered successfully.");
      }

      closeForm();
      await loadHospitalProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save hospital profile.");
    } finally {
      setIsSaving(false);
    }
  }

  const columns = [
    {
      key: "name",
      header: "Facility",
      render: (hospital: AdminHospitalFacility) => (
        <div>
          <p className="font-medium text-health-text">{hospital.name}</p>
          <p className="text-xs text-health-text-muted">{hospital.address}</p>
        </div>
      ),
    },
    {
      key: "region",
      header: "Country",
      className: "whitespace-nowrap",
      render: (hospital: AdminHospitalFacility) => hospital.region,
    },
    {
      key: "phone",
      header: "Phone",
      className: "whitespace-nowrap text-xs",
      render: (hospital: AdminHospitalFacility) => hospital.helpPhone,
    },
    {
      key: "coordinates",
      header: "Coordinates",
      className: "whitespace-nowrap font-mono text-xs",
      render: (hospital: AdminHospitalFacility) => (
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
          {formatCoordinates(hospital.coordinates)}
        </span>
      ),
    },
    {
      key: "tags",
      header: "Verified Tags",
      render: (hospital: AdminHospitalFacility) => (
        <div className="flex flex-wrap gap-1.5">
          {hospital.verifiedTags.length === 0 ? (
            <span className="text-xs text-health-text-muted">None</span>
          ) : (
            hospital.verifiedTags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px]">
                {VERIFIED_TAG_LABELS[tag]}
              </Badge>
            ))
          )}
        </div>
      ),
    },
    {
      key: "services",
      header: "Services",
      render: (hospital: AdminHospitalFacility) => (
        <div className="flex flex-wrap gap-1.5">
          {hospital.services.map((service) => (
            <Badge key={service} priority="medium" className="text-[10px]">
              {SERVICE_LABELS[service] ?? service.replace(/_/g, " ")}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "whitespace-nowrap",
      render: (hospital: AdminHospitalFacility) => (
        <Badge
          priority={
            hospital.status === "active"
              ? "core"
              : hospital.status === "pending"
                ? "high"
                : "medium"
          }
        >
          {hospital.status.charAt(0).toUpperCase() + hospital.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "vaccines",
      header: "Vaccines",
      className: "whitespace-nowrap text-center",
      render: (hospital: AdminHospitalFacility) => hospital.vaccinesAvailable,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-navy">
            Hospital Directory
          </h2>
          <p className="mt-1 text-sm text-health-text-muted">
            Register and manage your hospital facility. Each operator account owns one hospital.
          </p>
        </div>
        <Button size="sm" onClick={openForm}>
          {hasProfile ? (
            <>
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Edit Hospital
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Register Hospital
            </>
          )}
        </Button>
      </div>

      {!isLoading && (
        <div className="flex flex-wrap gap-4 text-sm text-health-text-muted">
          <span className="flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-teal" aria-hidden="true" />
            <span className="font-semibold text-teal">{hospitals.length}</span>{" "}
            {hospitals.length === 1 ? "facility" : "facilities"} registered
          </span>
        </div>
      )}

      {successMessage && (
        <div
          className="rounded-lg border border-teal/30 bg-teal-glow px-4 py-3 text-sm text-teal-muted"
          role="status"
        >
          {successMessage}
        </div>
      )}

      {error && (
        <p className="text-sm text-danger-bright" role="alert">
          {error}
        </p>
      )}

      <Input
        label="Search directory"
        placeholder="Search by name, country, or address..."
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        aria-label="Search hospital directory"
      />

      {isLoading ? (
        <p className="text-sm text-health-text-muted">Loading hospital directory...</p>
      ) : (
        <DataTable
          columns={columns}
          data={filteredHospitals}
          getRowId={(hospital) => hospital.id}
          caption="Your registered hospital facility"
          emptyMessage="No hospital registered yet. Use Register Hospital to add your facility."
        />
      )}

      <SlideOver
        open={slideOverOpen}
        onClose={closeForm}
        title={hasProfile ? "Edit Hospital Profile" : "Register Hospital"}
        description={
          hasProfile
            ? "Update your facility details, services, and operating hours."
            : "Create your hospital profile to appear in the parent directory."
        }
        width="lg"
      >
        <RegisterHospitalForm
          mode={hasProfile ? "edit" : "create"}
          initialValues={profile ? hospitalToFormInput(profile) : undefined}
          isSubmitting={isSaving}
          onSubmit={(input) => void handleSubmit(input)}
          onCancel={closeForm}
        />
      </SlideOver>
    </div>
  );
}
