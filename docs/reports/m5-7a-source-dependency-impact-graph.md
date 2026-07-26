# M5.7A Source Dependency And Impact Graph

Status: complete in repo; live source-version processing pending in M5.12.

## Implemented

- Added `src/data/sourceImpactGraph.ts`.
- Added source version diff records with previous/next hashes and changed/removed/added sections.
- Added traversal from changed source document through Knowledge Units, learning summaries, assessment items, domain quiz placements, and certification run placements.
- Added risk states: unchanged, needs-review, needs-replacement, and blocked.
- Added targeted replacement jobs that require Main Admin review and never auto-publish.
- Added Supabase migration `0014_source_dependency_impact_graph.sql` with source diffs, impact records, replacement jobs, RLS, constraints, and indexes.
- Added `scripts/validate-source-impact.mjs` and CI coverage.
- Added `src/data/sourceImpactGraph.test.ts`.

## Preserved

- Source changes do not automatically edit, remove, replace, or publish content.
- Replacement jobs are queued for Main Admin review only.
- No learner-path LLM calls were added.

## Remaining M5.12 verification

- Apply and verify migration behavior against a live Supabase project.
- Verify live source-version diff creation from ingestion jobs.
- Connect impact records into M5.8 Admin Review Studio queues.
