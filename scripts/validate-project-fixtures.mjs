import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

function filesUnder(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) filesUnder(path, acc);
    else acc.push(path.replace(/\\/g, "/"));
  }
  return acc;
}

const careerLab = readFileSync("src/pages/JobReadiness.tsx", "utf8");

const requiredCareerLabSnippets = [
  "No projects connected",
  "Add a GitHub repository to generate private Project Intelligence and role-specific interview preparation",
  "useState<string[]>([])",
  "importedProjects.map"
];

for (const snippet of requiredCareerLabSnippets) {
  if (!careerLab.includes(snippet)) {
    console.error(`Project fixture validation failed: Career Lab missing ${snippet}`);
    process.exit(1);
  }
}

const forbiddenCareerLabSnippets = [
  "projectStories",
  "identity-review-lab\", \"cloud-monitoring-lab",
  "Fictional fixtures below"
];

for (const snippet of forbiddenCareerLabSnippets) {
  if (careerLab.includes(snippet)) {
    console.error(`Project fixture validation failed: Career Lab still contains fixture snippet ${snippet}`);
    process.exit(1);
  }
}

const productionFiles = [
  ...filesUnder("src").filter((file) => !file.includes("/fixtures/") && !file.endsWith(".test.ts") && !file.endsWith(".test.tsx")),
  ...filesUnder("api")
];

for (const file of productionFiles) {
  const contents = readFileSync(file, "utf8");
  if (contents.includes("/fixtures/") || contents.includes("../fixtures/") || contents.includes("./fixtures/")) {
    console.error(`Project fixture validation failed: production file imports fixture data: ${file}`);
    process.exit(1);
  }
}

const prohibitedOwnerProjectIdentifiers = [
  "bbglife",
  "azurecertquest",
  "tonybabalola-1114s-projects"
];

for (const file of productionFiles) {
  const contents = readFileSync(file, "utf8").toLowerCase();
  for (const identifier of prohibitedOwnerProjectIdentifiers) {
    if (contents.includes(identifier.toLowerCase())) {
      console.error(`Project fixture validation failed: prohibited owner project identifier ${identifier} found in ${file}`);
      process.exit(1);
    }
  }
}

const northstar = readFileSync("src/fixtures/northstarInventoryProject.ts", "utf8");
const requiredNorthstarSnippets = [
  "Northstar Inventory API",
  "fictional inventory-management API",
  "not based on a real owner project",
  "test-only fixture"
];

for (const snippet of requiredNorthstarSnippets) {
  if (!northstar.includes(snippet)) {
    console.error(`Project fixture validation failed: Northstar fixture missing ${snippet}`);
    process.exit(1);
  }
}

console.log("Project fixture validation passed: Career Lab starts empty, production avoids fixture imports, and Northstar remains isolated for tests.");
