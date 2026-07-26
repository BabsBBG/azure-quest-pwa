import { build } from "esbuild";
import { readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const migration = readFileSync("supabase/migrations/0010_learning_summaries.sql", "utf8");
const requiredMigrationSnippets = [
  "public.learning_summary_workspaces",
  "public.learning_summary_source_links",
  "public.published_learning_summary_versions",
  "guard_published_learning_summary_immutability",
  "Published learning summary versions are immutable",
  "public.can_publish_content()",
  "enable row level security"
];

for (const snippet of requiredMigrationSnippets) {
  if (!migration.includes(snippet)) {
    console.error(`Learning summary migration validation failed: missing ${snippet}`);
    process.exit(1);
  }
}

const outfile = join(tmpdir(), `praxisgrid-learning-summaries-${Date.now()}.mjs`);

await build({
  stdin: {
    contents: `
      import {
        approvedLearningSummaries,
        learningSummaryIntegrityReport,
        learningSummaryWorkspaces,
        publishedLearningSummaryVersions
      } from "./src/data/learningSummaries.ts";

      export const report = {
        integrity: learningSummaryIntegrityReport(),
        workspaces: learningSummaryWorkspaces.length,
        published: publishedLearningSummaryVersions.length,
        approved: approvedLearningSummaries().length,
        certs: [...new Set(approvedLearningSummaries().map((summary) => summary.cert))],
        immutable: publishedLearningSummaryVersions.every((summary) => summary.immutable === true && summary.approvedByRole === "MAIN_ADMIN"),
        sourceLinked: publishedLearningSummaryVersions.every((summary) => summary.sourceLinks.length > 0 && summary.sourceLinks.every((link) => link.sourceUrl.startsWith("https://learn.microsoft.com/")))
      };
    `,
    resolveDir: process.cwd(),
    sourcefile: "validate-learning-summaries-entry.ts",
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
  const requiredCerts = ["SC-300", "AZ-500", "SC-500"];
  const missingCerts = requiredCerts.filter((cert) => !report.certs.includes(cert));

  if (report.integrity.errors.length) {
    console.error(`Learning summary validation failed: ${report.integrity.errors.join(", ")}`);
    process.exit(1);
  }

  if (!report.immutable || !report.sourceLinked || report.workspaces === 0 || report.published !== report.workspaces || missingCerts.length) {
    console.error(`Learning summary validation failed: immutable=${report.immutable}, sourceLinked=${report.sourceLinked}, missingCerts=${missingCerts.join(", ")}`);
    process.exit(1);
  }

  console.log(`Learning summary validation passed: ${report.approved} approved version(s) across ${report.certs.join(", ")}.`);
} finally {
  rmSync(outfile, { force: true });
}
