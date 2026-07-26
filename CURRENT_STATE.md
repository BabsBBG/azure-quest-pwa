# CURRENT_STATE.md

## Current status

The app currently exists as a frontend-first PWA in `BabsBBG/praxisgrid`.

Harness state:

- Product: PraxisGrid.
- Active phase: M5.
- Current permitted work: M5.0 through M5.12.
- M6: NOT APPROVED.
- The approved milestone sequence was restored on 2026-07-22. Previous source-pipeline contract and duplicate-gate work is preserved as foundation work under M5.4/M5.6/M5.7, not as completion of approved M5.1/M5.2.
- M5 final sign-off is currently FAIL because baseline principal engineering and QA audits found open S1/S2 defects recorded in `docs/qa/M5_DEFECT_LEDGER.md`.
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

M5.0 rebrand status:

- Product name is now PraxisGrid.
- Tagline is "Learn it. Practise it. Prove it."
- GitHub repo was renamed from `BabsBBG/azure-quest-pwa` to `BabsBBG/praxisgrid`.
- Local `origin` now points to `https://github.com/BabsBBG/praxisgrid.git`.
- PWA metadata, package name, layout header, nav, account copy, footer disclaimer, and core assessment notices use PraxisGrid/provider-neutral language.
- localForage now writes to the `PraxisGrid` namespace with `praxisgrid:*` keys while preserving read/copy fallback from the old `AzureQuest` and `azure-quest:*` storage.
- AZ-500 is marked RETIRING with retirement date 2026-08-31. New activation routes users toward SC-500 while preserving historical progress and attempts.
- Role foundation migration adds MAIN_ADMIN, CONTENT_REVIEWER, SUPPORT_ADMIN, and USER with RLS and role-change audit tables.
- Founder-specific sample project data was removed from Career Lab fixtures and replaced with fictional instructional examples.
- The production Vercel URL currently remains `https://azure-quest-pwa.vercel.app`; Vercel project/domain rebrand is a known remaining deployment task and was not completed in M5.0.
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
- Supabase Auth account foundation.

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
- M1.6 adds Supabase email/password account foundation using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Account/Profile UI supports logged-out state, sign up, sign in, sign out, profile name update, loading states, and auth errors.
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

## Current approved milestone

M5 continuation - M5.0 through M5.12 approved by the user. M6 remains not approved.

## Current blockers

- Approved M5.1 Reliable Assessment Sessions are fixed in repo; M5.12 browser E2E and live Supabase recovery verification remain pending.
- Approved M5.2 Rich Assessment Item Types are fixed in repo through the Exam Walkthrough and shared rich item/scoring contracts; M5.12 browser E2E verification remains pending.
- Authorization/RLS foundation defects for reviewer publication, approved-serving integrity, caller-shaped audit fields, and imported-project ID collisions are fixed in-repo and statically retested, but live Supabase RLS verification remains pending.
- `/admin` review studio is not implemented yet.
- KQL Gym needs trust-copy and answer-reveal alignment if it remains an assessment/practice surface.
- The current 600-question bank remains blocked from production trust until a full source-grounded Microsoft Learn pipeline, duplicate checks, and admin review approve enough replacement content.
- The M5 scaffold proves approved-only serving, validation, and role-gated review policy shape, but production-scale ingestion, real embeddings, real batch generation, automated critic execution, and admin review UI still need backend/admin implementation before launch.
- GitHub import is public-read-only. GitHub OAuth, write scopes, and private repo access remain blocked.
- LLM-backed project stories, embeddings, source ingestion, and generated questions remain blocked until server-side execution, rate limits, content-hash caching, budget caps or kill switches, and failure logging are fully implemented for the live backend path.
- Bundle size warning remains: Vite reports the main JS chunk is larger than 500 kB after minification. This is not a build failure, but future M6 work should consider route-level code splitting.
- First dev-server verification attempt on `127.0.0.1:5173` did not respond and was restarted on `localhost:5174`, where checks passed.
- Automated M1 E2E tests are still missing.
- Duplicate validation is strict for approved source-grounded fingerprints and duplicate keys. Seed/demo duplicate warnings remain non-blocking because the bank is still labelled demo/seed content.
