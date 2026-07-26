import { build } from "esbuild";
import { readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const migration = readFileSync("supabase/migrations/0015_curated_domain_quizzes.sql", "utf8");
const requiredMigrationSnippets = [
  "public.curated_domain_quizzes",
  "public.curated_domain_quiz_items",
  "FOUNDATIONS",
  "CONFIGURATION",
  "SCENARIOS",
  "TROUBLESHOOTING",
  "DOMAIN_CHALLENGE",
  "Cannot publish curated domain quiz with missing approved item placements",
  "public.can_publish_content()",
  "enable row level security"
];

for (const snippet of requiredMigrationSnippets) {
  if (!migration.includes(snippet)) {
    console.error(`Curated domain quiz migration validation failed: missing ${snippet}`);
    process.exit(1);
  }
}

const outfile = join(tmpdir(), `praxisgrid-curated-domain-quizzes-${Date.now()}.mjs`);

await build({
  stdin: {
    contents: `
      import {
        curatedDomainQuizzes,
        curatedQuizCoverageSummary,
        validateCuratedDomainQuizzes
      } from "./src/data/curatedDomainQuizzes.ts";

      export const report = {
        validation: validateCuratedDomainQuizzes(),
        summary: curatedQuizCoverageSummary(),
        tracks: [...new Set(curatedDomainQuizzes.map((quiz) => quiz.track))],
        certs: [...new Set(curatedDomainQuizzes.map((quiz) => quiz.cert))],
        statuses: [...new Set(curatedDomainQuizzes.map((quiz) => quiz.publicationStatus))]
      };
    `,
    resolveDir: process.cwd(),
    sourcefile: "validate-curated-domain-quizzes-entry.ts",
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
  const requiredTracks = ["FOUNDATIONS", "CONFIGURATION", "SCENARIOS", "TROUBLESHOOTING", "DOMAIN_CHALLENGE"];
  const missingTracks = requiredTracks.filter((track) => !report.tracks.includes(track));
  const missingCerts = ["SC-300", "AZ-500", "SC-500"].filter((cert) => !report.certs.includes(cert));

  if (!report.validation.ok) {
    console.error(`Curated domain quiz validation failed: ${report.validation.errors.join(", ")}`);
    process.exit(1);
  }

  if (report.summary.total !== 60 || missingTracks.length || missingCerts.length) {
    console.error(`Curated domain quiz validation failed: total=${report.summary.total}, missingTracks=${missingTracks.join(", ")}, missingCerts=${missingCerts.join(", ")}`);
    process.exit(1);
  }

  if (!report.statuses.includes("blocked") || report.summary.missingApprovedItems <= 0) {
    console.error("Curated domain quiz validation failed: incomplete approved coverage must be blocked and visible.");
    process.exit(1);
  }

  console.log(`Curated domain quiz validation passed: ${report.summary.total} quiz structures, ${report.summary.missingApprovedItems} missing approved placements tracked.`);
} finally {
  rmSync(outfile, { force: true });
}
