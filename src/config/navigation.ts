import {
  Bell,
  Building2,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  MapPin,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export const parentNavItems: NavItem[] = [
  { to: "/parent/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/parent/timeline", label: "Timeline", icon: CalendarDays },
  { to: "/parent/hospitals", label: "Nearby Hospitals", icon: MapPin },
  { to: "/parent/reminders", label: "Reminders", icon: Bell },
];

export const adminNavItems: NavItem[] = [
  { to: "/admin/dashboard", label: "Overview Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/families", label: "Families & Children", icon: UsersRound },
  { to: "/admin/hospitals", label: "Hospital Directory", icon: Building2 },
  { to: "/admin/schedules", label: "Vaccine Schedules", icon: ClipboardList },
];
