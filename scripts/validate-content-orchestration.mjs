import { build } from "esbuild";
import { readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const migration = readFileSync("supabase/migrations/0012_graph_content_orchestration.sql", "utf8");
const requiredMigrationSnippets = [
  "public.content_orchestration_workflows",
  "public.content_orchestration_nodes",
  "public.content_orchestration_events",
  "COVERAGE_PLANNING",
  "QUESTION_GENERATION",
  "ADMIN_HANDOFF",
  "publish_automatically boolean not null default false check (publish_automatically = false)",
  "attempts <= max_retries + 1",
  "enable row level security"
];

for (const snippet of requiredMigrationSnippets) {
  if (!migration.includes(snippet)) {
    console.error(`Content orchestration migration validation failed: missing ${snippet}`);
    process.exit(1);
  }
}

const outfile = join(tmpdir(), `praxisgrid-content-orchestration-${Date.now()}.mjs`);

await build({
  stdin: {
    contents: `
      import {
        createContentOrchestrationWorkflow,
        runContentOrchestrationWorkflow,
        validateContentOrchestrationWorkflow
      } from "./src/data/contentOrchestration.ts";

      const workflow = createContentOrchestrationWorkflow({ idempotencyKey: "ci-content-orchestration" });
      const completed = runContentOrchestrationWorkflow(workflow);
      export const report = {
        initialValidation: validateContentOrchestrationWorkflow(workflow),
        completedValidation: validateContentOrchestrationWorkflow(completed),
        status: completed.status,
        nodeTypes: completed.nodes.map((node) => node.type),
        events: completed.events.map((event) => event.type),
        publishAutomatically: completed.publishAutomatically,
        generationJobStatus: completed.generationJob?.status,
        coverageGaps: completed.coverageGaps.length
      };
    `,
    resolveDir: process.cwd(),
    sourcefile: "validate-content-orchestration-entry.ts",
    loader: "ts"
  },
  bundle: true,
  format: "esm",
  platform: "node",
  outfile,
  logLevel: "silent"
});

try {
  const { report } = await import(pathToFileURL(outfile).href);
  const requiredNodes = [
    "COVERAGE_PLANNING",
    "SOURCE_RESOLUTION",
    "QUESTION_GENERATION",
    "GROUNDING_VERIFICATION",
    "AMBIGUITY_CRITIC",
    "DISTRACTOR_CRITIC",
    "DUPLICATE_DETECTION",
    "DIFFICULTY_ESTIMATION",
    "ADMIN_HANDOFF"
  ];
  const missingNodes = requiredNodes.filter((node) => !report.nodeTypes.includes(node));

  if (!report.initialValidation.ok || !report.completedValidation.ok) {
    console.error(`Content orchestration validation failed: ${[...report.initialValidation.errors, ...report.completedValidation.errors].join(", ")}`);
    process.exit(1);
  }

  if (report.status !== "completed" || missingNodes.length || !report.events.includes("handoff-created")) {
    console.error(`Content orchestration validation failed: status=${report.status}, missingNodes=${missingNodes.join(", ")}`);
    process.exit(1);
  }

  if (report.publishAutomatically !== false || report.generationJobStatus !== "queued") {
    console.error("Content orchestration validation failed: workflow must not publish automatically and generation job must remain queued for controlled execution.");
    process.exit(1);
  }

  console.log(`Content orchestration validation passed: ${report.nodeTypes.length} node(s), ${report.coverageGaps} coverage gap(s), admin handoff required.`);
} finally {
  rmSync(outfile, { force: true });
}
