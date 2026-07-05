import type { FirebaseApp } from "firebase/app";
import type { Messaging } from "firebase/messaging";
import { config } from "@/lib/config";
import { isFirebaseConfigured } from "@/lib/firebase-config";

let firebaseApp: FirebaseApp | null = null;
let messagingInstance: Messaging | null = null;

export { isFirebaseConfigured } from "@/lib/firebase-config";

export async function getFirebaseApp(): Promise<FirebaseApp> {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured. Set VITE_FIREBASE_* in .env.");
  }

  if (!firebaseApp) {
    const { initializeApp } = await import("firebase/app");
    firebaseApp = initializeApp({
      apiKey: config.firebase.apiKey,
      authDomain: config.firebase.authDomain,
      projectId: config.firebase.projectId,
      storageBucket: config.firebase.storageBucket,
      messagingSenderId: config.firebase.messagingSenderId,
      appId: config.firebase.appId,
    });
  }

  return firebaseApp;
}

export async function getFirebaseMessaging(): Promise<Messaging> {
  if (!messagingInstance) {
    const { getMessaging } = await import("firebase/messaging");
    messagingInstance = getMessaging(await getFirebaseApp());
  }

  return messagingInstance;
}
