import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  Users,
  UsersRound,
} from "lucide-react";
import { DataTable, MetricCard } from "@/components/admin";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@/components/ui";
import { useAdminContext } from "@/contexts";
import { filterAlertLogs, formatAlertTimestamp } from "@/lib/admin-utils";
import type { AlertLog } from "@/types/admin";

export function AdminDashboardPage() {
  const { metrics, overdueAlerts, isLoading, error } = useAdminContext();
  const [alertFilter, setAlertFilter] = useState("");

  const filteredAlerts = useMemo(
    () => filterAlertLogs(overdueAlerts, alertFilter),
    [overdueAlerts, alertFilter],
  );

  const completionRateLabel = useMemo(
    () => (metrics.completionRate * 100).toFixed(1),
    [metrics.completionRate],
  );

  const alertColumns = [
    {
      key: "timestamp",
      header: "Time",
      className: "whitespace-nowrap w-36",
      render: (log: AlertLog) => (
        <span className="text-health-text-muted">{formatAlertTimestamp(log.timestamp)}</span>
      ),
    },
    {
      key: "message",
      header: "Alert",
      render: (log: AlertLog) => (
        <div>
          <p className="font-medium text-health-text">{log.message}</p>
          <p className="mt-0.5 text-xs text-health-text-muted">{log.doseLabel}</p>
        </div>
      ),
    },
    {
      key: "region",
      header: "Region",
      className: "whitespace-nowrap",
      render: (log: AlertLog) => log.region,
    },
    {
      key: "phone",
      header: "Phone",
      className: "whitespace-nowrap font-mono text-xs",
      render: (log: AlertLog) => log.phoneNumber,
    },
    {
      key: "severity",
      header: "Severity",
      className: "whitespace-nowrap",
      render: (log: AlertLog) => (
        <Badge priority={log.severity === "high" ? "high" : "medium"}>
          {log.severity === "high" ? "High" : "Medium"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-navy">
          Platform Executive Dashboard
        </h2>
        <p className="mt-1 text-sm text-health-text-muted">
          Hospital metrics and overdue vaccination alerts.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

        <MetricCard
          label="Overdue Vaccinations"
          value={`${metrics.overdueAlerts}`}
          icon={AlertTriangle}
          subtitle={`${Math.round(metrics.completionRate * 100)}% completion rate`}
          priority="high"
        />

        <MetricCard
          label="Active Vaccines"
          value={metrics.vaccinesTracked.toString()}
          icon={CalendarCheck}
          subtitle={`${metrics.dueSoon} due soon`}
          priority="core"
        />
      </div>

      {error && (
        <p className="text-sm text-danger-bright" role="alert">
          {error}
        </p>
      )}

      {isLoading && (
        <p className="text-sm text-health-text-muted">Loading hospital dashboard...</p>
      )}

      <Card className="border-teal/20 bg-teal-glow/10">
        <CardHeader className="border-b-0 pb-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Families & Children Registry</CardTitle>
              <CardDescription className="mt-1">
                Browse registered parents and view each family&apos;s children with names and ages.
              </CardDescription>
            </div>
            <Link
              to="/admin/families"
              className="inline-flex items-center gap-2 rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-muted"
            >
              View registry
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          <p className="text-sm text-health-text-muted">
            {metrics.totalRegisteredParents.toLocaleString()} families ·{" "}
            {metrics.totalChildren.toLocaleString()} children registered at your hospital.
          </p>
        </CardContent>
      </Card>

      <section className="space-y-4" aria-labelledby="alert-logs-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 id="alert-logs-heading" className="text-lg font-semibold text-navy">
              Recent Alert Logs
            </h3>
            <p className="mt-1 text-sm text-health-text-muted">
              Overdue vaccination alerts for registered children.
            </p>
          </div>
          <div className="w-full sm:max-w-xs">
            <Input
              label="Filter alerts"
              placeholder="Phone, child, region..."
              value={alertFilter}
              onChange={(event) => setAlertFilter(event.target.value)}
              aria-label="Filter alert logs by phone number, child name, or region"
            />
          </div>
        </div>

        <DataTable
          columns={alertColumns}
          data={filteredAlerts}
          getRowId={(log) => log.id}
          caption="Recent vaccination alert logs"
          emptyMessage="No overdue alerts. All schedules are on track."
        />
      </section>

      <div className="flex items-center gap-2 rounded-lg border border-health-muted bg-health-muted/50 px-4 py-3 text-xs text-health-text-muted">
        <Activity className="h-4 w-4 text-teal" aria-hidden="true" />
        Live data from hospital API · {completionRateLabel}% completion rate
      </div>
    </div>
  );
}
