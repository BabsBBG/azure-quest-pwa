import { readFileSync } from "node:fs";

const home = readFileSync("src/pages/PathHome.tsx", "utf8");
const account = readFileSync("src/pages/Account.tsx", "utf8");
const app = readFileSync("src/App.tsx", "utf8");

const requiredHomeSnippets = [
  "const homeDestinations",
  "title: \"Learn\"",
  "title: \"Practise\"",
  "title: \"Prove\"",
  "Certification Progress"
];

for (const snippet of requiredHomeSnippets) {
  if (!home.includes(snippet)) {
    console.error(`Auth-first IA validation failed: Home missing ${snippet}`);
    process.exit(1);
  }
}

if (home.includes("certPaths.map((path, index)") || home.includes("Approved assessments")) {
  console.error("Auth-first IA validation failed: Home still appears to use the old path-card primary layout.");
  process.exit(1);
}

const forbiddenAccountCopy = [
  "local demo practice",
  "Logged-out demo practice",
  "attempt history still work",
  "continue to work on this device"
];

for (const snippet of forbiddenAccountCopy) {
  if (account.includes(snippet)) {
    console.error(`Auth-first IA validation failed: Account still contains stale logged-out copy: ${snippet}`);
    process.exit(1);
  }
}

const requiredProtectedRoutes = [
  "ProtectedLearnerShell",
  "Navigate to=\"/auth?mode=signup\"",
  "path=\"/\" element={<PathHome />}"
];

for (const snippet of requiredProtectedRoutes) {
  if (!app.includes(snippet)) {
    console.error(`Auth-first IA validation failed: App missing protected route snippet ${snippet}`);
    process.exit(1);
  }
}

console.log("Auth-first IA validation passed: protected learner shell, three-outcome Home, and mandatory-auth account copy are present.");
