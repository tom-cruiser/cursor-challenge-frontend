import { MapPin, Navigation, Star } from "lucide-react";
import { Badge } from "@/components/ui";
import {
  formatDistance,
  getHospitalsByCluster,
} from "@/lib/hospital-utils";
import { cn } from "@/lib/cn";
import { CLUSTER_LABELS, type MapCluster, type NearbyHospital } from "@/types/hospital";

interface HospitalMapViewProps {
  hospitals: NearbyHospital[];
  preferredHospitalId: string | null;
  selectedHospitalId: string | null;
  onSelectHospital: (hospitalId: string) => void;
  locationLabel: string;
}

const GRID_ROWS = 5;
const GRID_COLS = 5;

const clusterZones: Record<
  MapCluster,
  { label: string; rowStart: number; rowEnd: number; colStart: number; colEnd: number }
> = {
  north: { label: CLUSTER_LABELS.north, rowStart: 1, rowEnd: 2, colStart: 1, colEnd: 5 },
  central: { label: CLUSTER_LABELS.central, rowStart: 3, rowEnd: 3, colStart: 2, colEnd: 4 },
  west: { label: CLUSTER_LABELS.west, rowStart: 4, rowEnd: 5, colStart: 1, colEnd: 3 },
};

function MapMarker({
  hospital,
  isPreferred,
  isSelected,
  onSelect,
}: {
  hospital: NearbyHospital;
  isPreferred: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${hospital.name}, ${formatDistance(hospital.distanceKm)} away${isPreferred ? ", preferred center" : ""}`}
      aria-pressed={isSelected}
      className={cn(
        "group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center transition-transform duration-150 hover:scale-110",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
      )}
      style={{
        top: `${(hospital.gridPosition.row / GRID_ROWS) * 100}%`,
        left: `${(hospital.gridPosition.col / GRID_COLS) * 100}%`,
      }}
    >
      <span
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-full ring-2 transition-all",
          isPreferred
            ? "bg-accent text-canvas ring-accent-bright shadow-glow"
            : isSelected
              ? "bg-info text-canvas ring-info-bright"
              : "bg-surface-raised text-teal ring-border-strong group-hover:ring-teal/40",
        )}
      >
        <MapPin className="h-4 w-4" aria-hidden="true" />
        {isPreferred && (
          <Star
            className="absolute -right-1 -top-1 h-3.5 w-3.5 fill-accent-bright text-canvas"
            aria-hidden="true"
          />
        )}
      </span>
      <span
        className={cn(
          "mt-1 max-w-[7rem] truncate rounded-md px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm",
          isSelected
            ? "bg-teal-glow text-navy ring-1 ring-teal/30"
            : "bg-surface/90 text-health-text-muted ring-1 ring-border-subtle",
        )}
      >
        {hospital.name.split(" ")[0]}
      </span>
    </button>
  );
}

export function HospitalMapView({
  hospitals,
  preferredHospitalId,
  selectedHospitalId,
  onSelectHospital,
  locationLabel,
}: HospitalMapViewProps) {
  const clusters = getHospitalsByCluster(hospitals);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-muted/50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-health-text-muted">
          <Navigation className="h-4 w-4 text-teal" aria-hidden="true" />
          <span>
            Near{" "}
            <span className="font-medium text-health-text">{locationLabel}</span>
          </span>
        </div>
        <Badge variant="outline">{hospitals.length} facilities in range</Badge>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-border-subtle bg-canvas-subtle shadow-card">
        <div
          className="relative aspect-[4/3] w-full sm:aspect-[16/9]"
          role="img"
          aria-label="Map showing nearby hospital clusters"
        >
          <div
            className="absolute inset-0 grid gap-px bg-border-subtle p-px"
            style={{
              gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
              gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
            }}
          >
            {Array.from({ length: GRID_ROWS * GRID_COLS }).map((_, index) => (
              <div
                key={index}
                className="bg-surface-muted/40"
                aria-hidden="true"
              />
            ))}
          </div>

          {(Object.keys(clusterZones) as MapCluster[]).map((cluster) => {
            const zone = clusterZones[cluster];
            const top = ((zone.rowStart - 1) / GRID_ROWS) * 100;
            const left = ((zone.colStart - 1) / GRID_COLS) * 100;
            const height = ((zone.rowEnd - zone.rowStart + 1) / GRID_ROWS) * 100;
            const width = ((zone.colEnd - zone.colStart + 1) / GRID_COLS) * 100;

            return (
              <div
                key={cluster}
                className="pointer-events-none absolute rounded-lg border border-dashed border-slate-700/60 bg-surface/20"
                style={{ top: `${top}%`, left: `${left}%`, height: `${height}%`, width: `${width}%` }}
              >
                <span className="absolute left-2 top-2 text-[10px] font-medium uppercase tracking-wider text-health-text-muted">
                  {zone.label}
                </span>
              </div>
            );
          })}

          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-info shadow-glow-sm ring-2 ring-info/50">
              <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
            </span>
            <span className="sr-only">Your location</span>
          </div>

          {hospitals.map((hospital) => (
            <MapMarker
              key={hospital.id}
              hospital={hospital}
              isPreferred={hospital.id === preferredHospitalId}
              isSelected={hospital.id === selectedHospitalId}
              onSelect={() => onSelectHospital(hospital.id)}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {(Object.keys(clusters) as MapCluster[]).map((cluster) => (
          <div
            key={cluster}
            className="rounded-lg border border-border-subtle bg-surface-raised p-3"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-health-text-muted">
              {CLUSTER_LABELS[cluster]}
            </p>
            <p className="mt-1 text-2xl font-bold text-navy">
              {clusters[cluster].length}
            </p>
            <p className="text-xs text-health-text-muted">facilities</p>
          </div>
        ))}
      </div>
    </div>
  );
}
