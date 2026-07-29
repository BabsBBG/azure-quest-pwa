# M5/M6 Baseline Audit

Date: 2026-07-29

Branch: `codex/m5-m6-production-hardening`

Latest audited commit: `cd7c3c2f Add signed-in browser auth gates`

Latest audited local slice: Flashcards trust-copy coverage and Assessment Shell final-submit/results retest, pending commit/push.

Status: UPDATED BASELINE COMPLETE - M5/M6 NOT PRODUCTION SIGNED OFF

## Repository And CI

- Repository: `https://github.com/BabsBBG/praxisgrid`
- Pull request: `https://github.com/BabsBBG/praxisgrid/pull/1`
- PR head: `cd7c3c2fb0be70f3b8b954746bffeb62f42053cd`
- Latest GitHub Actions CI run: `30443789859`, passed on 2026-07-29.
- Latest local CI-equivalent suite after the pending slice passed on 2026-07-29: install, Playwright install, typecheck, lint, `npm test`, integration tests, all CI validators, Chromium 15/15, WebKit 15/15, mobile 30/30, accessibility 36/36, visual 6/6, build, and explicit public production smoke 20 passed with 10 expected local-only signed-in skips.
- PR preview checks also reported success/neutral Netlify preview statuses, but Vercel remains the primary deployment target.
- Worktree was clean before this refreshed audit update.

## Vercel And Production Identity

- Vercel project inspected as `praxisgrid`.
- Project ID: `prj_DxdQNrbGComRH4dubDiUzd5h6sMD`.
- Scope: `tonybabalola-1114s-projects`.
- Framework: Vite.
- Build command: `npm run build`.
- Output directory: `dist`.
- Install command: `npm install --legacy-peer-deps --no-audit --no-fund`.
- Vercel domains list returned `0 Domains`.
- `https://praxisgrid.vercel.app` returned 404 during verification.
- Public production smoke target remains `https://azure-quest-pwa.vercel.app` until a canonical PraxisGrid domain is assigned.
- Fresh production deployment `dpl_3amN4Z2CXQap8XKsh6vxXxkBqNic` was READY.
- Unique deployment/project aliases can redirect through Vercel deployment protection and must not be treated as public smoke targets unless protection is disabled.

## Environment And Supabase

- `npx vercel env ls praxisgrid --scope tonybabalola-1114s-projects` failed with `Custom Environment not found`, so production/preview Supabase env state remains unverified from this command path.
- No secrets were read or committed.
- Supabase migrations exist locally from `0001_profiles.sql` through `0025_rpc_and_audit_hardening.sql`.
- Static migration/RLS/repository-isolation validators pass in CI, but they inspect source text and SQL files only.
- No live Supabase project reference, applied migration history, auth provider settings, redirect allow-list, test identities, or live RLS probe output is recorded in this checkout.
- Live Supabase activation, Google SSO verification, password-reset verification, owner MAIN_ADMIN bootstrap, and cross-user isolation remain blocked/unverified until connected live credentials and project access are exercised without exposing secrets.

## Production-Complete Or Green In Repo

- PraxisGrid naming, tagline, provider-neutral disclaimer, and local storage namespace migration exist.
- Public `/auth`, legal, and status routes exist.
- Learner and assessment routes are auth-gated in repo.
- `/admin` is auth/role-gated in repo and regular users are denied before Admin renders.
- Signed-in onboarding gate exists in repo and is browser-tested through a dev-only E2E harness.
- Home starts with exactly three primary destination cards: Learn, Practise, Prove.
- Demo/seed question-bank trust copy remains visible on assessment-like surfaces.
- Flashcards, KQL, Cases, Scenario Player, and the signed-in Assessment Shell are covered by browser checks for demo/seed trust copy.
- Assessment Shell final submit now closes submission review and renders the analytical results screen.
- Durable authenticated GitHub import quota/cache scaffolding exists in repo.
- Project Intelligence analysis rows are user-scoped in repo.
- Privacy export/delete UI and owner-delete policies exist in repo.
- CI includes Playwright Chromium/WebKit/mobile, axe accessibility, visual, production-smoke, migration, RLS, repository-isolation, production-content, auth/onboarding, and destructive-action gates.

## Implemented But Unverified

- Supabase Auth email/password, password reset, session persistence, and Google OAuth client calls are implemented, but live provider configuration and production redirects are not verified.
- SQL migrations and RLS policies are implemented, but not applied/probed against production in this audit.
- Active assessment and Interview Studio recovery are implemented with local/cloud-best-effort sync, but live Supabase recovery remains unverified.
- GitHub import durable quota/cache and Project Intelligence deletion are implemented, but live RPC, server env, and two-user isolation remain unverified.
- Production smoke passed against the public historical alias, but authenticated production journeys are not verified. Local production smoke without an explicit base URL reports `SKIPPED_MISSING_BASE_URL`; an explicit run against `https://azure-quest-pwa.vercel.app` passed.
- Onboarding is functional but stores preferences in auth metadata rather than a structured user-owned onboarding/profile model.

## Scaffold, Static, Or Fixture-Only

- The 600-question bank remains static demo/seed content and must not be trusted as production certification content.
- Official source ingestion still uses fixture adapters and local source arrays.
- Approved source-grounded questions, learning summaries, knowledge graph records, critic output, source impact, curated quiz structures, and finite run placements remain local/static scaffolds unless live Supabase records are later verified.
- Question generation uses deterministic test generation with production providers disabled.
- Admin Review Studio renders local/static queues and has no live mutation handlers/audit writes.
- Northstar Inventory API is an isolated synthetic test fixture only and must not be seeded into production accounts.

## Missing Or Incomplete For M5 PASS

- Canonical PraxisGrid URL.
- Production Supabase env verification and live migration application.
- Live RLS probes for MAIN_ADMIN, CONTENT_REVIEWER, SUPPORT_ADMIN, USER_A, and USER_B.
- Live Google SSO, email verification, password-reset, logout, session refresh, browser-closure recovery, and deep-link restoration proof.
- Structured onboarding model with target role, job description, interview focus, target exam date, weekly availability, prior familiarity, and project URL/skip state.
- Personalized Home based on active certification/career goal instead of hard-coded SC-300 defaults.
- Rich assessment item runtime in actual Domain Quizzes and Certification Runs.
- Complete analytical results with source citations, report action, collapsible advanced insights, and rich-item review rendering.
- Public GitHub import of selected source tree/config/tests/docs with secret detection/redaction beyond README/language heuristics.
- Evidence-backed Project Intelligence based on bounded file analysis, not README/language heuristics only.
- Live Admin operations and protected mutations for M6.0 through M6.12.
- Trusted SC-300 and SC-500 starter content from live official-source ingestion/review/publication.

## Broken Or Production Blocking

- M5/M6 sign-off remains FAIL while any S1/S2 defect in `docs/qa/M5_M6_DEFECT_LEDGER.md` is open or live verification remains absent.
- CI green is not equivalent to live Supabase or authenticated production verification.
- Public production still uses the historical `azure-quest-pwa.vercel.app` alias.
- The current source/content system must not publish or silently serve demo questions as trusted content.
- Admin appears operational in UI but is still backed by local/static queues.

## Senior Role Findings

- Principal Engineer: FAIL. Admin mutations, rich-item runtime, live Supabase/RLS, source content, and authenticated production journeys are not complete.
- Product Designer: FAIL. Home personalization, SC-300 route leakage, onboarding depth, Assessment Shell density, Results hierarchy, Career Lab separation, mobile nav safe-area polish, typography weight, and border neutrality need more work.
- Security/Data/Governance QA: FAIL pending live Supabase, RLS, role, repository-isolation, privacy, and provider verification.
- Product/UX/Accessibility QA: FAIL until broader signed-in learner/admin/product journeys and live production auth journeys are verified.

## Current Classification

| Area | Classification |
|---|---|
| Branch, PR, CI | production-complete for current repo slice |
| Vercel project rename/settings | deployed but canonical domain blocked |
| Public production smoke | locally verified against historical public alias |
| Supabase migrations | implemented but live-unverified |
| Supabase RLS | implemented but live-unverified |
| Auth/Google SSO | implemented but live-unverified |
| Onboarding | implemented but incomplete model |
| Home IA | implemented but not personalized enough |
| Assessment Shell | implemented with signed-in browser coverage for final submit/results; rich-item runtime still incomplete |
| Rich item support | scaffold/walkthrough-only for production assessments |
| Results | implemented but incomplete analytical contract |
| Repository import | implemented but incomplete file/depth/redaction coverage |
| Project Intelligence | implemented but heuristic/static-depth |
| Interview Studio | implemented but live/project evidence integration incomplete |
| Admin | scaffold-only for live operations |
| Trusted SC-300/SC-500 content | missing live production content |
| Personal project cleanup | fixed in repo with synthetic fixture isolation validator, but docs still contain historical rebrand/deployment references |

## Baseline Conclusion

PraxisGrid has made strong in-repository progress and CI is green, but M5 remains in progress and Phase 6 remains incomplete. The next work should reduce verifiable in-repo S1/S2 gaps while clearly preserving the distinction between repository implementation, local/browser testing, deployment, and live external verification.
