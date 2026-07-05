import { useState, type FormEvent } from "react";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  WEEKDAY_LABELS,
  WEEKDAYS,
  type DayHoursInput,
  type RegisterHospitalInput,
  type Weekday,
} from "@/types/catalog";
import { SERVICE_LABELS, type HospitalService } from "@/types/hospital";

interface RegisterHospitalFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<RegisterHospitalInput>;
  isSubmitting?: boolean;
  onSubmit: (input: RegisterHospitalInput) => void;
  onCancel: () => void;
}

const ALL_SERVICES = Object.keys(SERVICE_LABELS) as HospitalService[];

export function createDefaultOperatingHours(): Record<Weekday, DayHoursInput> {
  return {
    monday: { open: "07:30", close: "17:00", vaccination: true },
    tuesday: { open: "07:30", close: "17:00", vaccination: true },
    wednesday: { open: "07:30", close: "17:00", vaccination: true },
    thursday: { open: "07:30", close: "17:00", vaccination: true },
    friday: { open: "07:30", close: "17:00", vaccination: true },
    saturday: { open: "08:00", close: "12:00", vaccination: true },
    sunday: { open: null, close: null, vaccination: false },
  };
}

function buildInitialState(initialValues?: Partial<RegisterHospitalInput>): RegisterHospitalInput {
  const defaults = createDefaultOperatingHours();
  const mergedHours = { ...defaults };

  if (initialValues?.operatingHours) {
    for (const day of WEEKDAYS) {
      const hours = initialValues.operatingHours[day];
      if (hours) {
        mergedHours[day] = { ...hours };
      }
    }
  }

  return {
    name: initialValues?.name ?? "",
    address: initialValues?.address ?? "",
    latitude: initialValues?.latitude ?? 0,
    longitude: initialValues?.longitude ?? 0,
    helpPhone: initialValues?.helpPhone ?? "",
    country: initialValues?.country ?? "",
    services: initialValues?.services?.length ? initialValues.services : ["vaccination"],
    operatingHours: mergedHours,
  };
}

export function RegisterHospitalForm({
  mode,
  initialValues,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: RegisterHospitalFormProps) {
  const [form, setForm] = useState<RegisterHospitalInput>(() => buildInitialState(initialValues));
  const [errors, setErrors] = useState<Record<string, string>>({});

  function toggleService(service: HospitalService) {
    setForm((current) => ({
      ...current,
      services: current.services.includes(service)
        ? current.services.filter((item) => item !== service)
        : [...current.services, service],
    }));
  }

  function updateDayHours(day: Weekday, patch: Partial<DayHoursInput>) {
    setForm((current) => ({
      ...current,
      operatingHours: {
        ...current.operatingHours,
        [day]: { ...current.operatingHours[day]!, ...patch },
      },
    }));
  }

  function validate(): Record<string, string> {
    const nextErrors: Record<string, string> = {};

    if (!form.name.trim()) nextErrors.name = "Facility name is required.";
    if (!form.address.trim()) nextErrors.address = "Address is required.";
    if (!form.country.trim()) nextErrors.country = "Country is required.";
    if (form.latitude < -90 || form.latitude > 90) {
      nextErrors.latitude = "Latitude must be between -90 and 90.";
    }
    if (form.longitude < -180 || form.longitude > 180) {
      nextErrors.longitude = "Longitude must be between -180 and 180.";
    }
    if (form.services.length === 0) {
      nextErrors.services = "Select at least one service.";
    }

    return nextErrors;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Facility name"
        value={form.name}
        onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
        placeholder="e.g. Kigali University Teaching Hospital"
        error={errors.name}
      />

      <Input
        label="Street address"
        value={form.address}
        onChange={(e) => setForm((c) => ({ ...c, address: e.target.value }))}
        placeholder="Full street address"
        error={errors.address}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Country"
          value={form.country}
          onChange={(e) => setForm((c) => ({ ...c, country: e.target.value }))}
          placeholder="e.g. Rwanda"
          error={errors.country}
        />
        <Input
          label="Help phone"
          type="tel"
          value={form.helpPhone}
          onChange={(e) => setForm((c) => ({ ...c, helpPhone: e.target.value }))}
          placeholder="+250788123456"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Latitude"
          type="number"
          step="any"
          value={form.latitude || ""}
          onChange={(e) =>
            setForm((c) => ({ ...c, latitude: parseFloat(e.target.value) || 0 }))
          }
          placeholder="-1.9441"
          error={errors.latitude}
        />
        <Input
          label="Longitude"
          type="number"
          step="any"
          value={form.longitude || ""}
          onChange={(e) =>
            setForm((c) => ({ ...c, longitude: parseFloat(e.target.value) || 0 }))
          }
          placeholder="30.0619"
          error={errors.longitude}
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-health-text">Services offered</legend>
        {errors.services && (
          <p className="text-xs text-danger-bright" role="alert">
            {errors.services}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {ALL_SERVICES.map((service) => (
            <label
              key={service}
              className={cn(
                "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium ring-1 transition-all",
                form.services.includes(service)
                  ? "bg-teal-glow text-teal ring-teal/30"
                  : "bg-health-muted text-health-text-muted ring-health-muted hover:text-health-text",
              )}
            >
              <input
                type="checkbox"
                checked={form.services.includes(service)}
                onChange={() => toggleService(service)}
                className="sr-only"
              />
              {SERVICE_LABELS[service]}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-health-text">Operating hours</legend>
        <p className="text-xs text-health-text-muted">
          Set clinic hours and mark days when vaccination services are available.
        </p>
        <div className="overflow-x-auto rounded-lg border border-health-muted">
          <table className="w-full min-w-[32rem] text-left text-xs">
            <thead className="bg-health-muted/50 text-health-text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Day</th>
                <th className="px-3 py-2 font-medium">Open</th>
                <th className="px-3 py-2 font-medium">Close</th>
                <th className="px-3 py-2 font-medium">Vaccination</th>
              </tr>
            </thead>
            <tbody>
              {WEEKDAYS.map((day) => {
                const hours = form.operatingHours[day]!;
                return (
                  <tr key={day} className="border-t border-health-muted">
                    <td className="px-3 py-2 font-medium text-health-text">
                      {WEEKDAY_LABELS[day]}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="time"
                        value={hours.open ?? ""}
                        onChange={(e) =>
                          updateDayHours(day, { open: e.target.value || null })
                        }
                        className="rounded border border-health-muted bg-health-surface px-2 py-1 text-health-text"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="time"
                        value={hours.close ?? ""}
                        onChange={(e) =>
                          updateDayHours(day, { close: e.target.value || null })
                        }
                        className="rounded border border-health-muted bg-health-surface px-2 py-1 text-health-text"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <label className="inline-flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={hours.vaccination}
                          onChange={(e) =>
                            updateDayHours(day, { vaccination: e.target.checked })
                          }
                          className="rounded border-health-muted text-teal focus:ring-teal/30"
                        />
                        <span className="text-health-text-muted">Available</span>
                      </label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </fieldset>

      <div className="flex flex-col-reverse gap-2 border-t border-health-muted pt-5 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : mode === "create"
              ? "Register Facility"
              : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
