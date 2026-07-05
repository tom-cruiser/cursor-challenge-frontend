import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const priorityStyles = {
  core: "bg-sage-glow text-sage-muted ring-1 ring-sage/30",
  high: "bg-caution-glow text-caution ring-1 ring-caution/30",
  medium: "bg-teal-glow text-teal-muted ring-1 ring-teal/30",
} as const;

const variantStyles = {
  default: "bg-health-muted text-health-text-muted ring-1 ring-health-muted",
  outline: "bg-transparent text-health-text-muted ring-1 ring-health-muted",
} as const;

export type BadgePriority = keyof typeof priorityStyles;
export type BadgeVariant = keyof typeof variantStyles;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  priority?: BadgePriority;
  variant?: BadgeVariant;
}

export function Badge({
  className,
  priority,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        priority ? priorityStyles[priority] : variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
