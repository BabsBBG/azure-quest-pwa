import { spawnSync } from "node:child_process";

const baseUrl = process.env.PRODUCTION_BASE_URL || process.env.PLAYWRIGHT_BASE_URL || "";
const isMain = process.env.GITHUB_REF === "refs/heads/main";
const isPullRequest = process.env.GITHUB_EVENT_NAME === "pull_request";

if (isPullRequest) {
  const message = [
    "PRODUCTION_SMOKE_STATUS=SKIPPED_PULL_REQUEST",
    "Production smoke is skipped on pull requests because it verifies the deployed production alias, not the unmerged branch.",
    "Post-merge main validation must run this gate against PRODUCTION_BASE_URL."
  ].join("\n");
  console.log(message);
  if (process.env.GITHUB_STEP_SUMMARY) {
    await import("node:fs").then(({ appendFileSync }) => appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Production smoke\n\n${message}\n`));
  }
  process.exit(0);
}

if (!baseUrl) {
  const message = [
    "PRODUCTION_SMOKE_STATUS=SKIPPED_MISSING_BASE_URL",
    "Production smoke did not run because PRODUCTION_BASE_URL or PLAYWRIGHT_BASE_URL is not configured.",
    isMain
      ? "This is a release-blocking configuration error on main."
      : "This is expected on pull-request validation and must not be reported as production verification."
  ].join("\n");
  console.log(message);
  if (process.env.GITHUB_STEP_SUMMARY) {
    await import("node:fs").then(({ appendFileSync }) => appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Production smoke\n\n${message}\n`));
  }
  process.exit(isMain ? 1 : 0);
}

console.log(`PRODUCTION_SMOKE_STATUS=RUNNING baseURL=${baseUrl}`);
const result = spawnSync("npx", ["playwright", "test", "--config=playwright.production.config.ts"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, PRODUCTION_BASE_URL: baseUrl }
});

process.exit(result.status ?? 1);
