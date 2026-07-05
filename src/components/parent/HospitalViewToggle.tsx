import { List, Map } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";

export type HospitalViewMode = "list" | "map";

interface HospitalViewToggleProps {
  viewMode: HospitalViewMode;
  onChange: (mode: HospitalViewMode) => void;
}

export function HospitalViewToggle({ viewMode, onChange }: HospitalViewToggleProps) {
  return (
    <div
      className="inline-flex rounded-lg bg-surface-muted p-1 ring-1 ring-border-subtle"
      role="group"
      aria-label="View mode"
    >
      {(
        [
          { mode: "list" as const, label: "List View", icon: List },
          { mode: "map" as const, label: "Map View", icon: Map },
        ] as const
      ).map(({ mode, label, icon: Icon }) => (
        <Button
          key={mode}
          variant="ghost"
          size="sm"
          onClick={() => onChange(mode)}
          aria-pressed={viewMode === mode}
          className={cn(
            "gap-2 rounded-md px-3",
            viewMode === mode &&
              "bg-teal-glow text-navy shadow-glow-teal-sm ring-1 ring-teal/20 hover:bg-teal-glow hover:text-navy",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          {label}
        </Button>
      ))}
    </div>
  );
}
