import { test, expect } from "@playwright/test";

/**
 * UI smoke: login page renders and accepts credentials when stack is up.
 * Skips if API login fails (no backend).
 */
test.describe("Login UI smoke", () => {
  test("shows sign-in form and logs in with seeded admin", async ({ page }) => {
    await page.goto("/en/login");

    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();

    await page
      .getByLabel("Email")
      .fill(process.env.E2E_USER_EMAIL ?? "admin@nurox.app");
    await page
      .getByLabel("Password")
      .fill(process.env.E2E_USER_PASSWORD ?? "password123");

    await page.getByRole("button", { name: /sign in/i }).click();

    await page.waitForURL(/\/(en|bn)?\/(dashboard|hr|sales)/, {
      timeout: 20000,
    });

    expect(page.url()).not.toContain("/login");
  });
});
