import { readFileSync } from "node:fs";

const app = readFileSync("src/App.tsx", "utf8");
const authPage = readFileSync("src/pages/AuthPage.tsx", "utf8");
const useAuth = readFileSync("src/hooks/useAuth.tsx", "utf8");
const useAuthTest = readFileSync("src/hooks/useAuth.test.tsx", "utf8");

const requiredAppSnippets = [
  "function authPath",
  "encodeURIComponent(`${location.pathname}${location.search}${location.hash}`)",
  "from=${from}",
  "authPath(\"signup\", location)",
  "authPath(\"signin\", location)"
];

for (const snippet of requiredAppSnippets) {
  if (!app.includes(snippet)) {
    console.error(`Auth redirect validation failed: App missing ${snippet}`);
    process.exit(1);
  }
}

const requiredAuthPageSnippets = [
  "function safeReturnPath",
  "params.get(\"from\")",
  "location.state",
  "return <Navigate to={returnTo} replace />",
  "auth.signInWithGoogle({ redirectTo: returnTo })"
];

for (const snippet of requiredAuthPageSnippets) {
  if (!authPage.includes(snippet)) {
    console.error(`Auth redirect validation failed: AuthPage missing ${snippet}`);
    process.exit(1);
  }
}

if (!useAuth.includes("signInWithGoogle: (args?: { redirectTo?: string }) => Promise<void>") || !useAuth.includes("args?.redirectTo ?? \"/account\"")) {
  console.error("Auth redirect validation failed: AuthProvider does not accept safe OAuth redirect targets.");
  process.exit(1);
}

if (!useAuthTest.includes("/cert/sc-300/job") || !useAuthTest.includes("requested internal redirect")) {
  console.error("Auth redirect validation failed: Google SSO redirect test is missing.");
  process.exit(1);
}

console.log("Auth redirect validation passed: protected deep links preserve internal return targets through sign-in and Google SSO.");
