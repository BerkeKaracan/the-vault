import { describe, expect, it } from "vitest";
import {
  goalNotificationOptions,
  NOTIFICATION_ICON,
  NOTIFICATION_URL,
} from "@/lib/notification-options";

describe("goalNotificationOptions", () => {
  it("points the action at the desk with a stable tag", () => {
    expect(
      goalNotificationOptions({
        title: "Goal",
        body: "Log a page",
        tag: "goal-12h",
        actionTitle: "Desk",
      }),
    ).toEqual({
      body: "Log a page",
      tag: "goal-12h",
      icon: NOTIFICATION_ICON,
      badge: NOTIFICATION_ICON,
      data: { url: NOTIFICATION_URL },
      actions: [{ action: "desk", title: "Desk" }],
    });
  });
});
