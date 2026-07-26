# M5.6 Controlled Question-Generation Factory

Status: complete in repo; production provider activation remains disabled.

## Implemented

- Added `src/data/questionGenerationFactory.ts`.
- Added server-side-oriented provider interface with a deterministic test provider.
- Added generation jobs, coverage targets, idempotency keys, cancellation, retry counters, budget caps, per-question cost caps, batch limits, source-chunk limits, rate limits, kill switch checks, quarantine reasons, and failure logs.
- Added deterministic draft generation that creates draft-only source-grounded records requiring critic checks and Main Admin review before serving.
- Added Supabase migration `0011_question_generation_factory.sql` with jobs, targets, generated drafts, generation events, RLS, Main Admin-only management, production-disabled check constraints, budget constraints, and indexes.
- Added `scripts/validate-question-generation-factory.mjs` and CI coverage.
- Added `src/data/questionGenerationFactory.test.ts`.

## Preserved

- No learner-path question generation.
- No client-side LLM calls or frontend LLM API keys.
- Production external LLM provider remains disabled by default.
- Generated drafts are not approved, not served, and not published automatically.
- Existing source-grounded approved preview records remain unchanged.

## Remaining M5.12 verification

- Apply and verify migration behavior against a live Supabase project.
- Verify Main Admin-only execution controls with real roles.
- Connect later M5.6A workflow orchestration and M5.7 critic gates before any production provider is enabled.
