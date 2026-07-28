import { readFileSync } from "node:fs";

const cloudSync = readFileSync("src/lib/cloudSync.ts", "utf8");
const projectMigration = readFileSync("supabase/migrations/0022_project_intelligence_analyses.sql", "utf8");
const authMigration = readFileSync("supabase/migrations/0006_m5_authorization_hardening.sql", "utf8");
const projectValidator = readFileSync("scripts/validate-project-intelligence.mjs", "utf8");

const requiredCloudSnippets = [
  "importedProjectRowId(userId, project)",
  "importedProjectAnalysisRowId(userId, project)",
  "return `${userId}:${project.contentHash || project.id}`",
  "return `${userId}:${project.analysis.id}`",
  "supabase.from(\"imported_projects\").select(\"payload\").eq(\"user_id\", userId)",
  "supabase.from(\"project_intelligence_analyses\").select(\"*\").eq(\"user_id\", userId)",
  "supabase.from(\"project_intelligence_analyses\").delete().eq(\"user_id\", userId).eq(\"id\", analysisRowId).eq(\"imported_project_id\", rowId)",
  "supabase.from(\"imported_projects\").delete().eq(\"user_id\", userId).eq(\"id\", rowId)"
];

for (const snippet of requiredCloudSnippets) {
  if (!cloudSync.includes(snippet)) {
    console.error(`Repository isolation validation failed: cloud sync missing ${snippet}`);
    process.exit(1);
  }
}

const requiredMigrationSnippets = [
  "imported_projects_user_content_hash_unique unique (user_id, content_hash)",
  "user_id uuid not null references auth.users(id) on delete cascade",
  "imported_project_id text not null references public.imported_projects(id) on delete cascade",
  "alter table public.project_intelligence_analyses enable row level security",
  "using (auth.uid() = user_id)",
  "with check (auth.uid() = user_id)",
  "project_intelligence_user_project_idx",
  "project_intelligence_user_hash_idx"
];

const combinedMigrations = `${authMigration}\n${projectMigration}`;
for (const snippet of requiredMigrationSnippets) {
  if (!combinedMigrations.includes(snippet)) {
    console.error(`Repository isolation validation failed: migrations missing ${snippet}`);
    process.exit(1);
  }
}

if (!projectValidator.includes("importedProjectAnalysisRowId") || !projectValidator.includes("user-scoped")) {
  console.error("Repository isolation validation failed: Project Intelligence validator must enforce user-scoped analysis rows.");
  process.exit(1);
}

console.log("Repository isolation validation passed: imports and Project Intelligence analyses are user-scoped across IDs, RLS, reads, and deletes.");
