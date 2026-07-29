import { expect, test, type Page } from "@playwright/test";

const localBasePattern = /127\.0\.0\.1|localhost/;

async function seedE2eUser(page: Page, options: { role?: string; onboarded?: boolean } = {}) {
  await page.addInitScript((fixture) => {
    window.localStorage.setItem("praxisgrid:e2e-auth", JSON.stringify(fixture));
  }, {
    id: `e2e-${options.role ?? "USER"}`.toLowerCase(),
    email: `${(options.role ?? "user").toLowerCase()}@example.com`,
    name: "E2E Learner",
    role: options.role ?? "USER",
    onboarded: options.onboarded === true,
    primaryCert: "SC-300",
    goal: "learn",
    experience: "new"
  });
}

test.describe("signed-in learner and admin browser gates", () => {
  test.skip(({ baseURL }) => !localBasePattern.test(baseURL ?? ""), "Uses the dev-only E2E auth harness, never production.");

  test("signed-in learner must complete onboarding before protected learning routes", async ({ page }) => {
    await seedE2eUser(page, { onboarded: false });
    await page.goto("/cert/sc-300/knowledge");

    await expect(page).toHaveURL(/\/onboarding\?from=%2Fcert%2Fsc-300%2Fknowledge/);
    await expect(page.getByRole("heading", { name: /Set up your PraxisGrid workspace/i })).toBeVisible();

    await page.getByRole("button", { name: /Enter workspace/i }).click();

    await expect(page).toHaveURL(/\/cert\/sc-300\/knowledge/);
    await expect(page.getByText(/Demo practice bank:/i).first()).toBeVisible();
  });

  test("regular signed-in learners cannot render Admin Review Studio", async ({ page }) => {
    await seedE2eUser(page, { role: "USER", onboarded: true });
    await page.goto("/admin");

    await expect(page.getByRole("heading", { name: /Admin access denied/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Review Studio/i })).toHaveCount(0);
  });

  test("support admin can inspect support queues without publication actions", async ({ page }) => {
    await seedE2eUser(page, { role: "SUPPORT_ADMIN", onboarded: true });
    await page.goto("/admin");

    await expect(page.getByRole("heading", { name: /Review Studio/i })).toBeVisible();
    await expect(page.getByText("SUPPORT_ADMIN").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Inspect Reports/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Approve/i })).toHaveCount(0);
  });
});
