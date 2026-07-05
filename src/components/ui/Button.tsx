import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const variantStyles = {
  primary:
    "bg-accent text-canvas shadow-glow-sm hover:bg-accent-bright active:bg-accent-muted",
  secondary:
    "bg-surface-overlay text-health-text ring-1 ring-border-subtle hover:bg-surface-raised hover:ring-border-strong",
  outline:
    "bg-transparent text-health-text ring-1 ring-border-subtle hover:bg-surface-muted hover:ring-border-strong",
  ghost:
    "bg-transparent text-health-text-muted hover:bg-surface-overlay/50 hover:text-health-text",
  danger:
    "bg-danger-muted text-white hover:bg-danger active:bg-danger-muted ring-1 ring-danger/40",
} as const;

const sizeStyles = {
  sm: "h-8 gap-1.5 rounded-lg px-3 text-xs",
  md: "h-10 gap-2 rounded-lg px-4 text-sm",
  lg: "h-12 gap-2.5 rounded-xl px-6 text-sm",
} as const;

export type ButtonVariant = keyof typeof variantStyles;
export type ButtonSize = keyof typeof sizeStyles;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
          "disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden="true"
            />
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
