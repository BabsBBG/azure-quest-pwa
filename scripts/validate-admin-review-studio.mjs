import { readFileSync } from "node:fs";

const app = readFileSync("src/App.tsx", "utf8");
const page = readFileSync("src/pages/AdminReviewStudio.tsx", "utf8");

const requiredSnippets = [
  "path=\"/admin\"",
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
  const source = snippet === "path=\"/admin\"" ? app : page;
  if (!source.includes(snippet)) {
    console.error(`Admin Review Studio validation failed: missing ${snippet}`);
    process.exit(1);
  }
}

if (app.indexOf("path=\"/admin\"") > app.indexOf("<Layout>") && app.includes("<Layout>")) {
  console.error("Admin Review Studio validation failed: /admin must be routed outside the learner Layout.");
  process.exit(1);
}

console.log("Admin Review Studio validation passed: separate /admin route, queues, split pane, role boundary, audit timeline.");
