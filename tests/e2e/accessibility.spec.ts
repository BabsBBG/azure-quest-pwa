import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const publicRoutes = ["/auth?mode=signup", "/auth?mode=signin", "/auth?mode=reset", "/privacy", "/terms", "/status"];

for (const route of publicRoutes) {
  test(`@accessibility ${route} has no serious or critical axe violations`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("body")).toBeVisible();

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const seriousOrCritical = results.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");

    expect(seriousOrCritical).toEqual([]);
  });
}
