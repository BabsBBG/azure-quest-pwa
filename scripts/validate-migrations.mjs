import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = "supabase/migrations";
const files = readdirSync(dir)
  .filter((file) => /^\d{4}_.+\.sql$/.test(file))
  .sort();

if (!files.length) {
  console.error("Migration validation failed: no numbered SQL migrations found.");
  process.exit(1);
}

files.forEach((file, index) => {
  const expected = String(index + 1).padStart(4, "0");
  if (!file.startsWith(`${expected}_`)) {
    console.error(`Migration validation failed: expected ${expected}_ prefix at position ${index + 1}, found ${file}.`);
    process.exit(1);
  }
  const sql = readFileSync(join(dir, file), "utf8").trim();
  if (!sql) {
    console.error(`Migration validation failed: ${file} is empty.`);
    process.exit(1);
  }
  if (/\b(password|secret|service_role_key|anon_key)\s*=\s*['"][^'"]+/i.test(sql)) {
    console.error(`Migration validation failed: ${file} appears to contain a credential assignment.`);
    process.exit(1);
  }
});

const requiredLatest = [
  "0020_atomic_github_import_quota.sql",
  "0021_auth_required_content_quality_reports.sql",
  "0022_project_intelligence_analyses.sql",
  "0023_privacy_delete_policies.sql",
  "0024_support_quality_report_boundaries.sql",
  "0025_rpc_and_audit_hardening.sql"
];

for (const file of requiredLatest) {
  if (!files.includes(file)) {
    console.error(`Migration validation failed: missing production-hardening migration ${file}.`);
    process.exit(1);
  }
}

console.log(`Migration validation passed: ${files.length} sequential migrations are present and secrets-free.`);
