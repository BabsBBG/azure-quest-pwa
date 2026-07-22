# M5.4A Certification Knowledge Graph

Status: complete in repo; live Supabase verification pending in M5.12.

## Implemented

- Added a typed certification knowledge graph model in `src/data/knowledgeGraph.ts`.
- Added graph node kinds for Provider, Certification, Certification Version, Domain, Objective, Knowledge Unit, Source Document, Source Chunk, Learning Summary, Assessment Item, Domain Quiz Placement, and Certification Run Placement.
- Added typed relation kinds for source support, summary dependencies, assessment coverage, quiz placement, certification-run placement, prerequisites, related concepts, contrasts, and common confusions.
- Added traversal helpers for:
  - Sources supporting an objective.
  - Knowledge Units lacking approved assessment coverage.
  - Summaries depending on a source document.
  - Assessment items testing a Knowledge Unit.
  - Domain quiz and certification-run placements for an item.
  - Objectives lacking approved coverage.
  - Commonly confused concept links.
  - Content affected by a changed source document.
- Added Supabase migration `0009_certification_knowledge_graph.sql` with normalized graph nodes, graph edges, item-KU links, domain quiz placements, certification run placements, RLS, integrity checks, and indexes.
- Added `scripts/validate-knowledge-graph.mjs` and CI coverage.
- Added `src/data/knowledgeGraph.test.ts`.
- Expanded the source-ingestion registry to include AZ-500 as a retiring certification with SC-500 replacement metadata so graph coverage matches current approved practice content.

## Preserved

- No graph database was introduced.
- No learner-path LLM calls were added.
- Approved source-grounded questions are still the only approved preview records served.
- AZ-500 remains retiring; this graph entry preserves source/history coverage and does not reactivate new learner pathways.

## Remaining M5.12 verification

- Apply and verify migration behavior against a live Supabase project.
- Verify RLS role behavior with Main Admin, Content Reviewer, Support Admin, and User accounts.
- Exercise graph-driven admin workflows once M5.8-M5.10 are implemented.
