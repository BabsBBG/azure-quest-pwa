# M5.2 Rich Assessment Item Types

Date: 2026-07-22

## Scope

M5.2 introduces the rich assessment item contract and a separate Exam Walkthrough. Walkthrough content is isolated from certification assessment pools.

## Implemented

- Added discriminated union item types:
  - `SINGLE_CHOICE`
  - `MULTIPLE_CHOICE`
  - `ORDERING`
  - `MATCHING`
  - `CASE_STUDY_QUESTION`
- Added explicit case-study fields for shared case ID, title, overview, sections, exhibits, requirements, constraints, and related question IDs.
- Added `src/data/examWalkthroughItems.ts` with walkthrough-only items covering every supported type.
- Added `src/utils/richItemScoring.ts` with exact and optional partial scoring for multi-select, ordering, and matching.
- Added `/exam-walkthrough` route and an Assessment Center entry point.
- Added accessible controls:
  - radio semantics for single choice and case-study questions
  - multi-select pressed states and selection count instructions
  - keyboard/touch move up/down controls for ordering
  - select controls for matching
  - accessible case-study exhibits
- Added `npm run validate:rich-items` and CI coverage to ensure all required types exist and all walkthrough records are marked `walkthroughOnly`.

## Preserved

- Existing static seed/demo certification bank remains single-choice and visibly labelled as demo/seed.
- Walkthrough items do not enter the certification pool.
- Answers in actual assessment runs remain hidden until submission.
- Provider-neutral disclaimer and seed-bank warning remain visible.

## Validation

Passed:

- `npm run validate:rich-items`
- `npm test -- src/utils/richItemScoring.test.ts`
- `npm run check:routes`
- `npm run build`

## Known Follow-Up

- Full rich item integration into production certification pools remains blocked until source-grounded approved content, Admin publication, curated quiz placement, and Certification Run placement are complete.
- Browser E2E coverage for walkthrough controls remains part of M5.12.
