import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  width?: "md" | "lg";
}

export function SlideOver({
  open,
  onClose,
  title,
  description,
  children,
  width = "lg",
}: SlideOverProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-navy/25 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close panel"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="slideover-title"
        aria-describedby={description ? "slideover-description" : undefined}
        className={cn(
          "relative flex h-full w-full flex-col border-l border-health-muted bg-health-surface shadow-health-card",
          width === "md" ? "max-w-md" : "max-w-xl",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-health-muted px-6 py-5">
          <div>
            <h2 id="slideover-title" className="text-lg font-semibold text-navy">
              {title}
            </h2>
            {description && (
              <p id="slideover-description" className="mt-1 text-sm text-health-text-muted">
                {description}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
