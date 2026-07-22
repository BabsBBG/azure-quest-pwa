# M5 Baseline Audit

Date: 2026-07-22

Starting branch: `main`

Starting commit: `95cc444 Track env example for harness`

Repository: `https://github.com/BabsBBG/praxisgrid`

## Baseline Command Results

| Command | Exit | Result |
| --- | ---: | --- |
| `npm install --legacy-peer-deps` | 0 | Dependencies already up to date. Existing allow-scripts warning for `esbuild` and `sharp`. |
| `npm run lint` | 0 | ESLint passed. |
| `npm test` | 0 | 11 test files passed, 26 tests passed. |
| `npm run validate:harness` | 0 | Harness files are present. |
| `npm run validate:questions` | 0 | 600 seed/demo questions loaded. |
| `npm run validate:source-grounding` | 0 | 3 approved source-grounded questions and 3 source chunks valid. |
| `npm run validate:duplicates` | 0 | 600 seed/demo questions and 3 approved source-grounded records checked. |
| `npm run check:routes` | 0 | Route/import smoke check passed. |
| `npm run build` | 0 | Production build passed; Vite reports known main chunk warning above 500 kB. |

## Working Features

- PraxisGrid naming is broadly in place across product constants, package metadata, app chrome, and trust copy.
- React/Vite/Tailwind PWA routes exist for learner surfaces, Career Lab, history/progress/account, and supporting study tools.
- Static seed/demo practice flow supports seeded question selection, timers, hidden answers until completion, finish/review, retakes, randomized retry, local persistence after completion, and flags.
- AZ-500 is marked retiring, new activation is blocked, and SC-500 is recommended while preserving historical progress.
- Career Lab has track coverage, 30-minute interview sessions, typed answers, coaching reveal, self-score rubric, local history, and public GitHub import UI.
- Supabase auth/client foundation and migrations exist for profiles, attempts, interviews, flags, imports, roles, and source-pipeline scaffolding.
- Source-grounding scaffold has sample Microsoft Learn docs/chunks, approved-only helper, duplicate helper, duplicate validator, and CI coverage.
- Demo/seed bank warnings and provider-neutral non-affiliation disclaimers are present on major assessment paths.

## Current Architecture

- Frontend-first PWA using React 18, TypeScript, Vite, Tailwind, Zustand, localForage, and Supabase client helpers.
- Static runtime data lives in `src/data/questions.json`, `src/data/jobReadiness.ts`, and `src/data/sourceGrounding.ts`.
- Local-first persistence lives in `src/store/useAppStore.ts`, including `praxisgrid:*` keys and legacy `azure-quest:*` migration fallback.
- Supabase usage is best-effort through frontend auth and optional sync helpers in `src/lib/cloudSync.ts`; live migration application was not verified in this environment.
- Public GitHub import runs through `api/github-project.js` with public-read requests, deterministic draft creation, in-memory cache, and in-memory/IP daily limit.
- Source-grounded questions are preview/scaffold records and do not replace the static seed/demo bank.

## Current Milestone Drift

- `MILESTONES.md` previously labelled M5.1 and M5.2 as source-pipeline hardening and duplicate gate, but the approved M5 sequence defines M5.1 as Reliable Assessment Sessions and M5.2 as Rich Assessment Item Types.
- Existing source-grounding contract and duplicate gate are valid foundations, but belong under later source/critic milestones rather than completion of M5.1/M5.2.
- No persistent in-progress assessment-session system exists yet.
- Question model/runtime is still single-choice only.
- Production-scale ingestion, knowledge graph, learning summaries, question factory, automated critic, source-impact graph, admin review studio, curated quiz placements, finite certification runs, and user content reports are not complete.
- GitHub import rate limits/cache are in-memory and not durable or authenticated.
- `scripts/validate-source-grounding.mjs` still uses source-text inspection instead of the structured import pattern used by duplicate validation.

## Existing Role-Policy Defects

- `CONTENT_REVIEWER` can currently reach publication paths in source-pipeline RLS scaffolding.
- Public approved-question serving trusts `review_status` without sufficient database-level payload/source integrity enforcement.
- Audit logs can be caller-shaped in several privileged insert paths.
- `imported_projects.id` is globally keyed by content hash, so two users importing the same public repo can collide under owner-only RLS.

## Existing Data Risks

- In-progress assessment state is component-local and lost on refresh/browser close.
- In-progress Career Lab mock interview state is component-local and lost before completion.
- Supabase migration application and RLS behavior were inspected but not verified against a live Supabase project.
- Static seed/demo questions remain non-production and not source-grounded.

## Reusable M5 Foundations

- `src/types/index.ts`
- `src/store/useAppStore.ts`
- `src/lib/cloudSync.ts`
- `src/data/sourceGrounding.ts`
- `src/utils/questionQuality.ts`
- `scripts/validate-duplicates.mjs`
- `supabase/migrations/0001_profiles.sql`
- `supabase/migrations/0002_learning_data.sql`
- `supabase/migrations/0003_project_source_pipeline.sql`
- `supabase/migrations/0004_praxisgrid_roles_rebrand.sql`
- `supabase/migrations/0005_source_pipeline_review_policies.sql`

## Code That Must Be Replaced Or Hardened

- `src/data/questions.json` must remain seed/demo until replaced by approved source-grounded production content.
- `src/data/sourceGrounding.ts` hardcoded records must move behind storage-backed ingestion/review for production scale.
- `api/github-project.js` in-memory cache/rate limits must become durable and user-aware.
- `scripts/validate-source-grounding.mjs` should switch to structured validation.
- `src/pages/PracticeArena.tsx` needs persistent assessment sessions, recovery, richer item types, confidence, and submission review.
- `src/App.tsx` has no `/admin` route yet.

## Technical Debt

- Large single JS chunk warning remains.
- E2E and acceptance test folders are placeholders only.
- Several secondary routes remain reachable outside primary navigation and need explicit product ownership.
- Admin/reviewer UI is absent.
- Accessibility gaps exist in mobile nav layout, answer option semantics, loading announcements, and progress labels.

## Baseline Review Inputs

- Senior Principal Engineer baseline: completed, no edits.
- Senior QA Security/Data/Governance baseline: completed, no edits, release blockers found.
- Senior QA Product/Regression/Accessibility baseline: completed, no edits, release blockers found.
