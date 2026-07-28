import type { ImportedProject } from "../types";

export const northstarInventoryProject: ImportedProject = {
  id: "northstar-inventory-api",
  owner: "northstar-fixtures",
  repo: "inventory-api",
  url: "https://github.com/northstar-fixtures/inventory-api",
  defaultBranch: "main",
  primaryLanguage: "TypeScript",
  languages: ["TypeScript", "SQL", "Dockerfile"],
  stars: 0,
  readme: "Northstar Inventory API is a fictional inventory-management API built only for automated testing.",
  readmeExcerpt: "A fictional inventory-management API built only for automated testing with REST endpoints, relational persistence, containers, CI checks, and basic monitoring.",
  contentHash: "northstar-inventory-api-fixture-hash",
  importedAt: "2026-07-28T00:00:00.000Z",
  status: "draft",
  storyDraft: {
    pitch30: "Northstar Inventory API is a fictional testing fixture for explaining generic API ownership, validation, deployment, and monitoring trade-offs.",
    walkthrough2m: "The fixture represents a small backend service with REST endpoints, relational data, container configuration, CI checks, and basic application monitoring. It is not based on a real owner project.",
    star: {
      situation: "A fictional team needed a small API fixture for automated tests.",
      task: "Model repository-analysis output without using a real personal project.",
      action: "Use generic backend, database, CI, container, and monitoring concepts.",
      result: "A safe test-only fixture that never appears in production user accounts."
    },
    architecture: ["REST API layer", "Relational persistence", "Container configuration", "CI checks", "Basic monitoring"],
    resumeBullets: ["Used a synthetic API fixture to validate private Project Intelligence flows without exposing personal project data."],
    risks: ["This is a test fixture only.", "Do not seed this into production.", "Do not present this as a real user project."]
  },
  analysis: {
    id: "analysis-northstar-inventory-api",
    generatedAt: "2026-07-28T00:00:00.000Z",
    contentHash: "northstar-inventory-api-fixture-hash",
    status: "draft",
    overview: {
      projectType: "Fictional API fixture",
      detectedFrameworks: ["REST", "SQL", "Docker"],
      keyEntryPoints: ["README.md"],
      persistence: "Relational persistence is part of the synthetic fixture.",
      apis: "REST endpoints are part of the synthetic fixture.",
      integrations: "No external integration is seeded.",
      authentication: "Authentication is not claimed.",
      tests: "CI checks are represented for tests only.",
      deployment: "Container configuration is represented for tests only.",
      ciCd: "CI checks are represented for tests only.",
      observability: "Basic monitoring is represented for tests only."
    },
    architectureMap: [{ label: "Synthetic REST API layer", files: ["README.md"], confidence: "confirmed" }],
    strengths: [{ label: "Safe synthetic evidence for tests", files: ["README.md"], confidence: "confirmed" }],
    risksAndImprovements: [{ label: "Never seed this fixture into production", files: ["README.md"], confidence: "recommendation" }],
    interviewQuestions: ["How would you explain the boundaries of this synthetic API fixture?"]
  }
};
