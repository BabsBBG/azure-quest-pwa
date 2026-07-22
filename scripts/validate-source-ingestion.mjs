import { build } from "esbuild";
import { readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const migration = readFileSync("supabase/migrations/0008_official_source_ingestion.sql", "utf8");
const requiredTables = [
  "public.providers",
  "public.certifications",
  "public.certification_domains",
  "public.certification_objectives",
  "public.official_source_documents",
  "public.official_source_versions",
  "public.source_ingestion_jobs",
  "public.knowledge_units"
];

for (const table of requiredTables) {
  if (!migration.includes(`table if not exists ${table}`)) {
    console.error(`Source ingestion validation failed: missing ${table}`);
    process.exit(1);
  }
}

const outfile = join(tmpdir(), `praxisgrid-source-ingestion-${Date.now()}.mjs`);
await build({
  stdin: {
    contents: `
      import { FixtureSourceFetchAdapter, certifications, ingestOfficialSource, providers } from "./src/data/sourceIngestion.ts";
      const result = await ingestOfficialSource({
        adapter: new FixtureSourceFetchAdapter(),
        certificationId: "cert-sc300-2026",
        url: certifications[0].officialStudyGuide
      });
      export const report = {
        providers: providers.length,
        certifications: certifications.length,
        knowledgeUnits: result.knowledgeUnits.length,
        status: result.job.status,
        hashLength: result.job.contentHash.length
      };
    `,
    resolveDir: process.cwd(),
    sourcefile: "validate-source-ingestion-entry.ts",
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
  if (report.providers < 1 || report.certifications < 1 || report.knowledgeUnits < 1 || report.status !== "completed" || report.hashLength !== 64) {
    console.error("Source ingestion validation failed: fixture ingestion did not produce a valid report.");
    process.exit(1);
  }
  console.log(`Source ingestion validation passed: ${report.providers} provider(s), ${report.certifications} certification(s), ${report.knowledgeUnits} knowledge unit(s).`);
} finally {
  rmSync(outfile, { force: true });
}
