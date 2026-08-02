# KNOWN_BLOCKERS.md

## M5/M6 production-hardening blockers

The 2026-07-26 PraxisGrid Master Delivery Instruction reopened M5 for production hardening and approved Phase 6. The current production baseline is blocked by:

- Public `/admin` route is runtime auth/role gated in repo; live browser verification passed for USER denial and MAIN_ADMIN, CONTENT_REVIEWER, and SUPPORT_ADMIN access.
- Public learner routes are auth-gated and onboarding-gated in repo; live disposable auth and onboarding verification passed.
- Vercel Production now has encrypted `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values for `praxisgrid-production`; production redeploy, public unauthenticated smoke, and focused authenticated live auth verification pass.
- Supabase CLI authenticated successfully, `praxisgrid-production` exists in `eu-west-1`, and migrations `0001` through `0026` are applied with matching local/remote history.
- Live owner role bootstrap is configured and verified for `tobibabalola21@gmail.com` as `MAIN_ADMIN`; personal study account `tonybabalola@gmail.com` is verified as `USER`.
- Protected role/RLS probes ran from this shell using service-role access retrieved only in-process. Temporary QA identities and bounded QA records were cleaned up.
- Google SSO cannot be enabled live until real Google OAuth client ID and client secret values are supplied outside source control.
- Google SSO is now hidden in the browser unless `VITE_GOOGLE_AUTH_ENABLED=true`; enable that flag only after the Supabase Google provider is live-configured and tested.
- Source-grounded certification content remains fixture/scaffold-backed and cannot replace the seed bank.
- Production quiz/run CTAs are blocked when approved coverage is incomplete in repo, but live source ingestion, review, publication, and production serving remain pending.
- GitHub import abuse controls are durable and authenticated in repo; broader live RPC/quota denial verification remains pending.
- Project Intelligence analysis rows are user-scoped in repo; live two-user database isolation passed for imported projects and Project Intelligence analyses.
- Project Intelligence parent ownership is now hardened in repo and applied live by migration `0026_project_intelligence_owner_fk.sql`; live two-user database isolation passed for the owner FK path.
- Same-browser local learner data is partitioned by authenticated user ID in repo; database isolation is live-verified, while browser account-switching regression remains pending.
- Secondary assessment-like surfaces have shared demo-bank trust notice and answer-reveal alignment in repo; browser verification remains pending.
- Admin Review Studio is still not fully connected to protected live queues/mutations; support report queue boundaries are fixed in repo and focused live Supabase RLS/role verification passed.
- Playwright, WebKit, mobile, accessibility, visual, production-smoke, production-content, assessment-shell, destructive-action, migration, RLS, and repository-isolation static gates exist in repo and CI. Public production smoke passed against the current public alias; live Supabase migration application, focused live RLS, and two-user repository-isolation probes pass for the covered M5 surfaces.
- Connected Vercel project identity is now `praxisgrid`, and a fresh production deployment is READY. The canonical `https://praxisgrid.vercel.app` alias is not live yet; the historical `https://azure-quest-pwa.vercel.app` alias still serves public production.

Authoritative tracking now lives in `docs/qa/M5_M6_DEFECT_LEDGER.md`.

## M5 restored harness blockers

The approved M5 sequence is now:

- M5.0 Immediate corrections, PraxisGrid rebrand and governance foundations
- M5.1 Reliable Assessment Sessions
- M5.2 Rich Assessment Item Types
- M5.3 Confidence, Scoring and Adaptation
- M5.4 Official Source Ingestion
- M5.4A Certification Knowledge Graph
- M5.5 Official Learning Summaries
- M5.6 Controlled Question-Generation Factory
- M5.6A Graph-Based Content Orchestration
- M5.7 Automated Critic and Duplicate Prevention
- M5.7A Source Dependency and Impact Graph
- M5.8 Separate PraxisGrid Admin Review Studio
- M5.9 Curated Domain Quiz Structure
- M5.10 Finite Certification Runs
- M5.11 User Reporting and Content-Quality Feedback
- M5.12 Completion and Validation

Release blockers from the 2026-07-22 baseline audit:

- Content reviewers can reach publication paths in source-pipeline RLS scaffolding. Fixed in repo by migration `0006`; live Supabase RLS verification pending.
- Public approved-question serving trusts `review_status` without enough database-level integrity enforcement. Fixed in repo by migration `0006`; live Supabase RLS verification pending.
- Audit rows can be caller-shaped or manually inserted by privileged users. Fixed in repo by migration `0006`; live Supabase RLS verification pending.
- Imported project IDs collide globally when multiple users import the same public repo. Fixed in repo by migration `0006` and `importedProjectRowId()`; live Supabase RLS verification pending.
- In-progress assessment sessions are fixed in repo with local/cloud persistence and recovery choices; M5.12 browser E2E and live Supabase verification pending.
- Rich item type support is implemented in repo through walkthrough-only items and shared scoring contracts; production pool use remains blocked until source-grounded approved content, Admin publication, curated quiz placement, and Certification Run placement are complete.
- `/admin` review studio is implemented in repo; live role-auth verification remains pending.
- M5 final sign-off reports are PASS after local M5.12 validation on 2026-07-26; pushed GitHub Actions verification remains pending.

## Production question-bank blocker

The current static question bank is not production-trusted.

Known blocker:

- The bank may contain repeated questions, repeated patterns, and weak explanations.
- The bank is not yet source-grounded.
- The bank must not be presented as official-quality practice content.

Blocked until:

- source-grounded Microsoft Learn ingestion exists
- generated questions trace to source chunks
- duplicate checks pass
- human/admin review approves questions

## M1.5 UI question-bank warning blocker

M0/M1/M1.5 completion is blocked unless the UI visibly labels the current question bank as demo/seed content.

Required copy or equivalent:

"Demo practice bank: These questions are seed content for testing the platform. They are not official certification-provider exam questions and are not yet fully source-grounded or reviewed."

## M5.0 production URL rebrand blocker

The GitHub repository has been renamed to `BabsBBG/praxisgrid`, and product surfaces now use PraxisGrid.

Still blocked/deferred:

- Production Vercel project is renamed to `praxisgrid`, but the public production domain still uses the historical `azure-quest-pwa.vercel.app` alias until a canonical PraxisGrid domain is assigned.
- Supabase owner password-reset email was sent after cooldown; owner must complete the reset link to replace the temporary bootstrap password.
- Supabase database password rotation is required because the CLI `db dump --dry-run` printed a database password in local tool output.

## Cost-control blocker

Before M4/M5 can launch at production scale, complete backend cost controls must exist.

The current M4 implementation includes public-read-only import, no write scopes, local/server import caps, and content-hash caching. The current M5 implementation includes static approved-only serving, structured validation, role-gated review policy scaffolding, and review-event audit tables.

Still blocked for production-scale live generation:

- GitHub repo import at scale
- project story generation
- Microsoft Learn ingestion
- embeddings
- question generation
- automated critic pass

Required before launch:

- per-user import limits
- per-user generation limits
- admin batch caps
- content-hash caching
- server-side-only LLM calls
- kill switch
- failure logging

Any feature that calls an LLM, imports GitHub repositories, generates questions, creates project stories, embeds content, or processes Microsoft Learn source material must include rate limits, content-hash caching, server-side secret handling, a budget cap or kill switch, and failure logging before it is considered complete.

## Supabase application blocker

Migrations `0001` through `0025` are applied to `praxisgrid-production`, and Vercel Production has the browser-safe Supabase project URL and publishable key.

Still blocked until broader live authenticated QA coverage is automated and the remaining external auth constraints are cleared:

- production cloud sync verification beyond the focused database probes
- cross-device attempt history verification
- cross-device interview history verification
- production imported project sync verification through the full UI
- live browser account-switching verification
- owner self-service password reset completion after the sent reset email is used

## GitHub blocker

Public GitHub import is approved and implemented for M4.

Still blocked:

- GitHub write scopes
- private repository import
- broad repository permissions
- GitHub OAuth beyond minimal future read-only needs
