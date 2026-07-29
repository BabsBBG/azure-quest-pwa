import { readFileSync } from "node:fs";

const packageJson = readFileSync("package.json", "utf8");
const workflow = readFileSync(".github/workflows/ci.yml", "utf8");
const runner = readFileSync("scripts/run-production-smoke.mjs", "utf8");
const productionConfig = readFileSync("playwright.production.config.ts", "utf8");

const required = [
  [packageJson, "\"test:production-smoke\": \"node scripts/run-production-smoke.mjs\""],
  [packageJson, "\"validate:production-smoke-gate\": \"node scripts/validate-production-smoke-gate.mjs\""],
  [workflow, "npm run validate:production-smoke-gate"],
  [workflow, "npm run test:production-smoke"],
  [workflow, "PRODUCTION_BASE_URL: ${{ vars.PRODUCTION_BASE_URL }}"],
  [runner, "PRODUCTION_SMOKE_STATUS=SKIPPED_MISSING_BASE_URL"],
  [runner, "This is expected on pull-request validation and must not be reported as production verification."],
  [runner, "process.exit(isMain ? 1 : 0)"],
  [productionConfig, "baseURL: process.env.PRODUCTION_BASE_URL ?? process.env.PLAYWRIGHT_BASE_URL"]
];

for (const [contents, snippet] of required) {
  if (!contents.includes(snippet)) {
    console.error(`Production smoke gate validation failed: missing ${snippet}`);
    process.exit(1);
  }
}

if (workflow.includes("if: github.ref == 'refs/heads/main' && vars.PRODUCTION_BASE_URL != ''")) {
  console.error("Production smoke gate validation failed: workflow still silently skips production smoke.");
  process.exit(1);
}

if (productionConfig.includes("azure-quest-pwa.vercel.app")) {
  console.error("Production smoke gate validation failed: production smoke config still falls back to the historical Azure Quest URL.");
  process.exit(1);
}

console.log("Production smoke gate validation passed: PR skips are explicit and main requires a configured production URL.");
