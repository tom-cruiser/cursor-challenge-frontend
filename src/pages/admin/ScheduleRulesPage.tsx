import { useCallback, useEffect, useMemo, useState } from "react";
import { History, Plus } from "lucide-react";
import {
  DataTable,
  ScheduleRuleForm,
  SlideOver,
} from "@/components/admin";
import { Badge, Button, Input } from "@/components/ui";
import {
  filterScheduleVersions,
  formatAgeMonths,
} from "@/lib/catalog-utils";
import * as hospitalApi from "@/lib/api/hospital";
import {
  createScheduleInputToVaccinePayload,
  mapVaccineToScheduleVersion,
} from "@/lib/api/mappers";
import type {
  CreateScheduleInput,
  VaccineScheduleVersion,
  VersionScheduleInput,
} from "@/types/catalog";

type SlideOverMode = "create" | "version" | null;

export function ScheduleRulesPage() {
  const [versions, setVersions] = useState<VaccineScheduleVersion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [slideOverMode, setSlideOverMode] = useState<SlideOverMode>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadVaccines = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const vaccines = await hospitalApi.listVaccines();
      setVersions(vaccines.map(mapVaccineToScheduleVersion));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load vaccine catalog.");
      setVersions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVaccines();
  }, [loadVaccines]);

  const filteredVersions = useMemo(
    () => filterScheduleVersions(versions, searchQuery),
    [versions, searchQuery],
  );

  function openCreate() {
    setSlideOverMode("create");
  }

  function closeSlideOver() {
    setSlideOverMode(null);
  }

  async function handleCreate(input: CreateScheduleInput) {
    setIsSaving(true);
    setError(null);

    try {
      const payload = createScheduleInputToVaccinePayload(input);
      const result = await hospitalApi.createVaccine(payload);
      setVersions((current) => [...current, mapVaccineToScheduleVersion(result.vaccine)]);
      setSuccessMessage(`${input.vaccineName} added to your hospital vaccine catalog.`);
      closeSlideOver();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create vaccine rule.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleVersion(_input: VersionScheduleInput) {
    closeSlideOver();
  }

  const columns = [
    {
      key: "vaccine",
      header: "Vaccine",
      render: (version: VaccineScheduleVersion) => (
        <div>
          <p className="font-medium text-health-text">{version.vaccineName}</p>
          <p className="text-xs text-health-text-muted">Catalog ID: {version.catalogId}</p>
        </div>
      ),
    },
    {
      key: "version",
      header: "Version",
      className: "whitespace-nowrap font-mono text-xs",
      render: (version: VaccineScheduleVersion) => (
        <span className="text-health-text">v{version.version}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "whitespace-nowrap",
      render: (version: VaccineScheduleVersion) => (
        <Badge priority={version.status === "active" ? "core" : "medium"}>
          {version.status === "active" ? "Active" : "Archived"}
        </Badge>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      className: "whitespace-nowrap capitalize",
      render: (version: VaccineScheduleVersion) => (
        <Badge priority={version.priority}>{version.priority}</Badge>
      ),
    },
    {
      key: "doses",
      header: "Dosing Rules",
      render: (version: VaccineScheduleVersion) => (
        <div className="space-y-1">
          {version.dosingRules.map((rule) => (
            <p key={rule.doseNumber} className="text-xs text-health-text-muted">
              {rule.label} · {formatAgeMonths(rule.ageMonths)}
            </p>
          ))}
        </div>
      ),
    },
    {
      key: "checkups",
      header: "Check-up Ages",
      className: "whitespace-nowrap text-xs",
      render: (version: VaccineScheduleVersion) =>
        version.checkUpAgeMonths.map(formatAgeMonths).join(", ") || "—",
    },
    {
      key: "effective",
      header: "Effective",
      className: "whitespace-nowrap text-xs",
      render: (version: VaccineScheduleVersion) => version.effectiveFrom,
    },
    {
      key: "actions",
      header: "Actions",
      className: "whitespace-nowrap",
      render: (version: VaccineScheduleVersion) =>
        version.status === "active" ? (
          <span className="text-xs text-health-text-muted">Live catalog</span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-health-text-muted">
            <History className="h-3.5 w-3.5" aria-hidden="true" />
            Historical
          </span>
        ),
    },
  ];

  const activeCount = versions.filter((v) => v.status === "active").length;
  const archivedCount = versions.filter((v) => v.status === "archived").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-navy">
            Vaccine Schedule Catalog
          </h2>
          <p className="mt-1 text-sm text-health-text-muted">
            Manage vaccines for your hospital. Schedules sync to registered children.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Vaccine Rule
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-health-text-muted">
        <span>
          <span className="font-semibold text-teal">{activeCount}</span> active versions
        </span>
        <span>
          <span className="font-semibold text-health-text">{archivedCount}</span> archived (historical)
        </span>
      </div>

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
        label="Search catalog"
        placeholder="Search by vaccine name or version..."
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        aria-label="Search vaccine schedule catalog"
      />

      {isLoading ? (
        <p className="text-sm text-health-text-muted">Loading vaccine catalog...</p>
      ) : (
        <DataTable
          columns={columns}
          data={filteredVersions}
          getRowId={(version) => version.id}
          caption="Master vaccine schedule versions"
          emptyMessage="No vaccine rules yet. Add your first rule to start building schedules."
        />
      )}

      <SlideOver
        open={slideOverMode !== null}
        onClose={closeSlideOver}
        title="Add Vaccination Rule"
        description="Append a new vaccine dosing rule to your hospital catalog."
        width="lg"
      >
        {slideOverMode === "create" && (
          <ScheduleRuleForm
            mode="create"
            isSubmitting={isSaving}
            onSubmitCreate={(input) => void handleCreate(input)}
            onSubmitVersion={handleVersion}
            onCancel={closeSlideOver}
          />
        )}
      </SlideOver>
    </div>
  );
}
