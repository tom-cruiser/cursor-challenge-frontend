import { Calendar, Clock, MapPin, Navigation, Star } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { formatDistance, getUpcomingClinicDays } from "@/lib/hospital-utils";
import { cn } from "@/lib/cn";
import { SERVICE_LABELS, type NearbyHospital } from "@/types/hospital";

interface HospitalCardProps {
  hospital: NearbyHospital;
  isPreferred: boolean;
  onTogglePreferred: () => void;
  preferredForLabel?: string;
  compact?: boolean;
}

function formatClinicDate(dateString: string): string {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function HospitalCard({
  hospital,
  isPreferred,
  onTogglePreferred,
  preferredForLabel,
  compact = false,
}: HospitalCardProps) {
  const upcomingClinics = getUpcomingClinicDays(hospital.clinicDays);

  return (
    <Card
      interactive
      className={cn(
        isPreferred && "ring-1 ring-accent/40 shadow-glow-sm",
      )}
    >
      <CardHeader className={cn("border-b-0", compact ? "pb-0" : undefined)}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-sm">{hospital.name}</CardTitle>
              {isPreferred && (
                <Badge priority="core">
                  <Star className="mr-1 h-3 w-3 fill-current" aria-hidden="true" />
                  Preferred
                </Badge>
              )}
            </div>
            <CardDescription className="mt-1 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {hospital.address}
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="flex items-center justify-end gap-1 text-sm font-semibold text-health-text">
              <Navigation className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
              {formatDistance(hospital.distanceKm)}
            </p>
            <Badge priority={hospital.isOpen ? "core" : "medium"} className="mt-1">
              {hospital.isOpen ? "Open" : "Closed"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn("space-y-4", compact ? "pt-3" : "pt-0")}>
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-health-text-muted">
            Services
          </p>
          <div className="flex flex-wrap gap-2">
            {hospital.services.map((service) => (
              <Badge key={service} variant="outline">
                {SERVICE_LABELS[service]}
              </Badge>
            ))}
          </div>
        </div>

        {!compact && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-health-text-muted">
              Upcoming Immunization Clinics
            </p>
            {upcomingClinics.length === 0 ? (
              <p className="text-sm text-health-text-muted">No upcoming clinic days scheduled.</p>
            ) : (
              <ul className="space-y-2">
                {upcomingClinics.slice(0, 3).map((clinic) => (
                  <li
                    key={`${hospital.id}-${clinic.date}`}
                    className="flex flex-col gap-1 rounded-lg bg-surface-muted/80 px-3 py-2 ring-1 ring-border-subtle sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-health-text">{clinic.label}</p>
                      <p className="flex items-center gap-1.5 text-xs text-health-text-muted">
                        <Calendar className="h-3 w-3" aria-hidden="true" />
                        {formatClinicDate(clinic.date)}
                      </p>
                    </div>
                    <p className="flex items-center gap-1.5 text-xs text-teal">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {clinic.timeRange}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
        {preferredForLabel && (
          <p className="text-xs text-health-text-muted">
            Setting preferred center for{" "}
            <span className="font-medium text-health-text">{preferredForLabel}</span>
          </p>
        )}
        <Button
          variant={isPreferred ? "primary" : "outline"}
          size="sm"
          className="w-full sm:ml-auto sm:w-auto"
          onClick={onTogglePreferred}
          aria-pressed={isPreferred}
        >
          <Star
            className={cn("h-4 w-4", isPreferred && "fill-current")}
            aria-hidden="true"
          />
          {isPreferred ? "Preferred Center" : "Set as Preferred Center"}
        </Button>
      </CardFooter>
    </Card>
  );
}
