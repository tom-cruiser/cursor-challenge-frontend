import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { generateLeadTimeNotifications } from "@/data/notificationEngine";
import { countDueSoonMilestones } from "@/data/timelineEngine";
import { mapChildWithTimeline } from "@/lib/api/mappers";
import * as parentApi from "@/lib/api/parent";
import { isApiConfigured } from "@/lib/config";
import { useAuth } from "@/contexts/AuthContext";
import type { AddChildInput, ChildProfile, ParentUser } from "@/types/user";
import type { AppNotification, LeadTimeDays } from "@/types/notification";
import { DEFAULT_REMINDER_CHANNELS } from "@/types/auth";

interface ParentContextValue {
  user: ParentUser;
  children: ChildProfile[];
  unreadReminders: number;
  activeChildId: string | null;
  activeChild: ChildProfile | null;
  notifications: AppNotification[];
  unreadNotificationCount: number;
  notificationLeadTime: LeadTimeDays;
  isLoading: boolean;
  error: string | null;
  refreshChildren: () => Promise<void>;
  setActiveChildId: (id: string | null) => void;
  setNotificationLeadTime: (days: LeadTimeDays) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  readNotificationIds: Set<string>;
  addChild: (input: AddChildInput) => Promise<ChildProfile>;
  toggleMilestone: (childId: string, milestoneId: string) => Promise<void>;
  setPreferredHospital: (childId: string, hospitalId: string) => Promise<void>;
  setVaccinationCardImage: (childId: string, imageUrl: string | null) => void;
}

const ParentContext = createContext<ParentContextValue | null>(null);

async function loadChildrenFromApi(): Promise<ChildProfile[]> {
  const children = await parentApi.listChildren();
  const profiles = await Promise.all(
    children.map(async (child) => {
      const timeline = await parentApi.getTimeline(child.id);
      return mapChildWithTimeline(child, timeline);
    }),
  );
  return profiles;
}

export function ParentProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth();
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [notificationLeadTime, setNotificationLeadTime] = useState<LeadTimeDays>(3);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canLoadData = isApiConfigured() && Boolean(authUser?.id);

  const refreshChildren = useCallback(async () => {
    if (!canLoadData) {
      setChildProfiles([]);
      setActiveChildId(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const profiles = await loadChildrenFromApi();
      setChildProfiles(profiles);
      setActiveChildId((current) => {
        if (current && profiles.some((child) => child.id === current)) {
          return current;
        }
        return profiles[0]?.id ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load children.");
      setChildProfiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [canLoadData]);

  useEffect(() => {
    void refreshChildren();
  }, [refreshChildren, authUser?.id]);

  const addChild = useCallback(
    async (input: AddChildInput) => {
      if (!canLoadData) {
        throw new Error("Backend API is not available.");
      }

      const result = await parentApi.createChild({
        name: input.name.trim(),
        dateOfBirth: input.dateOfBirth,
        sex: input.sex,
      });
      const profile = mapChildWithTimeline(result.child, result.schedule);
      setChildProfiles((current) => [...current, profile]);
      setActiveChildId(profile.id);
      return profile;
    },
    [canLoadData],
  );

  const toggleMilestone = useCallback(
    async (childId: string, milestoneId: string) => {
      if (!canLoadData) {
        return;
      }

      const child = childProfiles.find((profile) => profile.id === childId);
      const milestone = child?.milestones.find((item) => item.id === milestoneId);

      if (!milestone || milestone.completed) {
        return;
      }

      await parentApi.markTimelineComplete(milestoneId);
      await refreshChildren();
    },
    [childProfiles, canLoadData, refreshChildren],
  );

  const setPreferredHospital = useCallback(
    async (childId: string, hospitalId: string) => {
      if (!canLoadData) {
        return;
      }

      const child = childProfiles.find((profile) => profile.id === childId);
      const isCurrentlyPreferred = child?.preferredHospitalId === hospitalId;

      if (isCurrentlyPreferred) {
        return;
      }

      await parentApi.registerToHospital(hospitalId);
      const result = await parentApi.setPreferredHospital(childId, hospitalId);
      const profile = mapChildWithTimeline(result.child, result.schedule);
      setChildProfiles((current) =>
        current.map((item) => (item.id === childId ? profile : item)),
      );
    },
    [childProfiles, canLoadData],
  );

  const setVaccinationCardImage = useCallback(
    (childId: string, imageUrl: string | null) => {
      setChildProfiles((current) =>
        current.map((child) =>
          child.id === childId ? { ...child, vaccinationCardImageUrl: imageUrl } : child,
        ),
      );
    },
    [],
  );

  const activeChild = useMemo(
    () => childProfiles.find((child) => child.id === activeChildId) ?? null,
    [childProfiles, activeChildId],
  );

  const notifications = useMemo(
    () => generateLeadTimeNotifications(childProfiles, notificationLeadTime),
    [childProfiles, notificationLeadTime],
  );

  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => !readNotificationIds.has(n.id)).length,
    [notifications, readNotificationIds],
  );

  const unreadReminders = useMemo(
    () =>
      childProfiles.reduce(
        (total, child) => total + countDueSoonMilestones(child.milestones),
        0,
      ),
    [childProfiles],
  );

  const markNotificationRead = useCallback((id: string) => {
    setReadNotificationIds((current) => new Set([...current, id]));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setReadNotificationIds(
      (current) => new Set([...current, ...notifications.map((n) => n.id)]),
    );
  }, [notifications]);

  const value = useMemo<ParentContextValue>(
    () => ({
      user: {
        id: authUser?.id ?? "parent-unknown",
        name: authUser?.name ?? "Parent",
        email: authUser?.email ?? "",
        initials: authUser?.initials ?? "PA",
        phone: authUser?.phone ?? "",
        reminderChannels: authUser?.reminderChannels ?? DEFAULT_REMINDER_CHANNELS,
      },
      children: childProfiles,
      unreadReminders,
      activeChildId,
      activeChild,
      notifications,
      unreadNotificationCount,
      notificationLeadTime,
      isLoading,
      error,
      refreshChildren,
      readNotificationIds,
      setActiveChildId,
      setNotificationLeadTime,
      markNotificationRead,
      markAllNotificationsRead,
      addChild,
      toggleMilestone,
      setPreferredHospital,
      setVaccinationCardImage,
    }),
    [
      authUser,
      childProfiles,
      unreadReminders,
      activeChildId,
      activeChild,
      notifications,
      unreadNotificationCount,
      notificationLeadTime,
      isLoading,
      error,
      refreshChildren,
      readNotificationIds,
      markNotificationRead,
      markAllNotificationsRead,
      addChild,
      toggleMilestone,
      setPreferredHospital,
      setVaccinationCardImage,
    ],
  );

  return (
    <ParentContext.Provider value={value}>{children}</ParentContext.Provider>
  );
}

export function useParentContext(): ParentContextValue {
  const context = useContext(ParentContext);
  if (!context) {
    throw new Error("useParentContext must be used within a ParentProvider");
  }
  return context;
}
