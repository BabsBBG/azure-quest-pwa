import { objectivesLackingApprovedCoverage, type KnowledgeGraphNode } from "./knowledgeGraph";
import { createGenerationJob, sampleCoverageTargets, type QuestionGenerationJob } from "./questionGenerationFactory";
import { sourceHash } from "./sourceIngestion";

export type OrchestrationNodeType =
  | "COVERAGE_PLANNING"
  | "SOURCE_RESOLUTION"
  | "QUESTION_GENERATION"
  | "GROUNDING_VERIFICATION"
  | "AMBIGUITY_CRITIC"
  | "DISTRACTOR_CRITIC"
  | "DUPLICATE_DETECTION"
  | "DIFFICULTY_ESTIMATION"
  | "ADMIN_HANDOFF";

export type OrchestrationNodeStatus = "pending" | "running" | "completed" | "failed" | "blocked" | "skipped";

export interface OrchestrationNode {
  id: string;
  type: OrchestrationNodeType;
  status: OrchestrationNodeStatus;
  dependsOn: string[];
  attempts: number;
  maxRetries: number;
  costEstimateCents: number;
  durationMs: number;
  failureReason?: string;
  outputRef?: string;
}

export interface OrchestrationEvent {
  id: string;
  nodeId: string;
  type: "started" | "completed" | "failed" | "blocked" | "retry-scheduled" | "handoff-created";
  message: string;
  createdAt: string;
}

export interface ContentOrchestrationWorkflow {
  id: string;
  status: "draft" | "running" | "completed" | "failed" | "blocked";
  graphVersionHash: string;
  nodes: OrchestrationNode[];
  events: OrchestrationEvent[];
  coverageGaps: KnowledgeGraphNode[];
  generationJob?: QuestionGenerationJob;
  totalCostEstimateCents: number;
  totalDurationMs: number;
  publishAutomatically: false;
  createdAt: string;
  updatedAt: string;
}

const nodeOrder: OrchestrationNodeType[] = [
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

function nodeId(workflowId: string, type: OrchestrationNodeType) {
  return `${workflowId}:${type.toLowerCase().replace(/_/g, "-")}`;
}

export function createContentOrchestrationWorkflow(args: { idempotencyKey: string; now?: string }): ContentOrchestrationWorkflow {
  const id = `workflow-${sourceHash(args.idempotencyKey).slice(0, 24)}`;
  const now = args.now ?? new Date("2026-07-26T00:00:00.000Z").toISOString();
  const gaps = objectivesLackingApprovedCoverage();
  const nodes: OrchestrationNode[] = nodeOrder.map((type, index) => ({
    id: nodeId(id, type),
    type,
    status: "pending",
    dependsOn: index === 0 ? [] : [nodeId(id, nodeOrder[index - 1])],
    attempts: 0,
    maxRetries: type === "QUESTION_GENERATION" ? 1 : 0,
    costEstimateCents: 0,
    durationMs: 0
  }));

  return {
    id,
    status: "draft",
    graphVersionHash: sourceHash(gaps.map((gap) => gap.id).join("|")),
    nodes,
    events: [],
    coverageGaps: gaps,
    totalCostEstimateCents: 0,
    totalDurationMs: 0,
    publishAutomatically: false,
    createdAt: now,
    updatedAt: now
  };
}

function eventFor(workflowId: string, node: OrchestrationNode, type: OrchestrationEvent["type"], message: string, createdAt: string): OrchestrationEvent {
  return {
    id: `event-${sourceHash(`${workflowId}:${node.id}:${type}:${message}:${createdAt}`).slice(0, 24)}`,
    nodeId: node.id,
    type,
    message,
    createdAt
  };
}

export function runContentOrchestrationWorkflow(workflow: ContentOrchestrationWorkflow) {
  const now = new Date("2026-07-26T00:00:00.000Z").toISOString();
  const next: ContentOrchestrationWorkflow = {
    ...workflow,
    status: "running",
    nodes: workflow.nodes.map((node) => ({ ...node })),
    events: [...workflow.events],
    updatedAt: now
  };

  for (const node of next.nodes) {
    const dependenciesComplete = node.dependsOn.every((dependencyId) =>
      next.nodes.some((candidate) => candidate.id === dependencyId && candidate.status === "completed")
    );

    if (!dependenciesComplete) {
      node.status = "blocked";
      node.failureReason = "Waiting for prior orchestration node completion.";
      next.events.push(eventFor(next.id, node, "blocked", node.failureReason, now));
      next.status = "blocked";
      break;
    }

    node.status = "running";
    node.attempts += 1;
    next.events.push(eventFor(next.id, node, "started", `${node.type} started.`, now));

    if (node.type === "QUESTION_GENERATION") {
      next.generationJob = createGenerationJob({
        idempotencyKey: `${next.id}:generation`,
        targets: sampleCoverageTargets,
        config: { budgetCapCents: 0, perQuestionCostCapCents: 0, batchQuestionLimit: 4 },
        now
      });
      node.outputRef = next.generationJob.id;
    }

    if (node.type === "ADMIN_HANDOFF") {
      node.outputRef = "admin-review-required";
      next.events.push(eventFor(next.id, node, "handoff-created", "Admin review handoff created. No automatic publication is allowed.", now));
    }

    node.status = "completed";
    node.durationMs = node.type === "QUESTION_GENERATION" ? 120 : 40;
    next.events.push(eventFor(next.id, node, "completed", `${node.type} completed.`, now));
  }

  next.totalCostEstimateCents = next.nodes.reduce((sum, node) => sum + node.costEstimateCents, 0);
  next.totalDurationMs = next.nodes.reduce((sum, node) => sum + node.durationMs, 0);
  next.status = next.nodes.every((node) => node.status === "completed") ? "completed" : next.status;
  next.publishAutomatically = false;
  return next;
}

export function validateContentOrchestrationWorkflow(workflow: ContentOrchestrationWorkflow) {
  const errors: string[] = [];
  const nodeTypes = new Set(workflow.nodes.map((node) => node.type));

  for (const type of nodeOrder) {
    if (!nodeTypes.has(type)) errors.push(`missing-node:${type}`);
  }

  for (const node of workflow.nodes) {
    for (const dependency of node.dependsOn) {
      if (!workflow.nodes.some((candidate) => candidate.id === dependency)) errors.push(`missing-dependency:${node.id}:${dependency}`);
    }
    if (node.attempts > node.maxRetries + 1) errors.push(`retry-limit-exceeded:${node.id}`);
    if (node.costEstimateCents < 0 || node.durationMs < 0) errors.push(`invalid-cost-or-duration:${node.id}`);
  }

  if (workflow.publishAutomatically !== false) errors.push("workflow-must-not-auto-publish");
  if (workflow.status === "completed" && !workflow.events.some((event) => event.type === "handoff-created")) errors.push("missing-admin-handoff");
  if (workflow.totalCostEstimateCents < 0 || workflow.totalDurationMs < 0) errors.push("invalid-workflow-totals");
  if (!workflow.graphVersionHash.trim()) errors.push("missing-graph-version-hash");

  return { ok: errors.length === 0, errors };
}
