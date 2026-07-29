import { readFileSync } from "node:fs";

const auth = readFileSync("src/hooks/useAuth.tsx", "utf8");
const config = readFileSync("playwright.config.ts", "utf8");
const spec = readFileSync("tests/e2e/signed-in-flows.spec.ts", "utf8");

const authSnippets = [
  "import.meta.env.DEV && import.meta.env.VITE_E2E_AUTH_HARNESS === \"true\"",
  "const E2E_AUTH_STORAGE_KEY = \"praxisgrid:e2e-auth\"",
  "readE2eSession",
  "writeE2eSession",
  "praxisgrid_role",
  "praxisgrid_onboarded"
];

const configSnippets = [
  "VITE_E2E_AUTH_HARNESS: \"true\"",
  "PLAYWRIGHT_BASE_URL"
];

const specSnippets = [
  "test.skip(({ baseURL }) => !localBasePattern.test(baseURL ?? \"\")",
  "Uses the dev-only E2E auth harness, never production.",
  "signed-in learner must complete onboarding before protected learning routes",
  "regular signed-in learners cannot render Admin Review Studio",
  "support admin can inspect support queues without publication actions",
  "assessment-like secondary practice routes show seed-bank trust copy",
  "assessment shell supports review, submission, exports, domain table, and question review"
];

for (const snippet of authSnippets) {
  if (!auth.includes(snippet)) {
    console.error(`E2E auth harness validation failed: auth missing ${snippet}`);
    process.exit(1);
  }
}

for (const snippet of configSnippets) {
  if (!config.includes(snippet)) {
    console.error(`E2E auth harness validation failed: Playwright config missing ${snippet}`);
    process.exit(1);
  }
}

for (const snippet of specSnippets) {
  if (!spec.includes(snippet)) {
    console.error(`E2E auth harness validation failed: signed-in spec missing ${snippet}`);
    process.exit(1);
  }
}

console.log("E2E auth harness validation passed: signed-in browser gates use a dev-only localStorage fixture and are skipped for production smoke.");
