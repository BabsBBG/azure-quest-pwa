import { readFileSync } from "node:fs";

const migration = readFileSync("supabase/migrations/0024_support_quality_report_boundaries.sql", "utf8");
const admin = readFileSync("src/pages/AdminReviewStudio.tsx", "utf8");
const packageJson = readFileSync("package.json", "utf8");

const requiredMigrationSnippets = [
  "function public.can_read_support_queue()",
  "'SUPPORT_ADMIN'::public.praxisgrid_user_role",
  "Support admins can read content quality reports",
  "Support admins can read content quality report events",
  "guard_support_admin_no_content_mutation",
  "SUPPORT_ADMIN can inspect support queues but cannot mutate content or report state"
];

for (const snippet of requiredMigrationSnippets) {
  if (!migration.includes(snippet)) {
    console.error(`Support boundary validation failed: migration missing ${snippet}`);
    process.exit(1);
  }
}

const requiredAdminSnippets = [
  "const { role } = useAuth()",
  "const isMainAdmin = role === \"MAIN_ADMIN\"",
  "const isReviewer = role === \"CONTENT_REVIEWER\" || isMainAdmin",
  "const isSupport = role === \"SUPPORT_ADMIN\"",
  "row.role === \"SUPPORT_ADMIN\"",
  "if (isReviewer) return row.role === \"CONTENT_REVIEWER\"",
  "if (isReviewer) return row.role === \"Content Reviewer\"",
  "Support Admin can inspect learner reports",
  "{isMainAdmin ? <Button size=\"sm\" variant=\"hero\"><CheckCircle2 className=\"h-4 w-4\" /> Approve</Button> : null}"
];

for (const snippet of requiredAdminSnippets) {
  if (!admin.includes(snippet)) {
    console.error(`Support boundary validation failed: Admin UI missing ${snippet}`);
    process.exit(1);
  }
}

if (!packageJson.includes("\"validate:support-boundary\"")) {
  console.error("Support boundary validation failed: package script is missing.");
  process.exit(1);
}

console.log("Support boundary validation passed: SUPPORT_ADMIN has inspect-only support queues and no content publication controls.");
