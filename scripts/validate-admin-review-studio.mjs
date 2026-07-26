import { readFileSync } from "node:fs";

const app = readFileSync("src/App.tsx", "utf8");
const page = readFileSync("src/pages/AdminReviewStudio.tsx", "utf8");

const requiredSnippets = [
  "path=\"/admin\"",
  "ProtectedAdminRoute",
  "AdminReviewStudio",
  "Back Office",
  "Review Studio",
  "Main Admin protected",
  "Content Reviewer",
  "Support Admin",
  "Dense Review Queue",
  "Split-Pane Review",
  "Audit Timeline",
  "sticky bottom-4",
  "PROVIDER_NEUTRAL_DISCLAIMER",
  "createContentOrchestrationWorkflow",
  "impactRecordsForSourceDiff",
  "critiqueSourceGroundedQuestion"
];

for (const snippet of requiredSnippets) {
  const source = snippet === "path=\"/admin\"" || snippet === "ProtectedAdminRoute" ? app : page;
  if (!source.includes(snippet)) {
    console.error(`Admin Review Studio validation failed: missing ${snippet}`);
    process.exit(1);
  }
}

const adminRouteIndex = app.indexOf("path=\"/admin\"");
const learnerShellRouteIndex = app.indexOf("ProtectedLearnerShell");
const wildcardRouteIndex = app.indexOf("path=\"*\"");

if (!app.includes('path="/admin" element={<ProtectedAdminRoute />}')) {
  console.error("Admin Review Studio validation failed: /admin must use ProtectedAdminRoute.");
  process.exit(1);
}

if (adminRouteIndex === -1 || wildcardRouteIndex === -1 || adminRouteIndex > wildcardRouteIndex) {
  console.error("Admin Review Studio validation failed: /admin must be routed outside the learner Layout.");
  process.exit(1);
}

if (app.indexOf("<Layout>") < learnerShellRouteIndex) {
  console.error("Admin Review Studio validation failed: learner Layout must stay inside ProtectedLearnerShell.");
  process.exit(1);
}

console.log("Admin Review Studio validation passed: protected separate /admin route, queues, split pane, role boundary, audit timeline.");
