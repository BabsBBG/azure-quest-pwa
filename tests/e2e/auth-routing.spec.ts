import { expect, test } from "@playwright/test";

test("unauthenticated root redirects to signup", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/auth\?mode=signup/);
  await expect(page.getByRole("heading", { name: /Create your PraxisGrid account/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Create account/i })).toBeVisible();
});

test("unauthenticated admin redirects to sign in", async ({ page }) => {
  await page.goto("/admin");

  await expect(page).toHaveURL(/\/auth\?mode=signin/);
  await expect(page.getByRole("heading", { name: /Sign in to PraxisGrid/i })).toBeVisible();
});

test("public legal and status routes render without authentication", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { name: /Privacy notice/i })).toBeVisible();

  await page.goto("/terms");
  await expect(page.getByRole("heading", { name: /Terms of use/i })).toBeVisible();

  await page.goto("/status");
  await expect(page.getByRole("heading", { name: /System status/i })).toBeVisible();
});

test("@visual auth page has a stable mobile-safe primary frame", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 667 });
  await page.goto("/auth?mode=signup");

  await expect(page.getByRole("heading", { name: /Create your PraxisGrid account/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Create account/i })).toBeVisible();
  await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
});
