import type { LucideIcon } from "lucide-react";
import { Badge, Card, CardContent, CardHeader } from "@/components/ui";
import { cn } from "@/lib/cn";

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  subtitle?: string;
  trend?: string;
  priority?: "core" | "high" | "medium";
  className?: string;
  children?: React.ReactNode;
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  subtitle,
  trend,
  priority,
  className,
  children,
}: MetricCardProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="border-b-0 pb-0">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wider text-health-text-muted">
            {label}
          </p>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-health-muted ring-1 ring-health-muted">
            <Icon className="h-4 w-4 text-teal" aria-hidden="true" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pt-2">
        <div className="flex items-end justify-between gap-3">
          <p className="text-3xl font-bold tracking-tight text-navy">{value}</p>
          {priority && (
            <Badge priority={priority}>
              {priority === "high" ? "Elevated" : "Active"}
            </Badge>
          )}
        </div>
        {subtitle && <p className="mt-1 text-sm text-health-text-muted">{subtitle}</p>}
        {trend && <p className="mt-2 text-xs text-teal">{trend}</p>}
        {children && <div className="mt-4 flex-1">{children}</div>}
      </CardContent>
    </Card>
  );
}

interface RegionalRateBarProps {
  region: string;
  rate: number;
  overdueCount: number;
}

export function RegionalRateBar({ region, rate, overdueCount }: RegionalRateBarProps) {
  const width = Math.min(rate * 10, 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-health-text">{region}</span>
        <span className="text-health-text-muted">
          {rate.toFixed(1)}% · {overdueCount} overdue
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-health-muted ring-1 ring-health-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            rate >= 4 ? "bg-alert" : rate >= 3 ? "bg-info" : "bg-accent",
          )}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
