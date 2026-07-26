import { build } from "esbuild";
import { readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const migration = readFileSync("supabase/migrations/0011_question_generation_factory.sql", "utf8");
const requiredMigrationSnippets = [
  "public.question_generation_jobs",
  "public.question_generation_targets",
  "public.generated_question_drafts",
  "public.question_generation_events",
  "production_enabled boolean not null default false check (production_enabled = false)",
  "admin_only boolean not null default true check (admin_only = true)",
  "spent_estimate_cents <= budget_cap_cents",
  "public.can_publish_content()",
  "enable row level security"
];

for (const snippet of requiredMigrationSnippets) {
  if (!migration.includes(snippet)) {
    console.error(`Question generation migration validation failed: missing ${snippet}`);
    process.exit(1);
  }
}

const outfile = join(tmpdir(), `praxisgrid-question-generation-${Date.now()}.mjs`);

await build({
  stdin: {
    contents: `
      import {
        createGenerationJob,
        runGenerationJob,
        sampleCoverageTargets,
        validateGenerationJob
      } from "./src/data/questionGenerationFactory.ts";

      const job = createGenerationJob({
        idempotencyKey: "ci-question-generation-factory",
        targets: sampleCoverageTargets,
        config: { budgetCapCents: 0, perQuestionCostCapCents: 0, batchQuestionLimit: 4 }
      });
      const result = await runGenerationJob(job);
      const unsafe = createGenerationJob({
        idempotencyKey: "ci-question-generation-unsafe",
        targets: sampleCoverageTargets,
        config: { productionEnabled: true, killSwitchEnabled: true, batchQuestionLimit: 1 }
      });
      const unsafeResult = await runGenerationJob(unsafe);

      export const report = {
        validation: validateGenerationJob(job),
        status: result.job.status,
        drafts: result.drafts.length,
        draftReviewStatuses: [...new Set(result.drafts.map((draft) => draft.reviewStatus))],
        sourceUrls: result.drafts.map((draft) => draft.sourceUrl),
        unsafeStatus: unsafeResult.job.status,
        unsafeReasons: unsafeResult.job.quarantineReasons,
        productionEnabled: job.config.productionEnabled,
        adminOnly: job.config.adminOnly
      };
    `,
    resolveDir: process.cwd(),
    sourcefile: "validate-question-generation-entry.ts",
    loader: "ts"
  },
  bundle: true,
  format: "esm",
  platform: "node",
  outfile,
  logLevel: "silent"
});

try {
  const { report } = await import(pathToFileURL(outfile).href);

  if (!report.validation.ok) {
    console.error(`Question generation validation failed: ${report.validation.errors.join(", ")}`);
    process.exit(1);
  }

  if (report.status !== "completed" || report.drafts !== 2 || report.draftReviewStatuses.some((status) => status !== "draft")) {
    console.error(`Question generation validation failed: status=${report.status}, drafts=${report.drafts}, reviewStatuses=${report.draftReviewStatuses.join(", ")}`);
    process.exit(1);
  }

  if (!report.sourceUrls.every((url) => url.startsWith("https://learn.microsoft.com/"))) {
    console.error("Question generation validation failed: generated drafts must cite Microsoft Learn source URLs.");
    process.exit(1);
  }

  if (report.unsafeStatus !== "quarantined" || !report.unsafeReasons.includes("production-generation-disabled-until-configured")) {
    console.error("Question generation validation failed: unsafe production job was not quarantined.");
    process.exit(1);
  }

  if (report.productionEnabled || !report.adminOnly) {
    console.error("Question generation validation failed: factory must stay disabled for production and admin-only.");
    process.exit(1);
  }

  console.log(`Question generation factory validation passed: ${report.drafts} deterministic draft(s), unsafe jobs quarantined.`);
} finally {
  rmSync(outfile, { force: true });
}
