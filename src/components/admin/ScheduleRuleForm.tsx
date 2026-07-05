import { Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/cn";
import type {
  CreateScheduleInput,
  DosingRule,
  SchedulePriority,
  VersionScheduleInput,
  VaccineScheduleVersion,
} from "@/types/catalog";

interface ScheduleRuleFormProps {
  mode: "create" | "version";
  baseVersion?: VaccineScheduleVersion;
  isSubmitting?: boolean;
  onSubmitCreate: (input: CreateScheduleInput) => void;
  onSubmitVersion: (input: VersionScheduleInput) => void;
  onCancel: () => void;
}

const PRIORITIES: SchedulePriority[] = ["core", "high", "medium"];

function emptyDose(doseNumber: number): DosingRule {
  return { doseNumber, ageMonths: 0, label: `${doseNumber}${doseNumber === 1 ? "st" : doseNumber === 2 ? "nd" : doseNumber === 3 ? "rd" : "th"} dose` };
}

export function ScheduleRuleForm({
  mode,
  baseVersion,
  isSubmitting = false,
  onSubmitCreate,
  onSubmitVersion,
  onCancel,
}: ScheduleRuleFormProps) {
  const [vaccineName, setVaccineName] = useState(baseVersion?.vaccineName ?? "");
  const [priority, setPriority] = useState<SchedulePriority>(
    baseVersion?.priority ?? "core",
  );
  const [dosingRules, setDosingRules] = useState<DosingRule[]>(
    baseVersion?.dosingRules ?? [emptyDose(1)],
  );
  const [checkUpAges, setCheckUpAges] = useState(
    baseVersion?.checkUpAgeMonths.join(", ") ?? "",
  );
  const [effectiveFrom, setEffectiveFrom] = useState(
    new Date().toISOString().split("T")[0]!,
  );
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function updateDose(index: number, field: keyof DosingRule, value: string | number) {
    setDosingRules((current) =>
      current.map((rule, i) =>
        i === index ? { ...rule, [field]: value } : rule,
      ),
    );
  }

  function addDose() {
    setDosingRules((current) => [...current, emptyDose(current.length + 1)]);
  }

  function removeDose(index: number) {
    setDosingRules((current) =>
      current
        .filter((_, i) => i !== index)
        .map((rule, i) => ({ ...rule, doseNumber: i + 1 })),
    );
  }

  function parseCheckUpAges(): number[] {
    return checkUpAges
      .split(",")
      .map((value) => parseInt(value.trim(), 10))
      .filter((value) => !Number.isNaN(value));
  }

  function validate(): Record<string, string> {
    const nextErrors: Record<string, string> = {};

    if (mode === "create" && !vaccineName.trim()) {
      nextErrors.vaccineName = "Vaccine name is required.";
    }
    if (dosingRules.length === 0) {
      nextErrors.dosingRules = "Add at least one dosing rule.";
    }
    if (!effectiveFrom) {
      nextErrors.effectiveFrom = "Effective date is required.";
    }
    const ages = parseCheckUpAges();
    if (ages.length === 0) {
      nextErrors.checkUpAges = "Enter check-up ages in months, comma-separated.";
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

    const checkUpAgeMonths = parseCheckUpAges();

    if (mode === "version" && baseVersion) {
      onSubmitVersion({
        catalogId: baseVersion.catalogId,
        dosingRules,
        checkUpAgeMonths,
        effectiveFrom,
        notes,
      });
      return;
    }

    onSubmitCreate({
      vaccineName,
      priority,
      dosingRules,
      checkUpAgeMonths,
      effectiveFrom,
      notes,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {mode === "version" && baseVersion && (
        <div className="rounded-lg border border-teal/20 bg-teal-glow/30 px-4 py-3 text-sm text-health-text">
          Versioning <span className="font-semibold text-navy">{baseVersion.vaccineName}</span>{" "}
          v{baseVersion.version}. The current active version will be archived; historical
          records remain intact.
        </div>
      )}

      {mode === "create" && (
        <>
          <Input
            label="Vaccine name"
            value={vaccineName}
            onChange={(e) => setVaccineName(e.target.value)}
            placeholder="e.g. Varicella"
            error={errors.vaccineName}
          />

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-health-text">Priority</legend>
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map((item) => (
                <label
                  key={item}
                  className={cn(
                    "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium capitalize ring-1 transition-all",
                    priority === item
                      ? "bg-teal-glow text-teal ring-teal/30"
                      : "bg-health-muted text-health-text-muted ring-health-muted",
                  )}
                >
                  <input
                    type="radio"
                    name="priority"
                    checked={priority === item}
                    onChange={() => setPriority(item)}
                    className="sr-only"
                  />
                  {item}
                </label>
              ))}
            </div>
          </fieldset>
        </>
      )}

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-health-text">Dosing rules</legend>
        {errors.dosingRules && (
          <p className="text-xs text-danger-bright" role="alert">
            {errors.dosingRules}
          </p>
        )}
        <div className="space-y-3">
          {dosingRules.map((rule, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-lg border border-health-muted bg-health-muted/50 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
            >
              <Input
                label="Dose label"
                value={rule.label}
                onChange={(e) => updateDose(index, "label", e.target.value)}
              />
              <Input
                label="Age (months)"
                type="number"
                min={0}
                value={rule.ageMonths}
                onChange={(e) =>
                  updateDose(index, "ageMonths", parseInt(e.target.value, 10) || 0)
                }
              />
              <Input
                label="Dose #"
                type="number"
                min={1}
                value={rule.doseNumber}
                onChange={(e) =>
                  updateDose(index, "doseNumber", parseInt(e.target.value, 10) || 1)
                }
              />
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDose(index)}
                  disabled={dosingRules.length <= 1}
                  aria-label={`Remove dose ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addDose}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add dose rule
        </Button>
      </fieldset>

      <Input
        label="Check-up age timeline (months)"
        value={checkUpAges}
        onChange={(e) => setCheckUpAges(e.target.value)}
        placeholder="e.g. 2, 4, 6, 12, 48"
        hint="Comma-separated ages in months for scheduled check-ups"
        error={errors.checkUpAges}
      />

      <Input
        label="Effective from"
        type="date"
        value={effectiveFrom}
        onChange={(e) => setEffectiveFrom(e.target.value)}
        error={errors.effectiveFrom}
      />

      <div className="space-y-1.5">
        <label htmlFor="schedule-notes" className="block text-sm font-medium text-health-text">
          Version notes
        </label>
        <textarea
          id="schedule-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Document changes for audit trail..."
          className="flex w-full rounded-lg border border-health-muted bg-health-muted px-3 py-2 text-sm text-health-text ring-1 ring-health-muted placeholder:text-health-text-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-ring"
        />
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-health-muted pt-5 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {mode === "version" ? "Publish New Version" : "Add to Catalog"}
        </Button>
      </div>
    </form>
  );
}
