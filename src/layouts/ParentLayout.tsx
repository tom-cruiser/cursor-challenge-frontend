import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, LogOut, Syringe } from "lucide-react";
import { BottomNav, SidebarNav } from "@/components/navigation";
import { NotificationDrawer } from "@/components/parent";
import { Button } from "@/components/ui";
import { parentNavItems } from "@/config/navigation";
import { ParentProvider, useAuth, useParentContext } from "@/contexts";
import { cn } from "@/lib/cn";

function ParentLayoutShell() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const {
    user,
    children,
    unreadReminders,
    notifications,
    unreadNotificationCount,
    notificationLeadTime,
    readNotificationIds,
    setNotificationLeadTime,
    markNotificationRead,
    markAllNotificationsRead,
  } = useParentContext();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const badgeForItem = (item: (typeof parentNavItems)[number]) =>
    item.label === "Reminders" ? unreadReminders : undefined;

  return (
    <div className="parent-theme flex min-h-screen flex-col md:flex-row">
      <aside
        className="layout-sidebar hidden md:flex"
        aria-label="Parent navigation"
      >
        <div className="flex h-14 items-center gap-2.5 border-b border-health-muted px-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-glow ring-1 ring-teal/30">
            <Syringe className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold text-navy">VaxReminder</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-health-text-muted">
              Parent Space
            </p>
          </div>
        </div>

        <SidebarNav items={parentNavItems} badgeForItem={badgeForItem} />

        <div className="border-t border-border-subtle p-3">
          <NavLink to="/" className="nav-link text-xs text-slate-500">
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
            Back to Home
          </NavLink>
        </div>
      </aside>

      <div className="layout-main pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        <header className="layout-header">
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-glow text-xs font-semibold text-teal ring-1 ring-teal/30"
              aria-hidden="true"
            >
              {user.initials}
            </div>
            <div>
              <p className="text-sm font-medium text-health-text">{user.name}</p>
              <p className="text-xs text-health-text-muted">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDrawerOpen(true)}
              aria-label={
                unreadNotificationCount > 0
                  ? `Open notifications, ${unreadNotificationCount} unread`
                  : "Open notifications"
              }
              className="relative"
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Notifications</span>
              {unreadNotificationCount > 0 && (
                <span
                  className={cn(
                    "absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-alert px-1 text-[9px] font-bold text-canvas",
                  )}
                  aria-hidden="true"
                >
                  {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                logout();
                navigate("/auth/parent/login");
              }}
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </header>

        <div className="layout-content">
          <Outlet />
        </div>
      </div>

      <BottomNav items={parentNavItems} badgeForItem={badgeForItem} />

      <NotificationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        notifications={notifications}
        unreadCount={unreadNotificationCount}
        leadTimeDays={notificationLeadTime}
        onLeadTimeChange={setNotificationLeadTime}
        onMarkRead={markNotificationRead}
        onMarkAllRead={markAllNotificationsRead}
        readIds={readNotificationIds}
        hasChildren={children.length > 0}
      />
    </div>
  );
}

export function ParentLayout() {
  return (
    <ParentProvider>
      <ParentLayoutShell />
    </ParentProvider>
  );
}
