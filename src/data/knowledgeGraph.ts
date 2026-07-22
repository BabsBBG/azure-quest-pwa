import type { Cert, SourceReviewStatus } from "../types";
import { sourceHash, certifications, extractKnowledgeUnits, type KnowledgeUnitDraft } from "./sourceIngestion";
import { approvedSourceGroundedQuestions, sourceChunks, sourceDocs, sourceQuestionCandidates } from "./sourceGrounding";

export type KnowledgeGraphNodeKind =
  | "PROVIDER"
  | "CERTIFICATION"
  | "CERTIFICATION_VERSION"
  | "DOMAIN"
  | "OBJECTIVE"
  | "KNOWLEDGE_UNIT"
  | "SOURCE_DOCUMENT"
  | "SOURCE_CHUNK"
  | "LEARNING_SUMMARY"
  | "ASSESSMENT_ITEM"
  | "DOMAIN_QUIZ_PLACEMENT"
  | "CERTIFICATION_RUN_PLACEMENT";

export type KnowledgeGraphRelationKind =
  | "HAS_CERTIFICATION"
  | "HAS_VERSION"
  | "HAS_DOMAIN"
  | "HAS_OBJECTIVE"
  | "HAS_KNOWLEDGE_UNIT"
  | "SUPPORTED_BY"
  | "SUMMARIZED_BY"
  | "ASSESSED_BY"
  | "PLACED_IN_DOMAIN_QUIZ"
  | "PLACED_IN_CERTIFICATION_RUN"
  | "DEPENDS_ON"
  | "RELATED_TO"
  | "CONTRASTS_WITH"
  | "COMMONLY_CONFUSED_WITH"
  | "PREREQUISITE_OF";

export interface KnowledgeGraphNode {
  id: string;
  kind: KnowledgeGraphNodeKind;
  label: string;
  cert?: Cert;
  status: "draft" | "reviewed" | "approved" | "placeholder";
  metadata?: Record<string, string | number | boolean | string[]>;
}

export interface KnowledgeGraphEdge {
  id: string;
  fromId: string;
  toId: string;
  kind: KnowledgeGraphRelationKind;
  evidence: string;
  confidence: number;
  reviewStatus: SourceReviewStatus;
}

export interface KnowledgeGraph {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}

const providerNodeId = "provider-microsoft";
const currentKuDrafts = certifications.flatMap((certification) =>
  extractKnowledgeUnits(certification, certification.officialStudyGuide, "")
);

function objectiveNodeId(domainId: string, objective: string) {
  return `objective-${sourceHash(`${domainId}:${objective}`).slice(0, 20)}`;
}

function sourceDocNodeId(cert: Cert) {
  const doc = sourceDocs.find((item) => item.cert === cert);
  return doc?.id ?? `source-document-${cert.toLowerCase()}`;
}

function sourceChunkNodeId(cert: Cert) {
  return sourceChunks.find((item) => item.cert === cert)?.id;
}

function learningSummaryNodeId(domainId: string) {
  return `summary-${domainId}`;
}

function domainQuizPlacementNodeId(domainId: string) {
  return `domain-quiz-placement-${domainId}`;
}

function certificationRunPlacementNodeId(cert: Cert) {
  return `certification-run-placement-${cert.toLowerCase()}`;
}

function addEdge(
  edges: KnowledgeGraphEdge[],
  fromId: string,
  toId: string,
  kind: KnowledgeGraphRelationKind,
  evidence: string,
  reviewStatus: SourceReviewStatus = "critic-approved",
  confidence = 0.9
) {
  edges.push({
    id: `edge-${sourceHash(`${fromId}:${kind}:${toId}`).slice(0, 24)}`,
    fromId,
    toId,
    kind,
    evidence,
    confidence,
    reviewStatus
  });
}

export function buildCertificationKnowledgeGraph(): KnowledgeGraph {
  const nodes = new Map<string, KnowledgeGraphNode>();
  const edges: KnowledgeGraphEdge[] = [];

  nodes.set(providerNodeId, {
    id: providerNodeId,
    kind: "PROVIDER",
    label: "Microsoft",
    status: "approved",
    metadata: { officialSourceDomains: ["learn.microsoft.com", "docs.microsoft.com"] }
  });

  for (const certification of certifications) {
    const certCode = certification.code as Cert;
    const certNodeId = certification.id;
    const versionNodeId = `${certification.id}:version:${certification.version}`;
    const sourceDocumentId = sourceDocNodeId(certCode);

    nodes.set(certNodeId, {
      id: certNodeId,
      kind: "CERTIFICATION",
      label: certification.code,
      cert: certCode,
      status: "approved",
      metadata: { providerId: certification.providerId, status: certification.status }
    });
    nodes.set(versionNodeId, {
      id: versionNodeId,
      kind: "CERTIFICATION_VERSION",
      label: `${certification.code} ${certification.version}`,
      cert: certCode,
      status: "approved",
      metadata: { effectiveDate: certification.effectiveDate, studyGuide: certification.officialStudyGuide }
    });
    nodes.set(sourceDocumentId, {
      id: sourceDocumentId,
      kind: "SOURCE_DOCUMENT",
      label: `${certification.code} official study guide`,
      cert: certCode,
      status: "approved",
      metadata: { sourceUrl: certification.officialStudyGuide }
    });

    addEdge(edges, providerNodeId, certNodeId, "HAS_CERTIFICATION", "Provider registry connects provider to certification.");
    addEdge(edges, certNodeId, versionNodeId, "HAS_VERSION", "Certification registry includes a versioned blueprint.");
    addEdge(edges, versionNodeId, sourceDocumentId, "SUPPORTED_BY", "Versioned blueprint is grounded in the official study guide.");

    const runPlacementNodeId = certificationRunPlacementNodeId(certCode);
    nodes.set(runPlacementNodeId, {
      id: runPlacementNodeId,
      kind: "CERTIFICATION_RUN_PLACEMENT",
      label: `${certification.code} certification run placement scaffold`,
      cert: certCode,
      status: "placeholder",
      metadata: { milestone: "M5.10" }
    });
    addEdge(edges, versionNodeId, runPlacementNodeId, "PLACED_IN_CERTIFICATION_RUN", "M5.10 finite run placement placeholder.");

    for (const domain of certification.domains) {
      nodes.set(domain.id, {
        id: domain.id,
        kind: "DOMAIN",
        label: domain.title,
        cert: certCode,
        status: "approved"
      });
      addEdge(edges, versionNodeId, domain.id, "HAS_DOMAIN", "Certification version includes this blueprint domain.");
      addEdge(edges, domain.id, sourceDocumentId, "SUPPORTED_BY", "Domain came from official source ingestion.");

      const summaryNodeId = learningSummaryNodeId(domain.id);
      nodes.set(summaryNodeId, {
        id: summaryNodeId,
        kind: "LEARNING_SUMMARY",
        label: `${domain.title} summary workspace`,
        cert: certCode,
        status: "placeholder",
        metadata: { milestone: "M5.5" }
      });
      addEdge(edges, domain.id, summaryNodeId, "SUMMARIZED_BY", "M5.5 summary workspace reserved for this domain.");
      addEdge(edges, summaryNodeId, sourceDocumentId, "SUPPORTED_BY", "Summary workspace must cite the official source document.");

      const quizPlacementNodeId = domainQuizPlacementNodeId(domain.id);
      nodes.set(quizPlacementNodeId, {
        id: quizPlacementNodeId,
        kind: "DOMAIN_QUIZ_PLACEMENT",
        label: `${domain.title} quiz placement scaffold`,
        cert: certCode,
        status: "placeholder",
        metadata: { milestone: "M5.9" }
      });
      addEdge(edges, domain.id, quizPlacementNodeId, "PLACED_IN_DOMAIN_QUIZ", "M5.9 curated domain quiz placement placeholder.");

      for (const objective of domain.objectives) {
        const objectiveId = objectiveNodeId(domain.id, objective);
        const ku = currentKuDrafts.find((item) => item.certificationId === certification.id && item.domainId === domain.id && item.objective === objective);

        nodes.set(objectiveId, {
          id: objectiveId,
          kind: "OBJECTIVE",
          label: objective,
          cert: certCode,
          status: "approved"
        });
        addEdge(edges, domain.id, objectiveId, "HAS_OBJECTIVE", "Blueprint domain includes this objective.");
        addEdge(edges, objectiveId, sourceDocumentId, "SUPPORTED_BY", "Objective was extracted from official source material.");

        if (ku) {
          nodes.set(ku.id, {
            id: ku.id,
            kind: "KNOWLEDGE_UNIT",
            label: ku.concept,
            cert: certCode,
            status: "reviewed",
            metadata: { domainId: ku.domainId, sourceTextHash: ku.sourceTextHash }
          });
          addEdge(edges, objectiveId, ku.id, "HAS_KNOWLEDGE_UNIT", "Knowledge Unit extracted from this objective.");
          addEdge(edges, ku.id, sourceDocumentId, "SUPPORTED_BY", "Knowledge Unit text hash traces to official source material.");
          addEdge(edges, ku.id, summaryNodeId, "SUMMARIZED_BY", "Learning summary must cover this Knowledge Unit.", "draft", 0.75);
        }
      }
    }
  }

  for (const chunk of sourceChunks) {
    nodes.set(chunk.id, {
      id: chunk.id,
      kind: "SOURCE_CHUNK",
      label: chunk.domain,
      cert: chunk.cert,
      status: "approved",
      metadata: { docId: chunk.docId, contentHash: chunk.contentHash, embeddingHash: chunk.embeddingHash }
    });
    addEdge(edges, chunk.docId, chunk.id, "HAS_KNOWLEDGE_UNIT", "Existing source-grounding chunk belongs to its source document.");
  }

  for (const question of sourceQuestionCandidates) {
    const status = question.reviewStatus === "approved" ? "approved" : "draft";
    nodes.set(question.id, {
      id: question.id,
      kind: "ASSESSMENT_ITEM",
      label: question.stem,
      cert: question.cert,
      status,
      metadata: { duplicateKey: question.duplicateKey, sourceChunkId: question.sourceChunkId }
    });

    addEdge(edges, question.sourceChunkId, question.id, "ASSESSED_BY", "Question candidate cites this source chunk.", question.reviewStatus);

    const matchingKu = findKnowledgeUnitForQuestion(question);
    if (matchingKu) {
      addEdge(edges, matchingKu.id, question.id, "ASSESSED_BY", "Question domain aligns with this Knowledge Unit.", question.reviewStatus);
      const quizPlacementId = domainQuizPlacementNodeId(matchingKu.domainId);
      const runPlacementId = certificationRunPlacementNodeId(question.cert);
      addEdge(edges, question.id, quizPlacementId, "PLACED_IN_DOMAIN_QUIZ", "Question is eligible for later curated domain placement.", question.reviewStatus, 0.7);
      addEdge(edges, question.id, runPlacementId, "PLACED_IN_CERTIFICATION_RUN", "Question is eligible for later finite certification run placement.", question.reviewStatus, 0.7);
    }
  }

  const confusedPair = currentKuDrafts.filter((item) => item.commonConfusions.length > 0).slice(0, 2);
  if (confusedPair.length === 2) {
    addEdge(edges, confusedPair[0].id, confusedPair[1].id, "COMMONLY_CONFUSED_WITH", "Both Knowledge Units include official-source extraction confusion notes.", "draft", 0.6);
  }

  return { nodes: [...nodes.values()], edges };
}

export function findKnowledgeUnitForQuestion(question: { cert: Cert; domain: string; tags?: string[] }): KnowledgeUnitDraft | undefined {
  return currentKuDrafts.find((ku) => {
    const certification = certifications.find((item) => item.id === ku.certificationId);
    return certification?.code === question.cert && (question.domain === ku.sourceSection || question.domain === ku.concept);
  });
}

export function sourcesForObjective(objectiveId: string, graph = buildCertificationKnowledgeGraph()) {
  const sourceIds = graph.edges
    .filter((edge) => edge.fromId === objectiveId && edge.kind === "SUPPORTED_BY")
    .map((edge) => edge.toId);
  return graph.nodes.filter((node) => sourceIds.includes(node.id) && (node.kind === "SOURCE_DOCUMENT" || node.kind === "SOURCE_CHUNK"));
}

export function knowledgeUnitsLackingCoverage(graph = buildCertificationKnowledgeGraph()) {
  return graph.nodes.filter(
    (node) =>
      node.kind === "KNOWLEDGE_UNIT" &&
      !graph.edges.some((edge) => edge.fromId === node.id && edge.kind === "ASSESSED_BY" && edge.reviewStatus === "approved")
  );
}

export function summariesDependingOnSource(sourceDocumentId: string, graph = buildCertificationKnowledgeGraph()) {
  return graph.edges
    .filter((edge) => edge.toId === sourceDocumentId && edge.kind === "SUPPORTED_BY")
    .map((edge) => graph.nodes.find((node) => node.id === edge.fromId))
    .filter((node): node is KnowledgeGraphNode => node !== undefined && node.kind === "LEARNING_SUMMARY");
}

export function itemsTestingKnowledgeUnit(knowledgeUnitId: string, graph = buildCertificationKnowledgeGraph()) {
  return graph.edges
    .filter((edge) => edge.fromId === knowledgeUnitId && edge.kind === "ASSESSED_BY")
    .map((edge) => graph.nodes.find((node) => node.id === edge.toId))
    .filter((node): node is KnowledgeGraphNode => node !== undefined && node.kind === "ASSESSMENT_ITEM");
}

export function placementsForAssessmentItem(assessmentItemId: string, graph = buildCertificationKnowledgeGraph()) {
  return graph.edges
    .filter((edge) => edge.fromId === assessmentItemId && (edge.kind === "PLACED_IN_DOMAIN_QUIZ" || edge.kind === "PLACED_IN_CERTIFICATION_RUN"))
    .map((edge) => graph.nodes.find((node) => node.id === edge.toId))
    .filter((node): node is KnowledgeGraphNode => Boolean(node));
}

export function objectivesLackingApprovedCoverage(cert?: Cert, graph = buildCertificationKnowledgeGraph()) {
  return graph.nodes.filter((node) => {
    if (node.kind !== "OBJECTIVE" || (cert && node.cert !== cert)) return false;
    const kuIds = graph.edges.filter((edge) => edge.fromId === node.id && edge.kind === "HAS_KNOWLEDGE_UNIT").map((edge) => edge.toId);
    return !kuIds.some((kuId) => itemsTestingKnowledgeUnit(kuId, graph).some((item) => item.status === "approved"));
  });
}

export function confusedConcepts(graph = buildCertificationKnowledgeGraph()) {
  return graph.edges.filter((edge) => edge.kind === "COMMONLY_CONFUSED_WITH");
}

export function contentAffectedByChangedSource(sourceDocumentId: string, graph = buildCertificationKnowledgeGraph()) {
  const affected = new Set<string>([sourceDocumentId]);
  let changed = true;

  while (changed) {
    changed = false;
    for (const edge of graph.edges) {
      if ((affected.has(edge.fromId) || affected.has(edge.toId)) && (!affected.has(edge.fromId) || !affected.has(edge.toId))) {
        affected.add(edge.fromId);
        affected.add(edge.toId);
        changed = true;
      }
    }
  }

  return graph.nodes.filter((node) => affected.has(node.id));
}

export function validateKnowledgeGraph(graph = buildCertificationKnowledgeGraph()) {
  const nodeIds = new Set(graph.nodes.map((node) => node.id));
  const errors: string[] = [];
  const approvedQuestions = approvedSourceGroundedQuestions();

  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.fromId)) errors.push(`missing-from-node:${edge.id}`);
    if (!nodeIds.has(edge.toId)) errors.push(`missing-to-node:${edge.id}`);
    if (edge.confidence < 0 || edge.confidence > 1) errors.push(`invalid-confidence:${edge.id}`);
    if (!edge.evidence.trim()) errors.push(`missing-evidence:${edge.id}`);
  }

  for (const certification of certifications) {
    if (!graph.nodes.some((node) => node.id === certification.id && node.kind === "CERTIFICATION")) {
      errors.push(`missing-certification-node:${certification.id}`);
    }
    for (const domain of certification.domains) {
      if (!graph.nodes.some((node) => node.id === domain.id && node.kind === "DOMAIN")) {
        errors.push(`missing-domain-node:${domain.id}`);
      }
    }
  }

  for (const question of approvedQuestions) {
    const questionNode = graph.nodes.find((node) => node.id === question.id);
    if (!questionNode || questionNode.status !== "approved") errors.push(`missing-approved-question-node:${question.id}`);
    if (!placementsForAssessmentItem(question.id, graph).length) errors.push(`missing-placement:${question.id}`);
  }

  return { ok: errors.length === 0, errors };
}

export const certificationKnowledgeGraph = buildCertificationKnowledgeGraph();
