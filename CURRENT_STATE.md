# CURRENT_STATE.md

## Current status

The app currently exists as a frontend-first PWA in `BabsBBG/praxisgrid`.

Harness state:

- Product: PraxisGrid.
- Active programme: M5 Production Perfection followed by Phase 6.
- M5 status: REOPENED FOR PRODUCTION HARDENING.
- M6 status: APPROVED.
- M7 status: NOT APPROVED.
- The user explicitly approved this programme on 2026-07-26 through the PraxisGrid Master Delivery Instruction.
- The previous M5 sign-off is superseded by the M5/M6 baseline audit because production-critical items remain scaffold-only, fixture-only, or externally unverified.
- Current M5/M6 production sign-off is FAIL until S1/S2 defects in `docs/qa/M5_M6_DEFECT_LEDGER.md` are fixed and live/browser verification gates pass.
- M5/M6 production-hardening branch `codex/m5-m6-production-hardening` has started.
- First hardening slice adds `/auth`, public legal/status routes, protected learner routing, protected Admin routing, server-backed user role loading, and Learn/Practise/Prove primary navigation. Local focused auth tests, route check, lint, and build passed after this slice.
- Second hardening slice aligns secondary practice trust behavior: KQL Gym, Case Files, and Scenario Player show the shared demo/seed notice before practice; KQL explanations/correctness are hidden until run completion; focused KQL/notice tests passed.
- Third hardening slice adds Playwright browser gates for auth routing, public legal/status routes, axe accessibility, mobile/tablet/desktop viewports, WebKit, Chromium, visual-tagged auth layout, production-smoke configuration, and CI commands. Local slices passed: Chromium 10/10, WebKit 10/10, mobile 20/20, accessibility 36/36, visual 6/6, and tablet+desktop 20/20. The aggregate `npm run test:e2e` command exceeded the local shell timeout, so the equivalent coverage was run as slices.
- PR #1 CI for the hardening branch is green at GitHub Actions run `30214329194` after stabilizing auth-page accessibility for WebKit/mobile CI.
- Fourth hardening slice replaces the public GitHub import endpoint's in-memory rate/cache maps with authenticated Supabase user verification, durable per-user daily import events, durable repo cache records, placeholder server env names, and CI validation. Live Supabase migration/env verification remains pending.
- Fifth hardening slice adds active Interview Studio recovery in repo: local/legacy storage, best-effort Supabase sync, owner-only `active_interview_sessions` RLS migration, resume/discard UI, completion cleanup, regression coverage, and `validate:active-interview-recovery`. Browser refresh/resume and live Supabase verification remain pending.
- Sixth hardening slice addresses two security QA findings in repo: GitHub import quota claims now go through an atomic Supabase RPC with advisory locking, and content-quality report inserts are hardened to authenticated users only. Live Supabase migration/RLS verification remains pending.
- Seventh hardening slice starts the visible auth-first IA repair: Home now presents exactly Learn, Practise, and Prove as the primary choices, certification progress is secondary, Account copy no longer promises logged-out demo practice, and `validate:auth-first-ia` is wired into CI. Browser verification remains pending.
- Eighth hardening slice starts the assessment experience repair: `/arena` is authenticated outside the learner layout, completed runs render an analytical results report with JSON/CSV/print export actions, and `validate:assessment-shell` is wired into CI. Browser/visual verification remains pending.
- Ninth hardening slice removes Career Lab fixture project cards from the production path: new users see no projects connected, imported public repositories are the only mapper evidence source, `Northstar Inventory API` exists only as a test fixture, and `validate:project-fixtures` is wired into CI. Browser verification remains pending.
- Tenth hardening slice fixes global product typography in repo: body UI now uses a readable sans-serif stack, code/metadata opt into monospace, and `validate:typography` is wired into CI. Browser/design verification remains pending.
- Eleventh hardening slice clarifies production-smoke status: `test:production-smoke` now reports explicit PR skips when no production URL is configured, fails `main` if the URL is missing, and no longer falls back to the historical Azure Quest URL. Live production smoke remains pending until the canonical PraxisGrid URL is configured.
- Twelfth hardening slice deepens Project Intelligence in repo: imports now include typed evidence-backed analysis records, analysis persistence uses owner-scoped Supabase RLS with cascade delete, Career Lab exposes analysis overview/architecture/strengths/risks/prompts, and users can regenerate or delete repository analysis. Live Supabase migration/RLS verification remains pending.
- Thirteenth hardening slice adds privacy workflows in repo: Settings exposes signed-in cloud export/delete actions, cloud export includes learning and repository analysis tables, cloud deletion removes learning/recovery/import/Project Intelligence rows by user ID, and `validate:privacy-workflows` is wired into CI. Live Supabase RLS verification remains pending.
- Fourteenth hardening slice tightens the support role boundary in repo: SUPPORT_ADMIN receives read-only support/report queue access through explicit RLS helper policies, guard triggers block support report/content mutation, Admin Review Studio filters queues and hides approve/review publication controls by role, and `validate:support-boundary` is wired into CI. Live Supabase role/RLS verification remains pending.
- Fifteenth hardening slice closes follow-up governance gaps in repo: Project Intelligence cloud analysis row IDs are user-scoped to avoid same-repo collisions, the GitHub import quota RPC rejects cross-user claims and is revoked from anon/authenticated roles, and content-quality report audit events are Main Admin insert/select-only instead of mutable `for all`. Live Supabase RLS/RPC verification remains pending.
- Sixteenth hardening slice preserves auth deep links in repo: protected routes pass a safe internal `from` target to `/auth`, AuthPage returns authenticated users to that target, Google SSO can redirect back to the intended protected route instead of always `/account`, and `validate:auth-redirects` is wired into CI. Browser verification remains pending.
- Seventeenth hardening slice adds a production-content gate in repo: incomplete approved source-grounded coverage disables production quiz/run CTAs instead of routing into the demo bank, Readiness no longer links directly to seed-bank certification runs, and `validate:production-content` is wired into CI. Full live source ingestion/review/published content remains open.
- Eighteenth hardening slice makes destructive learner-data actions safer in repo: local reset and repository analysis deletion now require explicit browser confirmation, Project Intelligence delete failures surface to the learner instead of being swallowed, and `validate:destructive-actions` is wired into CI. Browser/live Supabase delete verification remains pending.
- Nineteenth hardening slice adds mandatory learner onboarding in repo: signed-in learners must complete `/onboarding` before learner or assessment routes render, onboarding preserves protected deep-link return targets, preferences are stored in Supabase auth metadata, Account can reopen onboarding in edit mode, and `validate:onboarding` is wired into CI. Browser/live Supabase verification remains pending.
- Twentieth hardening slice adds umbrella validation gates in repo: `validate:migrations` checks sequential secrets-free Supabase migrations, `validate:rls` checks core owner/role RLS boundaries, and `validate:repository-isolation` checks imported project and Project Intelligence user isolation. Live Supabase migration/RLS/repository-isolation probes remain pending.
- Twenty-first hardening slice advances canonical production identity: the connected Vercel project was renamed from `azure-quest-pwa` to `praxisgrid`, remote project settings now match Vite, `npm run build`, `dist`, and the repo install command, and fresh deployment `dpl_3amN4Z2CXQap8XKsh6vxXxkBqNic` is READY. Public production smoke passed 20/20 against `https://azure-quest-pwa.vercel.app`; the unique deployment URL and project alias remain protected by Vercel login, and `https://praxisgrid.vercel.app` still returns 404.
- Twenty-second hardening slice expands signed-in browser gates in repo: local Playwright now starts Vite with a dev-only E2E auth harness, signed-in learner onboarding redirect/completion is browser-tested, regular users are browser-tested out of Admin Review Studio, SUPPORT_ADMIN support-queue access is browser-tested without publication actions, and `validate:e2e-auth-harness` keeps the harness dev-only and skipped for production smoke. Local browser slices passed with the new gates: Chromium 13/13, WebKit 13/13, mobile 26/26, accessibility 36/36, visual 6/6, and public production smoke 20 passed with 6 dev-only skips. Live Supabase role/auth verification remains pending.
- Twenty-third hardening slice closes a trust-copy gap and broadens browser coverage in repo: Flashcards now shows the shared demo/seed bank notice, signed-in E2E checks Flashcards/KQL/Cases/Scenario Player trust copy, and signed-in E2E covers the Assessment Shell answer/review/submit/results/export/domain-table/question-review path. This slice also fixed a real Assessment Shell blocker where final submit left the submission review panel open and prevented the analytical results screen from rendering. Local CI-equivalent gates passed on 2026-07-29: install, Playwright install, typecheck, lint, `npm test`, integration tests, all CI validators, Chromium 15/15, WebKit 15/15, mobile 30/30, accessibility 36/36, visual 6/6, build, and explicit public production smoke 20 passed with 10 expected local-only signed-in skips. CI after push is pending.
- Senior Product Designer and Principal Engineer reviews on 2026-07-28 keep production sign-off at FAIL. New open blockers include Home IA, dedicated Assessment Shell/results, mandatory-auth copy cleanup, sans-serif body typography, Project Intelligence depth, production-smoke clarity, atomic GitHub import quotas, authenticated-only report RLS, and live Supabase/RLS verification.
- M5.0 authorization hardening migration `0006_m5_authorization_hardening.sql` was added to separate review/publish authority, block reviewer publication, harden audit actors, and fix imported-project cloud row collisions. Live Supabase RLS application remains pending.
- M5.1 Reliable Assessment Sessions are implemented in repo with local/cloud session persistence, recovery choices, timestamp expiry, direct question grid, mark/review/low-confidence filters, deliberate submission review, and confidence persistence. M5.12 E2E/live verification remains pending.
- M5.2 Rich Assessment Item Types are implemented in repo with a discriminated item union, scoring helpers, walkthrough-only sample items, `/exam-walkthrough`, and CI validation. Full browser E2E verification remains pending.
- M5.3 Confidence, Scoring, and Adaptation is implemented in repo with named confidence ratings, raw percentage, deterministic PraxisGrid simulated score, score disclaimer, confidence insight counts, and adaptive practice signals. M5.12 E2E verification remains pending.
- M5.4 Official Source Ingestion is implemented in repo with provider/certification registry, fixture fetch adapter, canonical URL normalization, official-domain allowlist, content hashing, source version/change detection, Knowledge Unit extraction, migration `0008`, and CI validation. Production activation remains externally blocked until live retrieval/runtime setup.
- M5.4A Certification Knowledge Graph is implemented in repo with typed local graph helpers, Supabase migration `0009`, source/objective/KU/item/summary/quiz/run placement relations, traversal tests, and CI validation. Live Supabase migration/RLS verification remains pending in M5.12.
- M5.5 Official Learning Summaries are implemented in repo with source-grounded domain summary workspaces, immutable Main Admin-approved published versions, Supabase migration `0010`, learner-facing approved summaries on Learn pages, tests, and CI validation. Live Supabase publication/RLS verification remains pending in M5.12.
- M5.6 Controlled Question-Generation Factory is implemented in repo with a server-side-oriented provider interface, deterministic test generator, generation jobs, idempotency, cancellation, batch/rate/cost/retry controls, kill switch and quarantine gates, Supabase migration `0011`, tests, and CI validation. Production external provider activation remains disabled by default.
- M5.6A Graph-Based Content Orchestration is implemented in repo with typed workflow nodes, graph coverage planning, source resolution, generation job handoff, critic placeholders, duplicate/difficulty stages, admin handoff, durable workflow/event migration `0012`, tests, and CI validation. Workflows cannot auto-publish.
- M5.7 Automated Critic and Duplicate Prevention is implemented in repo with critic checks for source support, answer uniqueness, distractor quality, ambiguity, hidden assumptions, objective alignment, difficulty, freshness, item validity, accessibility, wording leakage, semantic similarity, unsupported claims, and scenario consistency; hard failures are non-overridable, warning overrides require Main Admin records, migration `0013`, tests, and CI validation.
- M5.7A Source Dependency and Impact Graph is implemented in repo with source version diffs, affected-content traversal through summaries/items/quiz/run placements, risk states, targeted replacement jobs requiring Main Admin review, migration `0014`, tests, and CI validation.
- M5.8 Admin Review Studio is implemented in repo with a separate `/admin` route outside learner layout, persistent sidebar, utility bar, dense queues, split-pane review, sticky actions, audit timeline, role-boundary messaging, route validation, and CI validation. Live role-auth enforcement remains pending in M5.12.
- M5.9 Curated Domain Quiz Structure is implemented in repo with five quiz tracks per domain, explicit timing/unlock rules, approved-item-only placement validation, blocked status for missing coverage, Assessment Center display, migration `0015`, tests, and CI validation.
- M5.10 Finite Certification Runs are implemented in repo with Baseline, Applied, Pressure, Final, and Personalized run definitions, version/effective metadata, distribution rules, approved-item-only placement validation, blocked status for missing coverage, Assessment Center display, migration `0016`, tests, and CI validation.
- M5.11 User Reporting and Content-Quality Feedback is implemented in repo with approved-item-only report creation, item/source/attempt/session context fields, no-auto-mutation guard, Assessment Center report action, Admin Review Studio queue summary, migration `0017`, tests, and CI validation.
- Previous M5.12 Completion and Validation passed the earlier static/local suite, but is now reopened because the new production-hardening baseline found live auth, RLS, admin, source-content, browser, accessibility, and production identity gaps.
- M5 production deployment is READY and aliased to `https://azure-quest-pwa.vercel.app`.
- M5 production deployment ID: `dpl_GQJ2jVsRXWAeMX4SWvQHcTHKt6wi`.
- M5 production deployment URL: `https://azure-quest-a7y7zxukg-tonybabalola-1114s-projects.vercel.app`.
- M5 pushed GitHub Actions CI run `30200017797` passed for commit `ef0f6485202a8b1d9d6f837502baf33a08d61d32`.
- Google SSO production deployment is READY and aliased to `https://azure-quest-pwa.vercel.app`.
- Google SSO production deployment ID: `dpl_3p6upUV5Ve7Bxw6VBdBjvyY7Jyzk`.
- Google SSO production deployment URL: `https://azure-quest-nenrffh2z-tonybabalola-1114s-projects.vercel.app`.
- Google SSO pushed GitHub Actions CI run `30203475880` passed for commit `6f2cf10`.
- Live Supabase activation began on 2026-07-29 on branch `codex/live-supabase-activation`.
- Supabase organisation `BabsBBG's Org` was selected and production project `praxisgrid-production` was created in `eu-west-1` with ref `ozf...agfd`.
- Repository migrations `0001` through `0025` were dry-run and applied successfully to an empty hosted staging fallback, then dry-run and applied successfully to `praxisgrid-production`; migration `0026_project_intelligence_owner_fk.sql` was dry-run and applied successfully after PR #5; production local/remote migration history now matches through `0026`.
- Supabase Auth Site URL is configured to the working public fallback `https://azure-quest-pwa.vercel.app`; PraxisGrid and fallback auth/account redirects are allow-listed.
- Vercel Production now has encrypted `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values for the live Supabase project. The browser key is the Supabase publishable key, not a service-role key.
- Fresh production deployment `dpl_72KcnyvFKWKA2FxoPPbBVcR54xrz` is READY at `https://praxisgrid-kjc9kwys4-tonybabalola-1114s-projects.vercel.app` and aliased to `https://azure-quest-pwa.vercel.app`; public production smoke passed 20/20 with 10 expected signed-in skips.
- Latest production deployment `dpl_fheB6qE4yfT6y9JKru1dELXTug5K` is READY at `https://praxisgrid-pnsa9awqf-tonybabalola-1114s-projects.vercel.app` and aliased to `https://azure-quest-pwa.vercel.app`; public production smoke passed 20/20 with 10 expected signed-in skips.
- Live owner bootstrap, Google SSO, two-user RLS isolation, role-boundary, audit-integrity, and production authenticated browser verification remain blocked until `PRAXISGRID_OWNER_EMAIL` and Google OAuth credentials are supplied where required.
- Follow-up branch `codex/finish-m5-production` was merged through PR #5 and fixes the pushed production-mobile accessibility failure source by using explicit disabled button colors, makes production smoke skip pull requests because that gate targets the deployed production alias rather than the unmerged branch, converts auth methods to typed success/failure results, adds a real `/auth?mode=update-password` recovery-session flow, hides Google sign-in unless `VITE_GOOGLE_AUTH_ENABLED=true`, blocks onboarding navigation after failed profile saves, and adds migration `0026_project_intelligence_owner_fk.sql` so Project Intelligence analyses must reference an imported project owned by the same user. Local focused retests passed, PR #5 CI passed, merged `main` CI run `30718024880` passed after redeploying production, and production migration history now matches through `0026`.
- Local user-isolation hardening branch `codex/m5-local-user-isolation` partitions localForage learner data by authenticated Supabase user ID, reruns hydration when the auth user changes, prevents signed-in users from falling back to anonymous legacy data, keeps reset scoped to the active local partition, and adds `validate:local-user-isolation` to CI. Local typecheck, targeted store tests, and the new validator passed; full PR CI and production redeploy remain pending.

M5.0 rebrand status:

- Product name is now PraxisGrid.
- Tagline is "Learn it. Practise it. Prove it."
- GitHub repo was renamed from `BabsBBG/azure-quest-pwa` to `BabsBBG/praxisgrid`.
- Local `origin` now points to `https://github.com/BabsBBG/praxisgrid.git`.
- PWA metadata, package name, layout header, nav, account copy, footer disclaimer, and core assessment notices use PraxisGrid/provider-neutral language.
- localForage now writes to the `PraxisGrid` namespace with anonymous `praxisgrid:*` keys and authenticated `praxisgrid:user:<auth-user-id>:*` partitions while preserving read/copy fallback from the old `AzureQuest` and `azure-quest:*` storage only for anonymous migration.
- AZ-500 is marked RETIRING with retirement date 2026-08-31. New activation routes users toward SC-500 while preserving historical progress and attempts.
- Role foundation migration adds MAIN_ADMIN, CONTENT_REVIEWER, SUPPORT_ADMIN, and USER with RLS and role-change audit tables.
- Founder-specific sample project data was removed from Career Lab fixtures and replaced with fictional instructional examples.
- The Vercel project is now renamed to `praxisgrid`; the fresh production deployment is READY and the historical public alias `https://azure-quest-pwa.vercel.app` serves it until a canonical `praxisgrid` domain is assigned.
- M5.0 production deployment is READY and aliased to `https://azure-quest-pwa.vercel.app`.
- M5.0 production deployment ID: `dpl_9ipiSJqApivdyLRU5dhqwDriGRAT`.
- M5.0 deployment URL: `https://azure-quest-ky5gzhqz5-tonybabalola-1114s-projects.vercel.app`.
- M5.1 production deployment is READY and aliased to `https://azure-quest-pwa.vercel.app`.
- M5.1 production deployment ID: `dpl_65LhgJxoQXVbJdHPgGg9zR6HJzu4`.
- M5.1 deployment URL: `https://azure-quest-cgvbev4m6-tonybabalola-1114s-projects.vercel.app`.
- M5.2 duplicate detection gate is complete.
- M5.2 production deployment is READY and aliased to `https://azure-quest-pwa.vercel.app`.
- M5.2 production deployment ID: `dpl_4RzMGkKVnHT2J1gynrZZhLJ3QoLS`.
- M5.2 deployment URL: `https://azure-quest-azwmivyy6-tonybabalola-1114s-projects.vercel.app`.

Important correction:

- The labels above describe prior repository submilestone naming before the approved M5 harness was restored. Approved M5.1 now means Reliable Assessment Sessions and approved M5.2 now means Rich Assessment Item Types. Those approved submilestones are not yet complete.

It has:

- React/Vite/TypeScript frontend.
- Tailwind UI.
- Zustand store.
- localForage local persistence.
- Static question bank.
- Static Career Lab content.
- Practice/exam flow.
- Progress/readiness score concepts.
- History concepts.
- PWA setup.
- Supabase Auth account foundation with email/password and Google SSO through Supabase OAuth.

## What currently works

- `npm install --legacy-peer-deps` passes.
- `npm run build` passes and generates `dist`.
- `npm run lint` passes after adding an ESLint 9 flat config.
- `npm test` passes with 11 test files and 26 tests.
- Harness validation passes with `node scripts/validate-harness.mjs`.
- Question bank validation loads 600 seed/demo questions with `node scripts/validate-question-bank.mjs`.
- Source-grounding validation passes with `npm run validate:source-grounding`.
- Duplicate validation passes with `npm run validate:duplicates` and strict mode.
- Route smoke list script runs with `node scripts/check-routes.mjs`.
- CI now runs lint, tests, harness validation, question-bank validation, source-grounding validation, duplicate validation, route checks, and build.
- Vercel deployment config exists with Vite framework, `dist` output, and SPA rewrite to `index.html`.
- Exam landing screens visibly label the question bank as demo/seed content before quiz and mock exam start buttons.
- The practice arena and answer review show the demo/seed warning or provider-neutral non-affiliation disclaimer.
- Global layout footer shows the provider-neutral non-affiliation disclaimer.
- Local browser verification passed on `http://localhost:5174/` for the home route, `cert/sc-300/knowledge`, and a small `SC-300` arena smoke route.
- Browser verification found no Vite error overlay and no current-page console errors on the verified `localhost:5174` routes.
- Production Vercel deployment is live at `https://azure-quest-pwa.vercel.app`.
- Production deployment ID: `dpl_6cwQJjDeE8QUW9rXyC5KPSqfS6He`.
- Latest production deployment ID: `dpl_3p6upUV5Ve7Bxw6VBdBjvyY7Jyzk`.
- Latest production deployment URL: `https://azure-quest-nenrffh2z-tonybabalola-1114s-projects.vercel.app`.
- Primary navigation now uses Home, Learn, Domain Quizzes, Career Lab, Progress, and Account.
- Practice runs persist question flags locally and best-effort sync them to Supabase when signed in.
- Practice runs preserve focus domain, focus tags, quiz ID, exam ID, and seed for retakes.
- History separates Exam attempts, Quiz attempts, and Labs/practice attempts.
- Browser verification passed on production for exam landing, arena flag/Finish Now, and History separation.
- Final production redeploy is READY at `https://azure-quest-pwa.vercel.app`.
- Latest production deployment URL: `https://azure-quest-2or1anssh-tonybabalola-1114s-projects.vercel.app`.
- Subagent harness added with UI/UX Revamp Lead, Senior Software Engineer, and QA and Product Lead roles.
- Initial subagent audit completed and captured in `docs/reports/subagent-audit.md`.
- Mobile navigation labels now match the approved terms exactly.
- Cert landing pages now show the demo/seed question-bank warning.
- Legacy dashboard no longer sends users to stale `/learn`.
- Attempt persistence now awaits local save and surfaces retryable save errors on the results screen instead of failing silently.
- M1.5 professional Azure-blue visual polish now covers shared UI primitives, layout, path selection, cert overview, exam landing, practice arena, readiness, history, study mode, job readiness, legacy dashboard, settings, case files, KQL Gym, scenarios, docs, videos, learn tracker, learning content, and flashcards.
- The M1.5 follow-up audit corrected overly timid visuals with softer Azure borders, system typography, calmer page backgrounds, sharper cards, improved selected states, and low-bandwidth-safe styling.
- The secondary-route follow-up removed old violet/gradient/game-style treatments and brought remaining route surfaces onto `aq-*` cards, metrics, panels, inputs, and Azure badges.
- Playful labels such as Daily Boss, Swipe Cards, Cozy cyber cave, Explain Like I'm 5, and Next bite have been replaced with professional wording.
- Three M1.5 follow-up subagents reviewed UI/UX, senior engineering risk, and QA/product quality; their release-blocking findings were fixed before deployment.
- M1.5 production verification passed on the fresh deployment URL for Job Prep-era job surfaces and Study Mode; the production alias serves the new asset, but an already-open PWA tab may need refresh because of service worker caching.
- M1.6 adds Supabase email/password account foundation and Google SSO using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; Google OAuth secrets remain configured only in Supabase/Google provider settings.
- Account/Profile UI supports logged-out state, Google SSO, sign up, sign in, sign out, profile name update, loading states, and auth errors.
- Logged-out users can still use local demo practice and local attempt history.
- Attempts, readiness, flashcards, and interview practice still write locally first through localForage/Zustand.
- M2 Career Lab adds all seven tracks, a 30-minute interview studio, typed answers, coaching reveal, self-score rubric, and interview history.
- M3 Supabase foundation adds `profiles`, `quiz_attempts`, `interview_sessions`, `question_flags`, and owner-only RLS migrations while preserving logged-out fallback.
- M4 public GitHub import adds a Career Lab import panel, public-read-only repo URL validation, README/language import through a Vercel server endpoint, local/server import caps, content-hash caching, draft story generation, review risks, and imported project persistence.
- M5 source-grounding scaffold adds Microsoft Learn source docs, source chunks, approved sample questions, approved-only serving helper, source-grounding validation, and an exam-center preview of approved source-grounded records.
- M5.1 source-grounding contract hardening adds structured record validation, admin-only batch controls, kill-switch-blocked run fixture, stricter tests, and Supabase reviewer/admin policies with review-event auditing.
- M5.2 duplicate detection gate adds normalized duplicate validation for seed/demo records, strict global duplicate-key failure for approved source-grounded records, approved-serving duplicate refusal, shared typed duplicate helpers, and CI coverage.
- The app uses a JetBrains Mono / Cascadia Code / Fira Code style monospace font stack.
- The app uses `lucide-react` as the verified open-source icon system.
- M5.0 validation on 2026-07-21 passed install, lint, tests, harness validation, question validation, source-grounding validation, route checks, and production build.
- M5.1 validation on 2026-07-21 passed lint, tests, harness validation, question validation, source-grounding validation, route checks, and production build.
- M5.2 validation on 2026-07-22 passed install, lint, tests, harness validation, question validation, source-grounding validation, duplicate validation, strict duplicate validation, route checks, and production build.
- M5.2 production deployment on 2026-07-22 completed READY at `https://azure-quest-azwmivyy6-tonybabalola-1114s-projects.vercel.app` and was aliased to `https://azure-quest-pwa.vercel.app`.
- M5.1 implementation validation on 2026-07-22 passed focused tests, lint, and production build.
- M5.2 implementation validation on 2026-07-22 passed rich-item validation, scoring tests, route check, and production build.
- M5.3 implementation validation on 2026-07-22 passed simulated scoring tests, quiz engine tests, and production build.
- M5.4 implementation validation on 2026-07-22 passed source-ingestion tests, source-ingestion validation, and production build.

## What is demo/static

The following remain demo/static until the approved source-grounded pool is broad enough to replace them:

- Question bank.
- Domain coverage.
- Explanations.
- Readiness calculations.

## Question bank status

The current question bank is static demo/seed content.

It is useful for testing:

- quiz flow
- timers
- history
- readiness calculations
- answer review
- UI behavior

It is not yet trusted as a production exam-prep bank because:

- questions are not traceable to Microsoft Learn source chunks
- duplicate/repetitive stems may exist
- explanations may be templated
- domain coverage is not yet verified against active exam blueprints

The UI must visibly label this content as demo/seed practice content until the source-grounded pipeline is implemented.

Required UI copy or equivalent:

"Demo practice bank: These questions are seed content for testing the platform. They are not official certification-provider exam questions and are not yet fully source-grounded or reviewed."

## What is not yet built

- GitHub OAuth.
- GitHub write access.
- Private repository import.
- Live LLM calls.
- Production-scale Microsoft Learn ingestion.
- Cached embedding generation.
- Full admin review UI.
- Full replacement of the demo/seed question bank with approved source-grounded questions.
- Route-level code splitting for bundle-size reduction.

## Current approved programme

M5 Production Perfection followed by Phase 6 public beta delivery is approved by the user. M7 remains not approved.

## Current blockers

- Approved M5.1 Reliable Assessment Sessions are fixed in repo; M5.12 browser E2E and live Supabase recovery verification remain pending.
- Approved M5.2 Rich Assessment Item Types are fixed in repo through the Exam Walkthrough and shared rich item/scoring contracts; M5.12 browser E2E verification remains pending.
- Authorization/RLS foundation defects for reviewer publication, approved-serving integrity, caller-shaped audit fields, and imported-project ID collisions are fixed in-repo and statically retested, but live Supabase RLS verification remains pending.
- Google SSO is implemented in repo, but live Supabase Google provider setup and redirect allow-list verification remain pending for each deployed environment.
- Google SSO is feature-gated in the UI until live Supabase Google provider setup and redirect allow-list verification are complete.
- `/admin` review studio exists and is now route-protected in repo, but live role-specific browser verification remains pending.
- KQL Gym trust-copy and answer-reveal alignment is fixed in repo; broader learner browser verification remains pending.
- The current 600-question bank remains blocked from production trust until a full source-grounded Microsoft Learn pipeline, duplicate checks, and admin review approve enough replacement content.
- The M5 scaffold proves approved-only serving, validation, and role-gated review policy shape, but production-scale ingestion, real embeddings, real batch generation, automated critic execution, and admin review UI still need backend/admin implementation before launch.
- GitHub import is public-read-only. GitHub OAuth, write scopes, and private repo access remain blocked.
- GitHub import now has authenticated server-side durable rate/cache scaffolding in repo. Live Supabase migration and server env verification remain pending before production release.
- GitHub import quota RPC is atomic and service-role-scoped in repo; live Supabase RPC execution and denial tests remain pending.
- Project Intelligence analysis rows are user-scoped in repo; live two-user repository-isolation verification remains pending.
- Interview Studio active-session recovery is fixed in repo with local/cloud draft persistence, but browser refresh/resume coverage and live Supabase verification remain pending.
- Latest design/security reviews require remaining source-grounded production content, live Supabase/RLS verification, browser verification, Project Intelligence visual refinement, onboarding, live Admin operations, and production canonical deployment before sign-off.
- Public production smoke passed 20 public checks against `https://azure-quest-pwa.vercel.app` after the Vercel project rename; 6 dev-only signed-in harness checks skipped as intended outside localhost. Live Supabase/RLS, role-specific Admin, onboarding provider, and source-grounded content verification remain pending.
- LLM-backed project stories, embeddings, source ingestion, and generated questions remain blocked until server-side execution, rate limits, content-hash caching, budget caps or kill switches, and failure logging are fully implemented for the live backend path.
- Bundle size warning remains: Vite reports the main JS chunk is larger than 500 kB after minification. This is not a build failure, but future M6 work should consider route-level code splitting.
- First dev-server verification attempt on `127.0.0.1:5173` did not respond and was restarted on `localhost:5174`, where checks passed.
- Playwright browser, mobile, WebKit, axe, and visual gates exist and pass locally for the public auth/legal/status, anonymous routing, signed-in onboarding, and initial Admin role-boundary contracts. Broader repository import, Project Intelligence, Interview Studio, Assessment Shell, and results E2E coverage remains pending.
- Duplicate validation is strict for approved source-grounded fingerprints and duplicate keys. Seed/demo duplicate warnings remain non-blocking because the bank is still labelled demo/seed content.
