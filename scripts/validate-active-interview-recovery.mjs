import { readFileSync } from "node:fs";

const store = readFileSync("src/store/useAppStore.ts", "utf8");
const cloud = readFileSync("src/lib/cloudSync.ts", "utf8");
const careerLab = readFileSync("src/pages/JobReadiness.tsx", "utf8");
const migration = readFileSync("supabase/migrations/0019_active_interview_sessions.sql", "utf8");
const tests = readFileSync("src/store/useAppStore.test.ts", "utf8");

const requiredStoreSnippets = [
  "praxisgrid:active-interview-session",
  "azure-quest:active-interview-session",
  "activeInterviewSession: ActiveInterviewSession | null",
  "saveActiveInterviewSession",
  "clearActiveInterviewSession",
  "chooseLatestActiveInterviewSession",
  "activeInterviewSession: get().activeInterviewSession"
];

for (const snippet of requiredStoreSnippets) {
  if (!store.includes(snippet)) {
    console.error(`Active interview recovery validation failed: store missing ${snippet}`);
    process.exit(1);
  }
}

const requiredCloudSnippets = [
  "active_interview_sessions",
  "syncActiveInterviewSession",
  "clearActiveInterviewSession",
  "activeInterviewSession: null",
  "activeInterviewSession:"
];

for (const snippet of requiredCloudSnippets) {
  if (!cloud.includes(snippet)) {
    console.error(`Active interview recovery validation failed: cloud sync missing ${snippet}`);
    process.exit(1);
  }
}

const requiredCareerLabSnippets = [
  "Recoverable session",
  "resumeActiveSession",
  "discardActiveSession",
  "Work in progress recovers locally and syncs to cloud when signed in",
  "saveActiveInterviewSession",
  "clearActiveInterviewSession(activeSessionId)"
];

for (const snippet of requiredCareerLabSnippets) {
  if (!careerLab.includes(snippet)) {
    console.error(`Active interview recovery validation failed: Career Lab missing ${snippet}`);
    process.exit(1);
  }
}

const requiredMigrationSnippets = [
  "public.active_interview_sessions",
  "enable row level security",
  "auth.uid() = user_id",
  "active_interview_sessions_user_one_active_idx",
  "status in ('ACTIVE', 'PAUSED')"
];

for (const snippet of requiredMigrationSnippets) {
  if (!migration.includes(snippet)) {
    console.error(`Active interview recovery validation failed: migration missing ${snippet}`);
    process.exit(1);
  }
}

if (!tests.includes("recovers the newest active interview draft across local and cloud")) {
  console.error("Active interview recovery validation failed: regression test missing.");
  process.exit(1);
}

console.log("Active interview recovery validation passed: local draft, cloud sync, RLS migration, Career Lab controls, and regression test are present.");
