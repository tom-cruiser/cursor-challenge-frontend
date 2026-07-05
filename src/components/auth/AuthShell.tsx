import { Link } from "react-router-dom";
import { Heart, Syringe } from "lucide-react";
import type { ReactNode } from "react";
import type { UserRole } from "@/types/auth";
import { cn } from "@/lib/cn";

interface AuthShellProps {
  role: UserRole;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

const roleAccent: Record<UserRole, string> = {
  parent: "bg-teal-glow ring-teal/30 text-teal",
  admin: "bg-navy-glow ring-navy/30 text-navy",
};

export function AuthShell({ role, title, subtitle, children, footer }: AuthShellProps) {
  const isParent = role === "parent";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl ring-1",
                roleAccent[role],
              )}
            >
              {isParent ? (
                <Heart className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Syringe className="h-5 w-5" aria-hidden="true" />
              )}
            </div>
            <span className="text-lg font-semibold tracking-tight text-navy">VaxReminder</span>
          </Link>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-navy">{title}</h1>
          <p className="mt-2 text-sm text-health-text-muted">{subtitle}</p>
        </div>

        <div className="rounded-2xl border border-health-muted bg-health-raised p-6 shadow-health-card">
          {children}
        </div>

        <div className="text-center text-sm text-health-text-muted">{footer}</div>
      </div>
    </div>
  );
}
