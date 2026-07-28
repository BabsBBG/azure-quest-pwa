import { readFileSync } from "node:fs";

const knowledge = readFileSync("src/pages/KnowledgeCheck.tsx", "utf8");
const readiness = readFileSync("src/pages/Readiness.tsx", "utf8");
const curated = readFileSync("src/data/curatedDomainQuizzes.ts", "utf8");
const finite = readFileSync("src/data/finiteCertificationRuns.ts", "utf8");
const packageJson = readFileSync("package.json", "utf8");

const requiredKnowledgeSnippets = [
  "Production quizzes start only after enough approved source-grounded item placements exist",
  "Blocked quizzes are not filled with demo questions",
  "Demo questions are never used as a silent fallback",
  "quiz.publicationStatus === \"published\"",
  "quiz.publicationStatus === \"blocked\"",
  "exam.publicationStatus === \"published\"",
  "exam.publicationStatus === \"blocked\"",
  "Not ready"
];

for (const snippet of requiredKnowledgeSnippets) {
  if (!knowledge.includes(snippet)) {
    console.error(`Production content validation failed: KnowledgeCheck missing ${snippet}`);
    process.exit(1);
  }
}

const forbiddenKnowledgeSnippets = [
  "quiz.publicationStatus === \"blocked\" ? \"Blocked\"",
  "exam.publicationStatus === \"blocked\" ? \"Blocked\""
];

for (const snippet of forbiddenKnowledgeSnippets) {
  if (knowledge.includes(snippet)) {
    console.error(`Production content validation failed: blocked content still routes through old fallback: ${snippet}`);
    process.exit(1);
  }
}

const requiredReadinessSnippets = [
  "finiteRunCoverageSummary",
  "hasPublishedRun",
  "Source-grounded certification run not ready",
  "demo questions are not used here as a fallback",
  "Certification run not ready"
];

for (const snippet of requiredReadinessSnippets) {
  if (!readiness.includes(snippet)) {
    console.error(`Production content validation failed: Readiness missing ${snippet}`);
    process.exit(1);
  }
}

if (readiness.includes("mode=timed&count=50&minutes=100")) {
  console.error("Production content validation failed: Readiness still deep-links directly to seed-bank certification runs.");
  process.exit(1);
}

for (const [name, source] of [["curated quizzes", curated], ["finite runs", finite]]) {
  for (const snippet of ["missingApprovedItems === 0 ? \"published\" : \"blocked\"", "approvedSourceGroundedQuestions()"]) {
    if (!source.includes(snippet)) {
      console.error(`Production content validation failed: ${name} missing ${snippet}`);
      process.exit(1);
    }
  }
}

if (!packageJson.includes("\"validate:production-content\"")) {
  console.error("Production content validation failed: package script is missing.");
  process.exit(1);
}

console.log("Production content validation passed: incomplete approved coverage blocks production quizzes/runs instead of falling back to demo questions.");
