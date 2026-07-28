import { readFileSync } from "node:fs";

const api = readFileSync("api/github-project.js", "utf8");
const client = readFileSync("src/lib/githubProjectImport.ts", "utf8");
const migration = readFileSync("supabase/migrations/0018_github_import_controls.sql", "utf8");
const atomicQuotaMigration = readFileSync("supabase/migrations/0020_atomic_github_import_quota.sql", "utf8");
const envExample = readFileSync(".env.example", "utf8");

const forbiddenApiSnippets = ["new Map()", "rateBuckets", "cache =", "recordImportEvent", "checkRateLimit"];
for (const snippet of forbiddenApiSnippets) {
  if (api.includes(snippet)) {
    console.error(`GitHub import controls validation failed: API still contains in-memory control snippet ${snippet}`);
    process.exit(1);
  }
}

const requiredApiSnippets = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "authenticateUser",
  "github_import_cache",
  "claimImportQuota",
  "claim_github_import_quota",
  "remainingToday",
  "cacheTtlHours",
  "public-read-only",
  "Private repositories are not supported"
];

for (const snippet of requiredApiSnippets) {
  if (!api.includes(snippet)) {
    console.error(`GitHub import controls validation failed: API missing ${snippet}`);
    process.exit(1);
  }
}

const requiredClientSnippets = [
  "supabase.auth.getSession",
  "Authorization: `Bearer ${token}`",
  "Sign in is required before importing"
];

for (const snippet of requiredClientSnippets) {
  if (!client.includes(snippet)) {
    console.error(`GitHub import controls validation failed: client missing ${snippet}`);
    process.exit(1);
  }
}

const requiredMigrationSnippets = [
  "public.github_import_cache",
  "public.github_import_events",
  "alter table public.github_import_cache enable row level security",
  "alter table public.github_import_events enable row level security",
  "auth.uid() = user_id",
  "github_import_events_user_day_idx",
  "github_import_cache_updated_idx"
];

for (const snippet of requiredMigrationSnippets) {
  if (!migration.includes(snippet)) {
    console.error(`GitHub import controls validation failed: migration missing ${snippet}`);
    process.exit(1);
  }
}

const requiredAtomicQuotaSnippets = [
  "public.claim_github_import_quota",
  "pg_advisory_xact_lock",
  "github_import_events",
  "Daily public repo import limit reached"
];

for (const snippet of requiredAtomicQuotaSnippets) {
  if (!atomicQuotaMigration.includes(snippet)) {
    console.error(`GitHub import controls validation failed: atomic quota migration missing ${snippet}`);
    process.exit(1);
  }
}

const requiredEnvNames = [
  "SUPABASE_URL=",
  "SUPABASE_SERVICE_ROLE_KEY=",
  "GITHUB_IMPORT_DAILY_LIMIT=",
  "GITHUB_IMPORT_CACHE_TTL_HOURS="
];

for (const name of requiredEnvNames) {
  if (!envExample.includes(name)) {
    console.error(`GitHub import controls validation failed: .env.example missing ${name}`);
    process.exit(1);
  }
}

console.log("GitHub import controls validation passed: authenticated user, durable rate events, durable cache, and placeholder env names are present.");
