import { expect, test, type Page } from "@playwright/test";

const localBasePattern = /127\.0\.0\.1|localhost/;

async function seedE2eUser(page: Page, options: { role?: string; onboarded?: boolean } = {}) {
  await page.addInitScript((fixture) => {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith("praxisgrid:") || key.startsWith("azure-quest:")) {
        window.localStorage.removeItem(key);
      }
    }
    window.localStorage.setItem("praxisgrid:e2e-auth", JSON.stringify(fixture));
    window.indexedDB?.deleteDatabase("localforage");
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

  test("assessment-like secondary practice routes show seed-bank trust copy", async ({ page }) => {
    await seedE2eUser(page, { onboarded: true });

    for (const route of ["/flashcards", "/kql", "/cases", "/scenario-player/sc-300/tenant-domain-setup"]) {
      await page.goto(route);
      await expect(page.getByText(/Demo practice bank:/i).first()).toBeVisible();
    }
  });

  test("assessment shell supports review, submission, exports, domain table, and question review", async ({ page }) => {
    await seedE2eUser(page, { onboarded: true });
    await page.goto("/arena?cert=SC-300&mode=quiz&count=1&minutes=5&examTitle=E2E%20Assessment%20Shell");

    const seedNotice = page.locator("p").filter({ hasText: /Demo practice bank:/i }).first();
    await expect(seedNotice).toBeVisible({ timeout: 15000 });
    if (await page.getByRole("heading", { name: /Recover your assessment session/i }).isVisible()) {
      await page.getByRole("button", { name: /Restart/i }).click();
    }
    await expect(page.getByRole("heading", { name: /Question 1\/1/i })).toBeVisible({ timeout: 15000 });

    await page.getByRole("button", { name: /^A\b/i }).click();
    await page.getByRole("button", { name: /Finish run/i }).click();

    await expect(page.getByRole("heading", { name: /Review before submitting/i })).toBeVisible();
    await expect(page.getByText(/Answers stay hidden until you submit this run/i)).toBeVisible();
    await page.getByRole("button", { name: /Submit final answers/i }).click();

    await expect(page.getByRole("heading", { name: /E2E Assessment Shell/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("link", { name: /Back to Practise/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /JSON/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /CSV/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Print/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Retake", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Domain Performance/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Question Review/i })).toBeVisible();
    await page.locator("details summary").first().click();
    const correctAnswer = page.locator("p").filter({ hasText: /Correct answer:/i }).last();
    await correctAnswer.scrollIntoViewIfNeeded();
    await expect(correctAnswer).toBeVisible();
    await expect(seedNotice).toBeVisible();
  });
});
