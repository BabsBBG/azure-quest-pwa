# KNOWN_BLOCKERS.md

## M5/M6 production-hardening blockers

The 2026-07-26 PraxisGrid Master Delivery Instruction reopened M5 for production hardening and approved Phase 6. The current production baseline is blocked by:

- Public `/admin` route is not runtime auth/role gated.
- Public app still supports logged-out demo practice.
- Vercel production env check reported no `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY`.
- Supabase CLI is not installed locally, so live migration/RLS validation is blocked from this checkout.
- Live Supabase test identities and role bootstrap are not configured/verified.
- Source-grounded certification content remains fixture/scaffold-backed and cannot replace the seed bank.
- GitHub import abuse controls are in-memory/IP-based instead of durable authenticated-user controls.
- Secondary assessment-like surfaces need the shared demo-bank trust notice and answer-reveal alignment.
- Admin Review Studio is static and not connected to protected live queues/mutations.
- Playwright, WebKit, mobile, accessibility, visual, production-smoke, migration, RLS, production-content, repository-isolation, and assessment-shell gates are missing.
- Current production Vercel identity remains `azure-quest-pwa`; canonical PraxisGrid URL migration remains pending.

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

- Production Vercel project/domain still uses the historical `azure-quest-pwa.vercel.app` name until a separate Vercel project/domain rename or alias migration is approved and completed.

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

M3 migrations exist for profiles, quiz attempts, interview sessions, question flags, imported projects, and source-pipeline tables.

Still blocked until applied in the target Supabase project:

- production cloud sync verification
- cross-device attempt history verification
- cross-device interview history verification
- production imported project sync verification

## GitHub blocker

Public GitHub import is approved and implemented for M4.

Still blocked:

- GitHub write scopes
- private repository import
- broad repository permissions
- GitHub OAuth beyond minimal future read-only needs
