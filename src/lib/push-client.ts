import { goalNotificationOptions } from "@/lib/notification-options";

const SW_PATH = "/sw.js";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob(`${base64.replace(/-/g, "+").replace(/_/g, "/")}${padding}`);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export function notificationsSupported() {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator
  );
}

export async function registerGoalWorker() {
  if (!notificationsSupported()) return null;
  return navigator.serviceWorker.register(SW_PATH);
}

export async function subscribeGoalPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  if (!publicKey || !notificationsSupported()) return false;

  const registration = await registerGoalWorker();
  if (!registration) return false;

  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    }));

  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription.toJSON()),
  });
  return res.ok;
}

export async function unsubscribeGoalPush() {
  if (!notificationsSupported()) return;
  const registration = await navigator.serviceWorker.getRegistration(SW_PATH);
  const subscription = await registration?.pushManager.getSubscription();
  if (subscription) {
    await fetch("/api/push/subscribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
    await subscription.unsubscribe();
  }
}

export async function showGoalNotification(input: {
  title: string;
  body: string;
  tag: string;
  actionTitle: string;
}) {
  const options = goalNotificationOptions(input);
  const registration = await navigator.serviceWorker.getRegistration(SW_PATH);
  if (registration) {
    await registration.showNotification(input.title, options);
    return;
  }
  if (Notification.permission === "granted") {
    new Notification(input.title, options);
  }
}
