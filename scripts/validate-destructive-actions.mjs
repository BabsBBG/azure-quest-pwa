import { readFileSync } from "node:fs";

const settings = readFileSync("src/pages/Settings.tsx", "utf8");
const careerLab = readFileSync("src/pages/JobReadiness.tsx", "utf8");
const store = readFileSync("src/store/useAppStore.ts", "utf8");
const packageJson = readFileSync("package.json", "utf8");

const requiredSettingsSnippets = [
  "resetLocalDeviceData",
  "window.confirm(\"Reset local PraxisGrid data on this device?",
  "Cloud data is not deleted",
  "void resetLocalDeviceData()"
];

for (const snippet of requiredSettingsSnippets) {
  if (!settings.includes(snippet)) {
    console.error(`Destructive action validation failed: Settings missing ${snippet}`);
    process.exit(1);
  }
}

const requiredCareerSnippets = [
  "window.confirm(`Delete ${project.owner}/${project.repo} and its Project Intelligence analysis",
  "This cannot be undone",
  "setImportError(error instanceof Error ? error.message : \"Repository analysis delete failed.\")"
];

for (const snippet of requiredCareerSnippets) {
  if (!careerLab.includes(snippet)) {
    console.error(`Destructive action validation failed: Career Lab missing ${snippet}`);
    process.exit(1);
  }
}

const requiredStoreSnippets = [
  "const result = await deleteCloudImportedProject(current)",
  "if (!result.ok && !result.skipped)",
  "throw new Error"
];

for (const snippet of requiredStoreSnippets) {
  if (!store.includes(snippet)) {
    console.error(`Destructive action validation failed: store missing ${snippet}`);
    process.exit(1);
  }
}

if (!packageJson.includes("\"validate:destructive-actions\"")) {
  console.error("Destructive action validation failed: package script is missing.");
  process.exit(1);
}

console.log("Destructive action validation passed: local reset and repository analysis deletion require confirmation and surface delete failures.");
