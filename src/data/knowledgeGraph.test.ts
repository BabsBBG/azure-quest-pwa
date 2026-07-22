import { describe, expect, it } from "vitest";
import {
  buildCertificationKnowledgeGraph,
  contentAffectedByChangedSource,
  confusedConcepts,
  itemsTestingKnowledgeUnit,
  knowledgeUnitsLackingCoverage,
  objectivesLackingApprovedCoverage,
  placementsForAssessmentItem,
  sourcesForObjective,
  validateKnowledgeGraph
} from "./knowledgeGraph";

describe("certification knowledge graph", () => {
  it("builds a traversable graph with certifications, objectives, sources, and assessment items", () => {
    const graph = buildCertificationKnowledgeGraph();
    const validation = validateKnowledgeGraph(graph);

    expect(validation.errors).toEqual([]);
    expect(validation.ok).toBe(true);
    expect(graph.nodes.some((node) => node.kind === "CERTIFICATION" && node.cert === "SC-300")).toBe(true);
    expect(graph.nodes.some((node) => node.kind === "CERTIFICATION" && node.cert === "AZ-500" && node.metadata?.status === "retiring")).toBe(true);
    expect(graph.nodes.some((node) => node.kind === "CERTIFICATION" && node.cert === "SC-500")).toBe(true);
    expect(graph.edges.some((edge) => edge.kind === "SUPPORTED_BY")).toBe(true);
  });

  it("answers required objective, coverage, placement, and impact queries", () => {
    const graph = buildCertificationKnowledgeGraph();
    const objective = graph.nodes.find((node) => node.kind === "OBJECTIVE" && node.cert === "SC-300");
    const knowledgeUnit = graph.nodes.find((node) => node.kind === "KNOWLEDGE_UNIT" && node.cert === "SC-300");

    expect(objective).toBeTruthy();
    expect(knowledgeUnit).toBeTruthy();
    expect(sourcesForObjective(objective!.id, graph).length).toBeGreaterThan(0);
    expect(itemsTestingKnowledgeUnit(knowledgeUnit!.id, graph).some((item) => item.status === "approved")).toBe(true);
    expect(placementsForAssessmentItem("sg-sc300-conditional-access-001", graph).map((node) => node.kind)).toContain("DOMAIN_QUIZ_PLACEMENT");
    expect(contentAffectedByChangedSource("mslearn-sc300-study-guide", graph).some((node) => node.id === "sg-sc300-conditional-access-001")).toBe(true);
  });

  it("reports coverage gaps without hiding them", () => {
    const graph = buildCertificationKnowledgeGraph();

    expect(knowledgeUnitsLackingCoverage(graph).every((node) => node.kind === "KNOWLEDGE_UNIT")).toBe(true);
    expect(objectivesLackingApprovedCoverage("SC-300", graph).every((node) => node.cert === "SC-300")).toBe(true);
    expect(confusedConcepts(graph).every((edge) => edge.kind === "COMMONLY_CONFUSED_WITH")).toBe(true);
  });
});
