import { readFileSync } from "node:fs";

const app = readFileSync("src/App.tsx", "utf8");
const auth = readFileSync("src/hooks/useAuth.tsx", "utf8");
const onboarding = readFileSync("src/pages/Onboarding.tsx", "utf8");
const account = readFileSync("src/pages/Account.tsx", "utf8");
const packageJson = readFileSync("package.json", "utf8");

const requiredAppSnippets = [
  "function onboardingPath",
  "!auth.onboardingComplete && location.pathname !== \"/onboarding\"",
  "return <Navigate to={onboardingPath(location)} replace state={{ from: location.pathname }} />",
  "path=\"/onboarding\" element={<Onboarding />}"
];

for (const snippet of requiredAppSnippets) {
  if (!app.includes(snippet)) {
    console.error(`Onboarding validation failed: App missing ${snippet}`);
    process.exit(1);
  }
}

const requiredAuthSnippets = [
  "onboardingComplete: boolean",
  "completeOnboarding: (args: { primaryCert: string; goal: string; experience: string }) => Promise<AuthActionResult>",
  "praxisgrid_onboarded: true",
  "praxisgrid_primary_cert: primaryCert",
  "praxisgrid_goal: goal",
  "praxisgrid_experience: experience"
];

for (const snippet of requiredAuthSnippets) {
  if (!auth.includes(snippet)) {
    console.error(`Onboarding validation failed: auth context missing ${snippet}`);
    process.exit(1);
  }
}

const requiredPageSnippets = [
  "export function Onboarding",
  "safeReturnPath",
  "auth.completeOnboarding",
  "{editing ? \"Update\" : \"Set up\"} your",
  "Pick your starting path",
  "Focus the workspace",
  "Experience level",
  "Onboarding stores only workspace preferences"
];

for (const snippet of requiredPageSnippets) {
  if (!onboarding.includes(snippet)) {
    console.error(`Onboarding validation failed: page missing ${snippet}`);
    process.exit(1);
  }
}

if (!account.includes("Update onboarding") || !account.includes("/onboarding?edit=true&from=/account")) {
  console.error("Onboarding validation failed: Account must expose an onboarding update path.");
  process.exit(1);
}

if (!packageJson.includes("\"validate:onboarding\"")) {
  console.error("Onboarding validation failed: package script is missing.");
  process.exit(1);
}

console.log("Onboarding validation passed: protected learner setup, metadata persistence, return targets, and Account edit path are present.");
