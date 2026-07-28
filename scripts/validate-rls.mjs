import { readFileSync } from "node:fs";

const migrationFiles = [
  "supabase/migrations/0001_profiles.sql",
  "supabase/migrations/0002_learning_data.sql",
  "supabase/migrations/0003_project_source_pipeline.sql",
  "supabase/migrations/0004_praxisgrid_roles_rebrand.sql",
  "supabase/migrations/0007_assessment_sessions.sql",
  "supabase/migrations/0018_github_import_controls.sql",
  "supabase/migrations/0019_active_interview_sessions.sql",
  "supabase/migrations/0017_content_quality_reports.sql",
  "supabase/migrations/0021_auth_required_content_quality_reports.sql",
  "supabase/migrations/0022_project_intelligence_analyses.sql",
  "supabase/migrations/0023_privacy_delete_policies.sql",
  "supabase/migrations/0024_support_quality_report_boundaries.sql",
  "supabase/migrations/0025_rpc_and_audit_hardening.sql"
];

const migrations = migrationFiles.map((file) => readFileSync(file, "utf8")).join("\n");
const auditHardeningMigration = readFileSync("supabase/migrations/0025_rpc_and_audit_hardening.sql", "utf8");

const requiredRlsTables = [
  "profiles",
  "quiz_attempts",
  "interview_sessions",
  "question_flags",
  "imported_projects",
  "user_roles",
  "assessment_sessions",
  "github_import_events",
  "github_import_cache",
  "active_interview_sessions",
  "content_quality_reports",
  "content_quality_report_events",
  "project_intelligence_analyses"
];

for (const table of requiredRlsTables) {
  if (!migrations.includes(`alter table public.${table} enable row level security`)) {
    console.error(`RLS validation failed: ${table} does not enable row level security.`);
    process.exit(1);
  }
}

const requiredSnippets = [
  "auth.uid() = user_id",
  "auth.uid() = id",
  "auth.uid() is not null",
  "public.is_main_admin()",
  "public.can_review_content()",
  "public.can_read_support_queue()",
  "guard_support_admin_report_update",
  "guard_support_admin_report_event_write",
  "revoke execute on function public.claim_github_import_quota(uuid, text, text, integer) from anon",
  "grant execute on function public.claim_github_import_quota(uuid, text, text, integer) to service_role",
  "create policy \"Main admins can insert content quality report events\"",
  "create policy \"Main admins can read content quality report events\""
];

for (const snippet of requiredSnippets) {
  if (!migrations.includes(snippet)) {
    console.error(`RLS validation failed: missing ${snippet}`);
    process.exit(1);
  }
}

if (
  !auditHardeningMigration.includes('drop policy if exists "Main admins manage content quality report events"') ||
  auditHardeningMigration.includes("on public.content_quality_report_events for all")
) {
  console.error("RLS validation failed: content quality report event hardening migration must drop the mutable for-all policy and avoid recreating it.");
  process.exit(1);
}

console.log(`RLS validation passed: ${requiredRlsTables.length} core tables have RLS and required role/owner boundaries.`);
