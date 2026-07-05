import { NavLink, Outlet } from "react-router-dom";
import { Syringe } from "lucide-react";

export function RootLayout() {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
}

export function LandingLayout() {
  return (
    <div className="parent-theme flex min-h-screen flex-col bg-health-canvas bg-mesh-health text-health-text">
      <header className="flex h-16 items-center justify-between border-b border-health-muted bg-health-surface/90 px-6 backdrop-blur-xl lg:px-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-glow ring-1 ring-teal/30">
            <Syringe className="h-4 w-4 text-teal" aria-hidden="true" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-navy">
            VaxReminder
          </span>
        </div>
        <nav aria-label="Landing navigation" className="flex items-center gap-3">
          <NavLink
            to="/auth/parent/login"
            className="text-sm font-medium text-health-text-muted transition-colors hover:text-teal"
          >
            Sign In
          </NavLink>
          <NavLink
            to="/auth/parent/register"
            className="rounded-full bg-navy px-4 py-2 text-sm font-medium text-white shadow-health-card transition-all hover:bg-navy-bright"
          >
            Register
          </NavLink>
        </nav>
      </header>
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
