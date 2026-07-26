import { build } from "esbuild";
import { readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const migration = readFileSync("supabase/migrations/0014_source_dependency_impact_graph.sql", "utf8");
const requiredMigrationSnippets = [
  "public.source_version_diffs",
  "public.source_impact_records",
  "public.targeted_replacement_jobs",
  "previous_content_hash <> next_content_hash",
  "needs-replacement",
  "requires_main_admin_review boolean not null default true check (requires_main_admin_review = true)",
  "publish_automatically boolean not null default false check (publish_automatically = false)",
  "enable row level security"
];

for (const snippet of requiredMigrationSnippets) {
  if (!migration.includes(snippet)) {
    console.error(`Source impact migration validation failed: missing ${snippet}`);
    process.exit(1);
  }
}

const outfile = join(tmpdir(), `praxisgrid-source-impact-${Date.now()}.mjs`);

await build({
  stdin: {
    contents: `
      import {
        createSourceVersionDiff,
        createTargetedReplacementJob,
        impactRecordsForSourceDiff,
        validateSourceImpact
      } from "./src/data/sourceImpactGraph.ts";

      const diff = createSourceVersionDiff({
        sourceDocumentId: "mslearn-sc300-study-guide",
        previousContentHash: "old",
        nextContentHash: "new",
        changedSections: ["Conditional Access"]
      });
      const impacts = impactRecordsForSourceDiff(diff);
      const replacement = createTargetedReplacementJob(diff, impacts);
      export const report = {
        validation: validateSourceImpact(diff, impacts, replacement),
        impacts: impacts.length,
        riskStates: [...new Set(impacts.map((impact) => impact.riskState))],
        affectedKinds: [...new Set(impacts.map((impact) => impact.nodeKind))],
        replacementStatus: replacement.status,
        publishAutomatically: replacement.publishAutomatically,
        requiresMainAdminReview: replacement.requiresMainAdminReview
      };
    `,
    resolveDir: process.cwd(),
    sourcefile: "validate-source-impact-entry.ts",
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
    console.error(`Source impact validation failed: ${report.validation.errors.join(", ")}`);
    process.exit(1);
  }

  if (!report.riskStates.includes("needs-replacement") || !report.riskStates.includes("blocked")) {
    console.error(`Source impact validation failed: missing actionable risk states ${report.riskStates.join(", ")}`);
    process.exit(1);
  }

  if (!report.affectedKinds.includes("ASSESSMENT_ITEM") || !report.affectedKinds.includes("LEARNING_SUMMARY")) {
    console.error(`Source impact validation failed: affected kinds ${report.affectedKinds.join(", ")}`);
    process.exit(1);
  }

  if (report.publishAutomatically !== false || report.requiresMainAdminReview !== true) {
    console.error("Source impact validation failed: replacement job must require Main Admin review and never auto-publish.");
    process.exit(1);
  }

  console.log(`Source impact validation passed: ${report.impacts} impact record(s), replacement status ${report.replacementStatus}.`);
} finally {
  rmSync(outfile, { force: true });
}
