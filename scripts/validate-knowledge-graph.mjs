import { build } from "esbuild";
import { readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const migration = readFileSync("supabase/migrations/0009_certification_knowledge_graph.sql", "utf8");
const requiredMigrationSnippets = [
  "public.knowledge_graph_nodes",
  "public.knowledge_graph_edges",
  "public.assessment_item_knowledge_units",
  "public.domain_quiz_placements",
  "public.certification_run_placements",
  "knowledge_graph_edges_from_kind_idx",
  "enable row level security"
];

for (const snippet of requiredMigrationSnippets) {
  if (!migration.includes(snippet)) {
    console.error(`Knowledge graph migration validation failed: missing ${snippet}`);
    process.exit(1);
  }
}

const outfile = join(tmpdir(), `praxisgrid-knowledge-graph-${Date.now()}.mjs`);

await build({
  stdin: {
    contents: `
      import {
        buildCertificationKnowledgeGraph,
        contentAffectedByChangedSource,
        objectivesLackingApprovedCoverage,
        placementsForAssessmentItem,
        validateKnowledgeGraph
      } from "./src/data/knowledgeGraph.ts";

      const graph = buildCertificationKnowledgeGraph();
      const validation = validateKnowledgeGraph(graph);
      export const report = {
        nodes: graph.nodes.length,
        edges: graph.edges.length,
        validation,
        nodeKinds: [...new Set(graph.nodes.map((node) => node.kind))],
        relationKinds: [...new Set(graph.edges.map((edge) => edge.kind))],
        sc300Placements: placementsForAssessmentItem("sg-sc300-conditional-access-001", graph).length,
        sc300Impact: contentAffectedByChangedSource("mslearn-sc300-study-guide", graph).map((node) => node.id),
        sc500Gaps: objectivesLackingApprovedCoverage("SC-500", graph).length
      };
    `,
    resolveDir: process.cwd(),
    sourcefile: "validate-knowledge-graph-entry.ts",
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
  const requiredNodeKinds = [
    "PROVIDER",
    "CERTIFICATION",
    "CERTIFICATION_VERSION",
    "DOMAIN",
    "OBJECTIVE",
    "KNOWLEDGE_UNIT",
    "SOURCE_DOCUMENT",
    "SOURCE_CHUNK",
    "LEARNING_SUMMARY",
    "ASSESSMENT_ITEM",
    "DOMAIN_QUIZ_PLACEMENT",
    "CERTIFICATION_RUN_PLACEMENT"
  ];
  const requiredRelationKinds = ["SUPPORTED_BY", "ASSESSED_BY", "PLACED_IN_DOMAIN_QUIZ", "PLACED_IN_CERTIFICATION_RUN", "SUMMARIZED_BY"];
  const missingNodeKinds = requiredNodeKinds.filter((kind) => !report.nodeKinds.includes(kind));
  const missingRelationKinds = requiredRelationKinds.filter((kind) => !report.relationKinds.includes(kind));

  if (!report.validation.ok) {
    console.error(`Knowledge graph validation failed: ${report.validation.errors.join(", ")}`);
    process.exit(1);
  }

  if (missingNodeKinds.length || missingRelationKinds.length) {
    console.error(`Knowledge graph validation failed: missing node kinds ${missingNodeKinds.join(", ")}; missing relation kinds ${missingRelationKinds.join(", ")}`);
    process.exit(1);
  }

  if (report.sc300Placements < 2 || !report.sc300Impact.includes("sg-sc300-conditional-access-001")) {
    console.error("Knowledge graph validation failed: approved SC-300 item is not reachable through placement and source-impact traversals.");
    process.exit(1);
  }

  console.log(`Knowledge graph validation passed: ${report.nodes} node(s), ${report.edges} edge(s), ${report.sc500Gaps} SC-500 coverage gap(s) tracked.`);
} finally {
  rmSync(outfile, { force: true });
}
