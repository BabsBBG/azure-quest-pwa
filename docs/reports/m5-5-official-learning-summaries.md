# M5.5 Official Learning Summaries

Status: complete in repo; live Supabase verification pending in M5.12.

## Implemented

- Added source-grounded learning summary workspaces in `src/data/learningSummaries.ts`.
- Added immutable published summary versions with Main Admin approval metadata.
- Each summary includes:
  - Domain overview.
  - Learning sequence.
  - Terminology.
  - Configuration steps.
  - Decision rules.
  - Common mistakes.
  - Examples.
  - Official Microsoft Learn source links.
  - Blueprint version.
  - Review and publication status.
- Added learner-facing approved summaries to the certification Learn page.
- Added Supabase migration `0010_learning_summaries.sql` for workspaces, source links, immutable published versions, RLS, and publication immutability triggers.
- Added `scripts/validate-learning-summaries.mjs` and CI coverage.
- Added `src/data/learningSummaries.test.ts`.

## Preserved

- Summaries do not claim to be official provider wording.
- No learner-path LLM calls were added.
- No client-side LLM keys were added.
- Existing official docs and video tracking remain in place.
- Demo/seed question warnings remain unchanged.

## Remaining M5.12 verification

- Apply and verify migration behavior against a live Supabase project.
- Verify Main Admin publication and immutability behavior in live RLS.
- Verify the Learn page with browser accessibility checks once the later M5 admin surfaces are in place.
