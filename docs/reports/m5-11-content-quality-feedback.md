# M5.11 User Reporting And Content-Quality Feedback

Status: complete in repo; live persistence verification pending in M5.12.

## Implemented

- Added `src/data/contentQualityReports.ts`.
- Added report creation for approved assessment items only.
- Stored item ID, item version, source chunk, source URL, optional attempt/session context, reason, optional comment, status, and no-auto-mutation flag.
- Added a Report a problem action beside approved source-grounded preview items.
- Added Admin Review Studio quality report queue summary.
- Added Supabase migration `0017_content_quality_reports.sql` with reports, report events, RLS, reviewer/admin queue policies, and a no-auto-mutation guard.
- Added `scripts/validate-content-quality-reports.mjs` and CI coverage.
- Added `src/data/contentQualityReports.test.ts`.

## Preserved

- Reports never auto-edit, remove, replace, or publish content.
- Unknown/unpublished assessment items cannot be reported through the helper.
- Demo/seed bank warnings remain visible.

## Remaining M5.12 verification

- Apply and verify migration behavior against a live Supabase project.
- Connect report form submission to authenticated/local persistence after live backend configuration.
- Browser-check report flow after final validation.
