import { test, expect } from "@playwright/test";

const EMAIL = process.env.E2E_EMAIL ?? "test@example.com";
const PASSWORD = process.env.E2E_PASSWORD ?? "password123";

test("login and access home page", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  // await expect(page).toHaveURL("/");
  // await expect(page.getByRole("button", { name: "New" })).toBeVisible();
});
