import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWdRKb9_O6XSYu1bMjGyFPji1JZp-DdQU",
  authDomain: "pryzen-5b2d2.firebaseapp.com",
  projectId: "pryzen-5b2d2",
  storageBucket: "pryzen-5b2d2.firebasestorage.app",
  messagingSenderId: "978560712860",
  appId: "1:978560712860:web:ccc04939d97fc0a8b7ad59"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging (only in browser context)
let messaging: Messaging | null = null;

export function getFirebaseMessaging(): Messaging | null {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (!messaging) {
      messaging = getMessaging(app);
    }
    return messaging;
  }
  return null;
}

// VAPID Key for FCM
const VAPID_KEY = "BD-f7kSkxdakIy_NHWf2zW6LAekOAMRVPOLvRuWPsjIj5Z5KX38S0nAdjR4C0sHjL1RwZkgqKB08nMkYoTvIS8k";

// Function to request notification permission and get FCM token
export async function requestNotificationPermission(): Promise<string | null> {
  try {
    const messagingInstance = getFirebaseMessaging();
    if (!messagingInstance) {
      console.log('Messaging not supported in this environment');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messagingInstance, { vapidKey: VAPID_KEY });
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

// Listen for foreground messages
export function onForegroundMessage(callback: (payload: any) => void): (() => void) | undefined {
  const messagingInstance = getFirebaseMessaging();
  if (!messagingInstance) return undefined;
  
  return onMessage(messagingInstance, callback);
}
