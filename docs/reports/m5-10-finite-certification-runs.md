# M5.10 Finite Certification Runs

Status: complete in repo; publication blocked until approved item coverage is sufficient.

## Implemented

- Added `src/data/finiteCertificationRuns.ts`.
- Defined versioned run types for each certification:
  - Baseline.
  - Applied.
  - Pressure.
  - Final.
  - Personalized.
- Added explicit target question counts, timing, domain distribution rules, personalized selection rule, publication state, effective dates, item placements, and missing approved item counts.
- Updated Assessment Center and legacy dashboard certification-run menus to display finite run definitions and blocked status.
- Added Supabase migration `0016_finite_certification_runs.sql` with finite run definitions, approved item placements, RLS, publication guard, and indexes.
- Added `scripts/validate-finite-certification-runs.mjs` and CI coverage.
- Added `src/data/finiteCertificationRuns.test.ts`.

## Preserved

- Incomplete finite runs are blocked rather than served as approved source-grounded runs.
- Existing seed/demo practice remains clearly labelled as seed/demo content.
- Personalized runs do not generate live questions during learner attempts.

## Remaining M5.12 verification

- Apply and verify migration behavior against a live Supabase project.
- Publish finite runs only after enough Main Admin-approved source-grounded items exist.
- Browser-check finite run menus after M5.11 feedback is complete.
