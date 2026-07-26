import { build } from "esbuild";
import { readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const migration = readFileSync("supabase/migrations/0013_question_critic_gates.sql", "utf8");
const requiredMigrationSnippets = [
  "public.question_critic_reports",
  "public.question_critic_findings",
  "public.question_critic_overrides",
  "guard_question_candidate_critic_approval",
  "non_overrideable_error_count = 0",
  "severity = 'warning'",
  "override_allowed = true",
  "public.can_publish_content()",
  "enable row level security"
];

for (const snippet of requiredMigrationSnippets) {
  if (!migration.includes(snippet)) {
    console.error(`Question critic migration validation failed: missing ${snippet}`);
    process.exit(1);
  }
}

const outfile = join(tmpdir(), `praxisgrid-question-critic-${Date.now()}.mjs`);

await build({
  stdin: {
    contents: `
      import { sourceQuestionCandidates } from "./src/data/sourceGrounding.ts";
      import { applyMainAdminCriticOverrides, critiqueSourceGroundedQuestion } from "./src/utils/questionCritic.ts";

      const approved = sourceQuestionCandidates.find((question) => question.reviewStatus === "approved");
      const report = critiqueSourceGroundedQuestion(approved);
      const duplicate = critiqueSourceGroundedQuestion({ ...approved, id: "ci-duplicate" }, [approved]);
      const warning = critiqueSourceGroundedQuestion({ ...approved, id: "ci-warning", stem: approved.stem.replace("?", "") });
      const accessibilityWarning = warning.overrideableWarnings.find((finding) => finding.checkId === "accessibility");
      const overridden = accessibilityWarning
        ? applyMainAdminCriticOverrides(warning, [{
            id: "ci-override",
            questionId: "ci-warning",
            findingCheckId: "accessibility",
            reason: "Accepted temporarily for admin queue migration.",
            actorRole: "MAIN_ADMIN",
            createdAt: "2026-07-26T00:00:00.000Z"
          }])
        : warning;

      export const reportSummary = {
        status: report.status,
        findings: report.findings.map((finding) => finding.checkId),
        duplicateStatus: duplicate.status,
        duplicateHardErrors: duplicate.nonOverrideableErrors.map((finding) => finding.checkId),
        warningBefore: warning.overrideableWarnings.map((finding) => finding.checkId),
        warningAfter: overridden.overrideableWarnings.map((finding) => finding.checkId)
      };
    `,
    resolveDir: process.cwd(),
    sourcefile: "validate-question-critic-entry.ts",
    loader: "ts"
  },
  bundle: true,
  format: "esm",
  platform: "node",
  outfile,
  logLevel: "silent"
});

try {
  const { reportSummary } = await import(pathToFileURL(outfile).href);
  const requiredChecks = [
    "source-support",
    "answer-uniqueness",
    "distractor-plausibility",
    "ambiguity",
    "hidden-assumptions",
    "objective-alignment",
    "difficulty",
    "freshness",
    "item-type-validity",
    "accessibility",
    "wording-leakage",
    "semantic-similarity",
    "unsupported-claims",
    "scenario-consistency"
  ];
  const migrationMissingChecks = requiredChecks.filter((check) => !migration.includes(`'${check}'`));

  if (migrationMissingChecks.length) {
    console.error(`Question critic validation failed: missing critic checks in migration ${migrationMissingChecks.join(", ")}`);
    process.exit(1);
  }

  if (!["passed", "warning"].includes(reportSummary.status)) {
    console.error(`Question critic validation failed: approved fixture status ${reportSummary.status}`);
    process.exit(1);
  }

  if (reportSummary.duplicateStatus !== "failed" || !reportSummary.duplicateHardErrors.includes("semantic-similarity")) {
    console.error("Question critic validation failed: duplicate hard failure was not detected.");
    process.exit(1);
  }

  if (!reportSummary.warningBefore.includes("accessibility") || reportSummary.warningAfter.includes("accessibility")) {
    console.error("Question critic validation failed: Main Admin warning override did not apply correctly.");
    process.exit(1);
  }

  console.log(`Question critic validation passed: ${requiredChecks.length} check(s), duplicate hard gate, warning override path.`);
} finally {
  rmSync(outfile, { force: true });
}
