# M5.3 Confidence, Scoring, And Adaptation

Date: 2026-07-22

## Implemented

- Added named confidence ratings to assessment sessions and completed answer records:
  - `GUESSING`
  - `UNSURE`
  - `FAIRLY_CONFIDENT`
  - `CERTAIN`
- Added deterministic PraxisGrid simulated score on a 100-1000 bounded scale.
- Added clear disclaimer: "PraxisGrid simulated scores are estimates and do not reproduce a certification provider's private scoring model."
- Stored raw percentage separately from rounded percentage.
- Added confidence insight counts to completed attempts.
- Added deterministic adaptation signals for likely misconceptions, fragile knowledge, weak domains, and harder-practice readiness.
- Added result-screen display for simulated score and adaptive practice signals.

## Preserved

- No claim of certification-provider score equivalence.
- No Item Response Theory claim.
- Standard certification runs are not silently altered by adaptive logic.
- Existing readiness calculations remain compatible.

## Validation

Passed:

- `npm test -- src/utils/simulatedScoring.test.ts src/utils/quizEngine.test.ts`
- `npm run build`

## Remaining Verification

- M5.12 E2E should verify result-screen copy and confidence interpretation in the browser.
