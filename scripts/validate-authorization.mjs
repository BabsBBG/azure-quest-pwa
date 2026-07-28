import { readFileSync } from "node:fs";

const migration = readFileSync("supabase/migrations/0006_m5_authorization_hardening.sql", "utf8");
const cloudSync = readFileSync("src/lib/cloudSync.ts", "utf8");

const requiredMigrationPatterns = [
  ["MAIN_ADMIN publish helper", /function public\.can_publish_content\(\)/],
  ["review helper warning comment", /Do not use for publication/],
  ["reviewer source insert policy removed", /drop policy if exists "Reviewers can insert source docs"/],
  ["source docs main admin insert", /create policy "Only main admins can insert source docs"/],
  ["source chunks main admin insert", /create policy "Only main admins can insert source chunks"/],
  ["approved questions main admin insert", /create policy "Only main admins can insert approved questions"/],
  ["review events direct insert removed", /drop policy if exists "Reviewers can insert review events"/],
  ["role event direct insert removed", /drop policy if exists "Main admins can insert role change events"/],
  ["self role change blocked", /Users cannot modify their own role/],
  ["approved candidate main admin guard", /Only MAIN_ADMIN can approve question candidates/],
  ["Microsoft Learn source URL enforced", /source_url like 'https:\/\/learn\.microsoft\.com\/%'/],
  ["payload validator present", /function public\.source_question_payload_is_valid/],
  ["imported project owner hash unique", /imported_projects_user_content_hash_unique/]
];

for (const [label, pattern] of requiredMigrationPatterns) {
  if (!pattern.test(migration)) {
    console.error(`Authorization validation failed: missing ${label}.`);
    process.exit(1);
  }
}

if (
  !/id:\s*importedProjectRowId\(userId,\s*project\)/.test(cloudSync)
  && !/const rowId = importedProjectRowId\(userId,\s*project\)[\s\S]*id:\s*rowId/.test(cloudSync)
) {
  console.error("Authorization validation failed: imported project cloud rows must be user-scoped.");
  process.exit(1);
}

console.log("Authorization validation passed: role, publication, audit, and import collision guards are present.");
