import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="parent-theme flex min-h-screen flex-col bg-health-canvas bg-mesh-health text-health-text">
      <Outlet />
    </div>
  );
}
