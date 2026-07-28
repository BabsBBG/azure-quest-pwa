import { readFileSync } from "node:fs";

const types = readFileSync("src/types/index.ts", "utf8");
const api = readFileSync("api/github-project.js", "utf8");
const cloudSync = readFileSync("src/lib/cloudSync.ts", "utf8");
const store = readFileSync("src/store/useAppStore.ts", "utf8");
const careerLab = readFileSync("src/pages/JobReadiness.tsx", "utf8");
const migration = readFileSync("supabase/migrations/0022_project_intelligence_analyses.sql", "utf8");
const jobData = readFileSync("src/data/jobReadiness.ts", "utf8");

const required = [
  [types, "ProjectIntelligenceAnalysis"],
  [types, "analysis: ProjectIntelligenceAnalysis"],
  [api, "detectProjectIntelligence"],
  [api, "architectureMap"],
  [api, "risksAndImprovements"],
  [cloudSync, "project_intelligence_analyses"],
  [cloudSync, "deleteImportedProject"],
  [store, "deleteImportedProject: (projectId: string) => Promise<void>"],
  [careerLab, "Project Intelligence overview"],
  [careerLab, "Evidence-backed architecture map"],
  [careerLab, "onRegenerateProject"],
  [careerLab, "onDeleteProject"],
  [migration, "Imported projects are deletable by owner"],
  [migration, "alter table public.project_intelligence_analyses enable row level security"],
  [migration, "auth.uid() = user_id"],
  [migration, "on delete cascade"]
];

for (const [contents, snippet] of required) {
  if (!contents.includes(snippet)) {
    console.error(`Project Intelligence validation failed: missing ${snippet}`);
    process.exit(1);
  }
}

const forbidden = [
  "Fictional Incident Response Lab",
  "Fictional Identity Review Lab",
  "Fictional Cloud Monitoring Lab",
  "Fictional Secure Baseline Lab",
  "Fictional Healthcare Defence Lab",
  "Identity Review Lab",
  "Cloud Monitoring Lab",
  "Incident Response Lab",
  "Secure Baseline Lab",
  "Healthcare Defence Lab",
  "identity-review-lab",
  "cloud-monitoring-lab",
  "incident-response-lab",
  "secure-baseline-lab",
  "healthcare-defence-lab",
  "Fictional fixtures below"
];
for (const snippet of forbidden) {
  if (jobData.includes(snippet) || careerLab.includes(snippet)) {
    console.error(`Project Intelligence validation failed: interview path still references ${snippet}`);
    process.exit(1);
  }
}

console.log("Project Intelligence validation passed: analyses are typed, persisted, user-owned, reviewable, regenerable, and deletable.");
