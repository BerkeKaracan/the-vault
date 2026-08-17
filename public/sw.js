const ICON = "/icon/192";
const DEFAULT_BODY = "Back to the desk. Light today’s cell.";

self.addEventListener("push", (event) => {
  let payload = {
    title: "The Vault",
    body: DEFAULT_BODY,
    url: "/desk",
    tag: "vault",
    actionTitle: "Desk",
  };
  try {
    payload = { ...payload, ...event.data.json() };
  } catch {
    /* keep defaults */
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body || DEFAULT_BODY,
      tag: payload.tag,
      icon: ICON,
      badge: ICON,
      data: { url: payload.url || "/desk" },
      actions: [{ action: "desk", title: payload.actionTitle || "Desk" }],
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/desk";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if ("focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      }),
  );
});
