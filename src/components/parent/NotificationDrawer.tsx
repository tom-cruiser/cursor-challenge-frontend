import { useEffect } from "react";
import { Bell, Clock, Settings2, X } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { formatDueDate } from "@/data/notificationEngine";
import { cn } from "@/lib/cn";
import {
  LEAD_TIME_LABELS,
  LEAD_TIME_OPTIONS,
  type AppNotification,
  type LeadTimeDays,
} from "@/types/notification";

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  unreadCount: number;
  leadTimeDays: LeadTimeDays;
  onLeadTimeChange: (days: LeadTimeDays) => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  readIds: Set<string>;
  hasChildren: boolean;
}

function NotificationCard({
  notification,
  isRead,
  onMarkRead,
}: {
  notification: AppNotification;
  isRead: boolean;
  onMarkRead: () => void;
}) {
  const isUrgent = notification.daysUntilDue <= 1;
  const isOverdue = notification.daysUntilDue < 0;

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all",
        isRead
          ? "border-border-subtle bg-surface-muted/30 opacity-75"
          : isUrgent
            ? "border-alert/30 bg-alert-glow/20 shadow-glow-alert"
            : "border-info/20 bg-info-glow/10",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1",
            isUrgent
              ? "bg-alert text-canvas ring-alert/40"
              : "bg-info text-canvas ring-info/40",
          )}
          aria-hidden="true"
        >
          <Bell className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-health-text">{notification.message}</p>
            {!isRead && (
              <Badge priority={isOverdue || isUrgent ? "high" : "medium"}>
                {isOverdue
                  ? "Overdue"
                  : isUrgent
                    ? "1-day warning"
                    : `${notification.leadTimeDays}-day warning`}
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-health-text-muted">{notification.doseLabel}</p>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-health-text-muted">
            <Clock className="h-3 w-3" aria-hidden="true" />
            Due {formatDueDate(notification.dueDate)}
            {!isRead && (
              <span className="text-teal">
                · Lead time: {LEAD_TIME_LABELS[notification.leadTimeDays]}
              </span>
            )}
          </p>
          {!isRead && (
            <Button variant="ghost" size="sm" className="mt-2 h-7 px-2 text-xs" onClick={onMarkRead}>
              Mark as read
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function NotificationDrawer({
  open,
  onClose,
  notifications,
  unreadCount,
  leadTimeDays,
  onLeadTimeChange,
  onMarkRead,
  onMarkAllRead,
  readIds,
  hasChildren,
}: NotificationDrawerProps) {
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

  const unreadNotifications = notifications.filter((n) => !readIds.has(n.id));

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-canvas/80 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close notifications"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-drawer-title"
        className="relative flex h-full w-full max-w-md flex-col border-l border-border-subtle bg-surface shadow-card"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border-subtle px-5 py-4">
          <div>
            <h2 id="notification-drawer-title" className="text-lg font-semibold text-navy">
              Notifications
            </h2>
            <p className="mt-0.5 text-sm text-health-text-muted">
              In-app alerts · push requires browser permission
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="border-b border-border-subtle px-5 py-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-health-text-muted">
            <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
            Lead-time setting
          </div>
          <div
            className="mt-2 flex rounded-lg bg-surface-muted p-1 ring-1 ring-border-subtle"
            role="group"
            aria-label="Notification lead time"
          >
            {LEAD_TIME_OPTIONS.map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => onLeadTimeChange(days)}
                aria-pressed={leadTimeDays === days}
                className={cn(
                  "flex-1 rounded-md px-3 py-2 text-xs font-semibold transition-all",
                  leadTimeDays === days
                    ? "bg-teal-glow text-navy ring-1 ring-teal/20"
                    : "text-health-text-muted hover:text-health-text",
                )}
              >
                {LEAD_TIME_LABELS[days]}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-health-text-muted">
            Alerts appear when a dose is due within your selected window.
          </p>
        </div>

        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3">
          <span className="text-sm text-health-text-muted">
            {unreadCount > 0 ? (
              <>
                <span className="font-semibold text-alert-bright">{unreadCount}</span> unread
              </>
            ) : (
              "All caught up"
            )}
          </span>
          {unreadNotifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onMarkAllRead}>
              Mark all read
            </Button>
          )}
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {!hasChildren ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-10 w-10 text-health-text-muted" aria-hidden="true" />
              <p className="mt-4 text-sm font-medium text-health-text">No notifications yet</p>
              <p className="mt-1 max-w-xs text-sm text-health-text-muted">
                Add a child profile to receive lead-time vaccination reminders here.
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-10 w-10 text-health-text-muted" aria-hidden="true" />
              <p className="mt-4 text-sm font-medium text-health-text">No alerts in this window</p>
              <p className="mt-1 max-w-xs text-sm text-health-text-muted">
                No doses are due within {leadTimeDays} day{leadTimeDays > 1 ? "s" : ""}. Try
                switching to {leadTimeDays === 1 ? "3 days" : "1 day"} before.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                isRead={readIds.has(notification.id)}
                onMarkRead={() => onMarkRead(notification.id)}
              />
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
