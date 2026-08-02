import fs from "node:fs";

const checks = [];

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function requireIncludes(path, needle, message) {
  const source = read(path);
  checks.push({ message, ok: source.includes(needle) });
}

function requireNotIncludes(path, needle, message) {
  const source = read(path);
  checks.push({ message, ok: !source.includes(needle) });
}

function requireMatch(path, pattern, message) {
  const source = read(path);
  checks.push({ message, ok: pattern.test(source) });
}

requireIncludes("src/store/useAppStore.ts", 'export const ANONYMOUS_STORAGE_OWNER = "anonymous"', "anonymous owner sentinel is exported for shared hydration logic");
requireIncludes("src/store/useAppStore.ts", "storageOwnerId: string", "store records the active local persistence owner");
requireIncludes("src/store/useAppStore.ts", "hydrate: (ownerId?: string) => Promise<void>", "hydrate accepts an explicit storage owner");
requireIncludes("src/store/useAppStore.ts", "praxisgrid:user:${encodeURIComponent(ownerId)}", "signed-in storage keys are partitioned by encoded auth user id");
requireIncludes("src/store/useAppStore.ts", "if (ownerId !== ANONYMOUS_STORAGE_OWNER) return null", "signed-in users do not fall back to anonymous legacy data");
requireIncludes("src/store/useAppStore.ts", "if (ownerId !== ANONYMOUS_STORAGE_OWNER) return", "legacy migration only runs for anonymous storage");
requireIncludes("src/store/useAppStore.ts", "removeOwnerStorage(storageOwnerId)", "reset clears only the active owner partition");
requireNotIncludes("src/store/useAppStore.ts", "localforage.clear()", "reset does not wipe every localForage partition");

const scopedKeys = [
  "assessmentSession",
  "progress",
  "attempts",
  "interviewSessions",
  "activeInterviewSession",
  "questionFlags",
  "importedProjects",
  "settings",
  "flashcards"
];

for (const key of scopedKeys) {
  requireIncludes("src/store/useAppStore.ts", `localStorageKeyForOwner("${key}"`, `${key} local writes use owner-scoped keys`);
}

requireIncludes("src/hooks/useHydrateApp.ts", "storageOwnerId !== effectiveOwnerId", "hydration reruns when the auth user changes");
requireIncludes("src/hooks/useHydrateApp.ts", "ANONYMOUS_STORAGE_OWNER", "hydration keeps an explicit anonymous partition");
requireIncludes("src/App.tsx", "function AppRoutes()", "auth provider wraps route hydration");
requireIncludes("src/App.tsx", "useHydrateApp(auth.user?.id, auth.loading)", "app hydration uses the authenticated Supabase user id");

requireIncludes("package.json", '"validate:local-user-isolation"', "package exposes local user isolation validator");
requireIncludes(".github/workflows/ci.yml", "npm run validate:local-user-isolation", "CI runs local user isolation validator");

requireMatch("src/store/useAppStore.test.ts", /localStorageKeyForOwner\("attempts", "user-123"\)/, "unit test covers signed-in scoped storage keys");

const failures = checks.filter((check) => !check.ok);

if (failures.length > 0) {
  console.error("Local user isolation validation failed:");
  for (const failure of failures) console.error(`- ${failure.message}`);
  process.exit(1);
}

console.log(`Local user isolation validation passed (${checks.length} checks).`);
