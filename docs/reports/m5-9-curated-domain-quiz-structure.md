# M5.9 Curated Domain Quiz Structure

Status: complete in repo; publication blocked until approved item coverage is sufficient.

## Implemented

- Added `src/data/curatedDomainQuizzes.ts`.
- Defined five quiz tracks per certification domain:
  - Foundations.
  - Configuration.
  - Scenarios.
  - Troubleshooting.
  - Domain Challenge.
- Added explicit target question counts, timing rules, unlock rules, publication status, effective dates, item placements, and missing approved item counts.
- Enforced approved-item-only placement validation.
- Updated the Assessment Center quick quiz section to display curated structures, blocked/published status, timing, unlock rules, and missing approved placement counts.
- Updated legacy dashboard featured quizzes to use curated quiz structures and avoid starting blocked quizzes.
- Added Supabase migration `0015_curated_domain_quizzes.sql` with curated quiz definitions, approved item placements, RLS, publication guard, and indexes.
- Added `scripts/validate-curated-domain-quizzes.mjs` and CI coverage.
- Added `src/data/curatedDomainQuizzes.test.ts`.

## Preserved

- Demo/seed bank warning remains visible.
- Incomplete curated quizzes are blocked rather than served as approved source-grounded content.
- Existing local seed/demo practice behavior remains available elsewhere until the approved pool is large enough.

## Remaining M5.12 verification

- Apply and verify migration behavior against a live Supabase project.
- Publish curated quizzes only after enough Main Admin-approved source-grounded items exist.
- Browser-check Assessment Center once M5.10 and M5.11 are complete.
