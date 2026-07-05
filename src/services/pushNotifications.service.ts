import { registerFcmToken } from "@/lib/api/parent";
import { config } from "@/lib/config";
import { isFirebaseConfigured } from "@/lib/firebase-config";

let registrationPromise: Promise<void> | null = null;

async function ensureServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service workers are not supported in this browser.");
  }

  const existing = await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js");
  if (existing) {
    return existing;
  }

  return navigator.serviceWorker.register("/firebase-messaging-sw.js");
}

/**
 * Register FCM web push when Firebase env is configured.
 * No-ops silently when Firebase is missing, permission denied, or SDK unavailable.
 */
export async function registerPushNotifications(): Promise<void> {
  if (!isFirebaseConfigured()) {
    return;
  }

  if (!("Notification" in window)) {
    return;
  }

  if (registrationPromise) {
    return registrationPromise;
  }

  registrationPromise = (async () => {
    try {
      const permission =
        Notification.permission === "default"
          ? await Notification.requestPermission()
          : Notification.permission;

      if (permission !== "granted") {
        console.info("[push] Notification permission not granted.");
        return;
      }

      const [{ getToken, onMessage }, { getFirebaseMessaging }] = await Promise.all([
        import("firebase/messaging"),
        import("@/lib/firebase"),
      ]);

      const swRegistration = await ensureServiceWorker();
      const messaging = await getFirebaseMessaging();
      const token = await getToken(messaging, {
        vapidKey: config.firebase.vapidKey,
        serviceWorkerRegistration: swRegistration,
      });

      if (!token) {
        console.warn("[push] No FCM token returned.");
        return;
      }

      await registerFcmToken(token);
      console.info("[push] FCM token registered with backend.");

      onMessage(messaging, (payload) => {
        const title = payload.notification?.title ?? "Vaccination Reminder";
        const body = payload.notification?.body ?? "";
        if (Notification.permission === "granted") {
          new Notification(title, { body, icon: "/icon.png" });
        }
      });
    } catch (err) {
      console.warn("[push] Push notification setup skipped:", err);
    }
  })();

  await registrationPromise;
}
