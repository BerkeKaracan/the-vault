import { expect, test } from "@playwright/test";

test("dev login, catalog add, and heatmap heat", async ({ page }) => {
  await page.goto("/login");
  await page
    .getByRole("button", {
      name: /Yerel test · testuser@gmail.com|Local test · testuser@gmail.com/,
    })
    .click();
  await page.waitForURL("**/desk");

  await page.goto("/discover");
  await page
    .getByPlaceholder(/Kitap, yazar, konu|Book, author, topic/)
    .fill("Woolf");
  await page.getByRole("button", { name: /^(Ara|Search)$/ }).click();
  await page
    .getByRole("button", { name: /Masaya ekle|Add to desk/ })
    .first()
    .click();
  await page.waitForURL(/\/materials\//);

  await page.goto("/desk");
  await page.getByRole("button", { name: "+10" }).first().click();
  await expect(
    page.locator("button.heat-1, button.heat-2, button.heat-3, button.heat-4"),
  ).not.toHaveCount(0);
});

test("google oauth leaves the vault origin", async ({ page }) => {
  await page.goto("/login");
  await page
    .getByRole("button", { name: /Google ile devam et|Continue with Google/ })
    .click();
  await page.waitForURL(/accounts\.google\.com/);
});
