import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, RefreshCw, Users, UsersRound } from "lucide-react";
import { DataTable, MetricCard } from "@/components/admin";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@/components/ui";
import { useAdminContext } from "@/contexts";
import { filterFamilyRecords } from "@/lib/admin-utils";
import * as hospitalApi from "@/lib/api/hospital";
import { mapParentToFamilyRecord } from "@/lib/api/mappers";
import { formatAgeMonths } from "@/lib/catalog-utils";
import type { FamilyChildRecord, FamilyRecord } from "@/types/admin";

function formatRegisteredDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateOfBirth(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function FamiliesChildrenPage() {
  const { metrics, isLoading: metricsLoading, error: metricsError, refresh } = useAdminContext();
  const [families, setFamilies] = useState<FamilyRecord[]>([]);
  const [familiesLoading, setFamiliesLoading] = useState(true);
  const [familiesError, setFamiliesError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFamilyIds, setExpandedFamilyIds] = useState<Set<string>>(new Set());

  const loadFamilies = useCallback(async () => {
    setFamiliesLoading(true);
    setFamiliesError(null);

    try {
      const parents = await hospitalApi.listParents();
      setFamilies(parents.map(mapParentToFamilyRecord));
    } catch (err) {
      setFamiliesError(err instanceof Error ? err.message : "Failed to load registered families.");
      setFamilies([]);
    } finally {
      setFamiliesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFamilies();
  }, [loadFamilies]);

  const filteredFamilies = useMemo(
    () => filterFamilyRecords(families, searchQuery),
    [families, searchQuery],
  );

  const totalChildrenInList = useMemo(
    () => filteredFamilies.reduce((total, family) => total + family.children.length, 0),
    [filteredFamilies],
  );

  function toggleFamilyExpanded(familyId: string) {
    setExpandedFamilyIds((current) => {
      const next = new Set(current);
      if (next.has(familyId)) {
        next.delete(familyId);
      } else {
        next.add(familyId);
      }
      return next;
    });
  }

  const childColumns = [
    {
      key: "name",
      header: "Child",
      render: (child: FamilyChildRecord) => (
        <span className="font-medium text-health-text">{child.name}</span>
      ),
    },
    {
      key: "age",
      header: "Age",
      className: "whitespace-nowrap",
      render: (child: FamilyChildRecord) => formatAgeMonths(child.ageMonths),
    },
    {
      key: "dob",
      header: "Date of birth",
      className: "whitespace-nowrap",
      render: (child: FamilyChildRecord) => formatDateOfBirth(child.dateOfBirth),
    },
    {
      key: "sex",
      header: "Sex",
      className: "whitespace-nowrap",
      render: (child: FamilyChildRecord) => child.sex,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-navy">Families & Children</h2>
          <p className="mt-1 text-sm text-health-text-muted">
            Registered parents and children assigned to your hospital.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void Promise.all([refresh(), loadFamilies()]);
          }}
          disabled={metricsLoading || familiesLoading}
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard
          label="Total Families"
          value={metrics.totalRegisteredParents.toLocaleString()}
          icon={Users}
          subtitle="Registered parents at your hospital"
          priority="core"
        />
        <MetricCard
          label="Total Children"
          value={metrics.totalChildren.toLocaleString()}
          icon={UsersRound}
          subtitle="Children assigned to your hospital"
          priority="core"
        />
      </div>

      {(metricsError || familiesError) && (
        <p className="text-sm text-danger-bright" role="alert">
          {metricsError ?? familiesError}
        </p>
      )}

      <section className="space-y-4" aria-labelledby="families-list-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 id="families-list-heading" className="text-lg font-semibold text-navy">
              Registered Families
            </h3>
            <p className="mt-1 text-sm text-health-text-muted">
              {filteredFamilies.length} families · {totalChildrenInList} children shown
            </p>
          </div>
          <div className="w-full sm:max-w-xs">
            <Input
              label="Search families"
              placeholder="Parent name, phone, or child name..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Search families by parent name, phone number, or child name"
            />
          </div>
        </div>

        {familiesLoading ? (
          <p className="text-sm text-health-text-muted">Loading registered families...</p>
        ) : filteredFamilies.length === 0 ? (
          <div className="rounded-xl border border-border-subtle bg-surface-raised px-4 py-10 text-center text-sm text-health-text-muted shadow-card">
            {searchQuery
              ? "No families match your search."
              : "No families registered at your hospital yet."}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFamilies.map((family) => {
              const isExpanded = expandedFamilyIds.has(family.id);

              return (
                <Card key={family.id} className="overflow-hidden">
                  <CardHeader className="border-b border-border-subtle/70 pb-0">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => toggleFamilyExpanded(family.id)}
                        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-health-muted text-health-text-muted ring-1 ring-health-muted transition-colors hover:text-teal"
                        aria-expanded={isExpanded}
                        aria-label={`${isExpanded ? "Collapse" : "Expand"} children for ${family.parentName}`}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <CardTitle className="text-base">{family.parentName}</CardTitle>
                            <CardDescription className="mt-1">
                              {family.phoneNumber} · {family.region}
                            </CardDescription>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge priority="core">
                              {family.children.length}{" "}
                              {family.children.length === 1 ? "child" : "children"}
                            </Badge>
                            <span className="text-xs text-health-text-muted">
                              Registered {formatRegisteredDate(family.registeredAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent className="pt-4">
                      {family.children.length === 0 ? (
                        <p className="text-sm text-health-text-muted">
                          No children assigned to your hospital for this family.
                        </p>
                      ) : (
                        <DataTable
                          columns={childColumns}
                          data={family.children}
                          getRowId={(child) => child.id}
                          caption={`Children for ${family.parentName}`}
                          emptyMessage="No children registered."
                        />
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
