// Thin wrapper over the browser Notification API. No-ops silently when
// unsupported or denied — the in-app toast (ToastContext) is always the
// primary, guaranteed-to-be-seen channel; this is a bonus real OS-level alert.

export function isNotificationSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return "unsupported";
  if (Notification.permission === "granted" || Notification.permission === "denied") {
    return Notification.permission;
  }
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

export function notify(title, options = {}) {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== "granted") return false;
  try {
    new Notification(title, { icon: "/favicon.svg", ...options });
    return true;
  } catch {
    return false;
  }
}
