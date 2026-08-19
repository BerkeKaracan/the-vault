import { expect, test } from "@playwright/test";

test("cron rejects a request without the bearer secret", async ({
  request,
}) => {
  const res = await request.get("/api/cron/goal-reminders");
  expect(res.status()).toBe(401);
  await expect(res.json()).resolves.toEqual({ error: "authRequired" });
});

test("cron rejects a wrong bearer secret", async ({ request }) => {
  const res = await request.post("/api/cron/goal-reminders", {
    headers: { authorization: "Bearer not-the-secret" },
  });
  expect(res.status()).toBe(401);
});

test("cron accepts the configured bearer secret", async ({ request }) => {
  const secret = process.env.CRON_SECRET?.trim();
  expect(secret, "CRON_SECRET").toBeTruthy();

  const res = await request.get("/api/cron/goal-reminders", {
    headers: { authorization: `Bearer ${secret}` },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.ok).toBe(true);
  expect(typeof body.sent).toBe("number");
});

test("books search requires a session", async ({ request }) => {
  const res = await request.get("/api/books/search?q=woolf");
  expect(res.status()).toBe(401);
});

test("today progress requires a session", async ({ request }) => {
  const res = await request.get("/api/progress/today");
  expect(res.status()).toBe(401);
  await expect(res.json()).resolves.toEqual({ error: "authRequired" });
});

test("push subscribe requires a session", async ({ request }) => {
  const res = await request.post("/api/push/subscribe", {
    data: { endpoint: "https://example.com", keys: { p256dh: "x", auth: "y" } },
  });
  expect(res.status()).toBe(401);
});
