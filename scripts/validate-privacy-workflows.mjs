import { readFileSync } from "node:fs";

const cloudSync = readFileSync("src/lib/cloudSync.ts", "utf8");
const settings = readFileSync("src/pages/Settings.tsx", "utf8");
const migration = readFileSync("supabase/migrations/0023_privacy_delete_policies.sql", "utf8");
const projectMigration = readFileSync("supabase/migrations/0022_project_intelligence_analyses.sql", "utf8");

const required = [
  [cloudSync, "exportCloudData"],
  [cloudSync, "deleteCloudLearningData"],
  [cloudSync, "project_intelligence_analyses"],
  [cloudSync, "active_interview_sessions"],
  [settings, "Cloud Privacy"],
  [settings, "Export cloud data"],
  [settings, "Delete cloud learning data"],
  [settings, "This does not delete your Supabase sign-in account"],
  [migration, "Quiz attempts are deletable by owner"],
  [migration, "Interview sessions are deletable by owner"],
  [migration, "Question flags are deletable by owner"],
  [migration, "Assessment sessions are deletable by owner"],
  [migration, "Profiles are deletable by owner"],
  [projectMigration, "Imported projects are deletable by owner"],
  [projectMigration, "Users can delete own project intelligence analyses"]
];

for (const [contents, snippet] of required) {
  if (!contents.includes(snippet)) {
    console.error(`Privacy workflow validation failed: missing ${snippet}`);
    process.exit(1);
  }
}

if (!/delete\(\)\.eq\("user_id", userId\)/.test(cloudSync)) {
  console.error("Privacy workflow validation failed: cloud deletion must be user-scoped.");
  process.exit(1);
}

console.log("Privacy workflow validation passed: cloud export/delete UI, owner-scoped deletion, and RLS policies are present.");
