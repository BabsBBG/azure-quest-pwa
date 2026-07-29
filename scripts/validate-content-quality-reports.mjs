import { build } from "esbuild";
import { readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const migration = readFileSync("supabase/migrations/0017_content_quality_reports.sql", "utf8");
const authHardeningMigration = readFileSync("supabase/migrations/0021_auth_required_content_quality_reports.sql", "utf8");
const rpcAuditHardeningMigration = readFileSync("supabase/migrations/0025_rpc_and_audit_hardening.sql", "utf8");
const requiredMigrationSnippets = [
  "public.content_quality_reports",
  "public.content_quality_report_events",
  "assessment_item_version",
  "source_chunk_id",
  "attempt_id",
  "assessment_session_id",
  "never_auto_mutates_content boolean not null default true check (never_auto_mutates_content = true)",
  "must never auto-edit, remove, replace, or publish content",
  "public.can_review_content()",
  "enable row level security"
];

for (const snippet of requiredMigrationSnippets) {
  if (!migration.includes(snippet)) {
    console.error(`Content quality report migration validation failed: missing ${snippet}`);
    process.exit(1);
  }
}

const requiredAuthHardeningSnippets = [
  "drop policy if exists \"Users can create content quality reports\"",
  "Authenticated users can create content quality reports",
  "auth.uid() is not null",
  "user_id = auth.uid()"
];

for (const snippet of requiredAuthHardeningSnippets) {
  if (!authHardeningMigration.includes(snippet)) {
    console.error(`Content quality report auth hardening validation failed: missing ${snippet}`);
    process.exit(1);
  }
}

const requiredAuditHardeningSnippets = [
  "drop policy if exists \"Main admins manage content quality report events\"",
  "Main admins can insert content quality report events",
  "Main admins can read content quality report events"
];

for (const snippet of requiredAuditHardeningSnippets) {
  if (!rpcAuditHardeningMigration.includes(snippet)) {
    console.error(`Content quality report audit hardening validation failed: missing ${snippet}`);
    process.exit(1);
  }
}

const outfile = join(tmpdir(), `praxisgrid-content-quality-reports-${Date.now()}.mjs`);

await build({
  stdin: {
    contents: `
      import {
        contentQualityReportSummary,
        createContentQualityReport,
        sampleContentQualityReports,
        validateContentQualityReport
      } from "./src/data/contentQualityReports.ts";
      import { approvedSourceGroundedQuestions } from "./src/data/sourceGrounding.ts";

      const report = createContentQualityReport({
        assessmentItemId: approvedSourceGroundedQuestions()[0].id,
        reason: "unclear",
        comment: "Validation report"
      });

      export const result = {
        validation: validateContentQualityReport(report),
        summary: contentQualityReportSummary(sampleContentQualityReports),
        neverAutoMutates: report.neverAutoMutatesContent,
        sourceUrl: report.sourceUrl
      };
    `,
    resolveDir: process.cwd(),
    sourcefile: "validate-content-quality-reports-entry.ts",
    loader: "ts"
  },
  bundle: true,
  format: "esm",
  platform: "node",
  outfile,
  logLevel: "silent"
});

try {
  const { result } = await import(pathToFileURL(outfile).href);

  if (!result.validation.ok) {
    console.error(`Content quality report validation failed: ${result.validation.errors.join(", ")}`);
    process.exit(1);
  }

  if (!result.neverAutoMutates || !result.sourceUrl.startsWith("https://learn.microsoft.com/") || result.summary.total < 1) {
    console.error("Content quality report validation failed: report must preserve source context and never mutate content.");
    process.exit(1);
  }

  console.log(`Content quality report validation passed: ${result.summary.total} sample report(s), source context preserved.`);
} finally {
  rmSync(outfile, { force: true });
}
