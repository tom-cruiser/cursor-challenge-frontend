import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle bg-surface-muted/30 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-overlay ring-1 ring-border-subtle">
        <Icon className="h-6 w-6 text-health-text-muted" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-health-text">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-health-text-muted">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
