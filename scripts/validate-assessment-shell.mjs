import { readFileSync } from "node:fs";

const app = readFileSync("src/App.tsx", "utf8");
const arena = readFileSync("src/pages/PracticeArena.tsx", "utf8");

const assessmentRouteIndex = app.indexOf('path="/arena" element={<ProtectedAssessmentRoute />}');
const learnerShellIndex = app.indexOf('path="*" element={<ProtectedLearnerShell>');

if (assessmentRouteIndex < 0) {
  console.error("Assessment Shell validation failed: /arena must render through ProtectedAssessmentRoute.");
  process.exit(1);
}

if (learnerShellIndex < 0 || assessmentRouteIndex > learnerShellIndex) {
  console.error("Assessment Shell validation failed: /arena must be routed before the learner shell wildcard.");
  process.exit(1);
}

if (app.includes('path="/arena" element={<PracticeArena />}')) {
  console.error("Assessment Shell validation failed: /arena must not mount PracticeArena inside the learner route set.");
  process.exit(1);
}

const requiredArenaSnippets = [
  "Back to Practise",
  "exportResultsJson",
  "exportDomainCsv",
  "window.print()",
  "Domain Performance",
  "Question Review",
  "min-h-screen bg-slate-50"
];

for (const snippet of requiredArenaSnippets) {
  if (!arena.includes(snippet)) {
    console.error(`Assessment Shell validation failed: PracticeArena missing ${snippet}`);
    process.exit(1);
  }
}

const forbiddenResultSnippets = [
  "<Card className=\"aq-hero\">",
  "Domain report"
];

for (const snippet of forbiddenResultSnippets) {
  if (arena.includes(snippet)) {
    console.error(`Assessment Shell validation failed: old result layout still contains ${snippet}`);
    process.exit(1);
  }
}

console.log("Assessment Shell validation passed: /arena is outside learner layout and results use analytical exportable report structure.");
