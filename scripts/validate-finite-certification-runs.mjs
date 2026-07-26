import { build } from "esbuild";
import { readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const migration = readFileSync("supabase/migrations/0016_finite_certification_runs.sql", "utf8");
const requiredMigrationSnippets = [
  "public.finite_certification_runs",
  "public.finite_certification_run_items",
  "BASELINE",
  "APPLIED",
  "PRESSURE",
  "FINAL",
  "PERSONALIZED",
  "Cannot publish finite certification run with missing approved item placements",
  "public.can_publish_content()",
  "enable row level security"
];

for (const snippet of requiredMigrationSnippets) {
  if (!migration.includes(snippet)) {
    console.error(`Finite certification run migration validation failed: missing ${snippet}`);
    process.exit(1);
  }
}

const outfile = join(tmpdir(), `praxisgrid-finite-certification-runs-${Date.now()}.mjs`);

await build({
  stdin: {
    contents: `
      import {
        finiteCertificationRuns,
        finiteRunCoverageSummary,
        validateFiniteCertificationRuns
      } from "./src/data/finiteCertificationRuns.ts";

      export const report = {
        validation: validateFiniteCertificationRuns(),
        summary: finiteRunCoverageSummary(),
        runTypes: [...new Set(finiteCertificationRuns.map((run) => run.runType))],
        certs: [...new Set(finiteCertificationRuns.map((run) => run.cert))],
        statuses: [...new Set(finiteCertificationRuns.map((run) => run.publicationStatus))]
      };
    `,
    resolveDir: process.cwd(),
    sourcefile: "validate-finite-certification-runs-entry.ts",
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
  const requiredTypes = ["BASELINE", "APPLIED", "PRESSURE", "FINAL", "PERSONALIZED"];
  const missingTypes = requiredTypes.filter((type) => !report.runTypes.includes(type));
  const missingCerts = ["SC-300", "AZ-500", "SC-500"].filter((cert) => !report.certs.includes(cert));

  if (!report.validation.ok) {
    console.error(`Finite certification run validation failed: ${report.validation.errors.join(", ")}`);
    process.exit(1);
  }

  if (report.summary.total !== 15 || missingTypes.length || missingCerts.length) {
    console.error(`Finite certification run validation failed: total=${report.summary.total}, missingTypes=${missingTypes.join(", ")}, missingCerts=${missingCerts.join(", ")}`);
    process.exit(1);
  }

  if (!report.statuses.includes("blocked") || report.summary.missingApprovedItems <= 0) {
    console.error("Finite certification run validation failed: incomplete approved coverage must be blocked and visible.");
    process.exit(1);
  }

  console.log(`Finite certification run validation passed: ${report.summary.total} run definitions, ${report.summary.missingApprovedItems} missing approved placements tracked.`);
} finally {
  rmSync(outfile, { force: true });
}
