# M5 QA Product, Regression, And Accessibility

Date opened: 2026-07-22

Role: Senior QA Engineer - Product Quality, Regression, Accessibility and End-to-End Behaviour

## Current Decision

Status: `FAIL`

M5.1 reliable sessions and M5.2 rich item walkthrough support are fixed in repo and statically retested. M5 remains blocked by admin route, KQL trust behavior, accessibility gaps, and final E2E/live verification.

## Browsers And Viewport Sizes Tested

No browser screenshots or automated E2E browser runs were performed during baseline. Static route/component inspection was completed.

## End-To-End Journeys Tested

Baseline local automated suite passed:

- Unit/component tests: 11 files, 26 tests.
- Route/import check passed.
- Production build passed.

Manual E2E journey execution is still pending for M5.12.

## Accessibility Results

Baseline risks:

- Mobile nav uses six items with a five-column grid.
- Practice answer option buttons need stronger selection semantics.
- Loading/grading overlays need live-region announcement.
- Progress bars need explicit labels at call sites.

## Regression Results

Working baseline:

- Main learner nav labels match approved wording.
- Demo/seed warning exists on core practice/certification paths.
- AZ-500 new activation is blocked and routed toward SC-500.

Blocking regressions/gaps:

- In-progress assessments now have local/cloud session recovery in repo; browser refresh/closure E2E verification remains pending.
- In-progress mock interviews do not recover before completion.
- Rich assessment item types are implemented in the walkthrough and shared contracts; production pool placement remains blocked until later M5 publication/placement gates.
- `/admin` review studio is absent.
- KQL Gym trust and answer-reveal behavior needs product decision/fix.

## Defects Discovered

- M5-DEF-005
- M5-DEF-006
- M5-DEF-007
- M5-DEF-008
- M5-DEF-009
- M5-DEF-010

## Defects Retested

- M5-DEF-005: `npm test -- src/lib/cloudSync.test.ts src/store/useAppStore.test.ts src/utils/quizEngine.test.ts`, `npm run lint`, and `npm run build` passed on 2026-07-22.
- M5-DEF-007: `npm run validate:rich-items`, `npm test -- src/utils/richItemScoring.test.ts`, `npm run check:routes`, and `npm run build` passed on 2026-07-22.

## Remaining Limitations

- E2E and accessibility automation are not yet implemented.
- Browser refresh/closure recovery is not yet covered by tests.
- Admin workflows do not exist yet for full product QA.

## Pass Or Fail

`FAIL`
