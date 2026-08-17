export const NOTIFICATION_ICON = "/icon";
export const NOTIFICATION_URL = "/desk";

export type GoalNotificationInput = {
  title: string;
  body: string;
  tag: string;
  actionTitle: string;
};

export function goalNotificationOptions(input: GoalNotificationInput) {
  return {
    body: input.body,
    tag: input.tag,
    icon: NOTIFICATION_ICON,
    badge: NOTIFICATION_ICON,
    data: { url: NOTIFICATION_URL },
    actions: [{ action: "desk", title: input.actionTitle }],
  };
}
