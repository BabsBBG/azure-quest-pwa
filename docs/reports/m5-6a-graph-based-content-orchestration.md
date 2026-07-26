# M5.6A Graph-Based Content Orchestration

Status: complete in repo; live workflow execution verification pending in M5.12.

## Implemented

- Added `src/data/contentOrchestration.ts`.
- Added typed workflow nodes for:
  - Coverage planning.
  - Source resolution.
  - Question generation.
  - Grounding verification.
  - Ambiguity critic.
  - Distractor critic.
  - Duplicate detection.
  - Difficulty estimation.
  - Admin handoff.
- Added durable workflow state shape with status, graph version hash, coverage gaps, generation job reference, cost estimate, duration, failure reasons, retry limits, and events.
- Added explicit `publishAutomatically: false` behavior.
- Added Supabase migration `0012_graph_content_orchestration.sql` with workflow, node, event tables, RLS, retry integrity checks, no-auto-publish constraint, and indexes.
- Added `scripts/validate-content-orchestration.mjs` and CI coverage.
- Added `src/data/contentOrchestration.test.ts`.

## Preserved

- Workflows never publish automatically.
- Generated questions remain draft-only and require downstream critic/admin review.
- No learner-path LLM calls were added.
- No client-side LLM keys were added.

## Remaining M5.12 verification

- Apply and verify migration behavior against a live Supabase project.
- Verify Main Admin-only workflow execution.
- Connect orchestration output to M5.7 critic gates and M5.8 Admin Review Studio queues.
