# MILESTONES.md

## Harness State

Product: PraxisGrid

Active phase: M5

Current permitted work: M5.0 through M5.12

M6: NOT APPROVED

## Current Status

M5 is in progress. The previous repository state mislabelled source-pipeline contract work as M5.1 and duplicate-gate work as M5.2. Those implementations are preserved as useful foundations, but the approved M5 sequence below is now the source of truth.

M5 cannot be marked complete until:

- M5.0 through M5.12 are implemented.
- Principal engineering review passes.
- Security/data/governance QA passes.
- Product/regression/accessibility QA passes.
- Required validation commands pass.
- No unresolved S1/S2 defects remain.

## M5.0 Immediate Corrections, PraxisGrid Rebrand, And Governance Foundations

Status: in progress.

Completed foundations:

- Rename product to PraxisGrid.
- Use tagline: Learn it. Practise it. Prove it.
- Use provider-neutral certification disclaimers.
- Preserve legacy Azure Quest local storage through migration fallback.
- Rename GitHub repo to `BabsBBG/praxisgrid`.
- Remove founder-specific project fixtures from the Career Lab.
- Mark AZ-500 as RETIRING on 2026-08-31, preserve history, and recommend SC-500 for new activation.
- Add role foundations for MAIN_ADMIN, CONTENT_REVIEWER, SUPPORT_ADMIN, and USER.
- Keep demo/seed question-bank warnings visible until approved source-grounded replacement content is broad enough.

Open M5.0 work:

- Correct authorization defects in role/RLS/publication policy foundations.
- Harden audit actor derivation and imported-project owner scoping.
- Confirm provider-neutral metadata and hard-coded naming after M5 harness repair.

## M5.1 Reliable Assessment Sessions

Status: complete in repo; M5.12 E2E/live verification pending.

Implemented:

- Persistent assessment-session model with ACTIVE, PAUSED, SUBMITTED, EXPIRED, and ABANDONED states.
- Local-first save, authenticated cloud sync where available, expiration normalization, latest-session merge, stale submission protection, and recovery choices.
- Accessible question navigation grid with current/unseen/answered/unanswered/marked/answered-and-marked/low-confidence states.
- Mark for review, unanswered filter, low-confidence filter, timestamp-based timing, expiration handling, and deliberate submission review.

## M5.2 Rich Assessment Item Types

Status: complete in repo; M5.12 E2E verification pending.

Implemented:

- Safe discriminated union for SINGLE_CHOICE, MULTIPLE_CHOICE, ORDERING, MATCHING, and CASE_STUDY_QUESTION.
- Runtime renderer, answer capture, scoring, accessibility, and restoration for each item type.
- Exam Walkthrough that demonstrates all supported item types and never enters the certification assessment pool.

## M5.3 Confidence, Scoring, And Adaptation

Status: complete in repo; M5.12 E2E verification pending.

Implemented:

- Confidence ratings: GUESSING, UNSURE, FAIRLY_CONFIDENT, CERTAIN.
- Deterministic PraxisGrid simulated score on a 1-1000 scale with clear non-provider-equivalence disclaimer.
- Adaptive practice rules for daily/targeted/correction/review/personalized paths without altering standard certification runs.

## M5.4 Official Source Ingestion

Status: complete in repo; external production activation pending.

Completed foundations:

- Static Microsoft Learn sample source docs and source chunks exist.
- Source-grounded sample records include source URLs, chunks, critic notes, generation controls, and validation.

Implemented:

- Provider-neutral source registry.
- Server-side retrieval adapter, deterministic fixture adapter, content hashing, source versions, idempotent jobs, bounded retries, failure logging, freshness/change/removal detection, blueprint/domain/objective extraction, and source-section mapping.
- Knowledge Unit extraction from official-source material.

## M5.4A Certification Knowledge Graph

Status: complete in repo; live Supabase verification pending in M5.12.

Implemented:

- PostgreSQL/Supabase relationship tables connecting Provider, Certification, Certification Version, Domain, Objective, Knowledge Unit, Source Document, Learning Summary, Assessment Item, Domain Quiz placement, and Certification Run placement.
- Typed relation kinds, evidence, confidence, review state, useful indexes, integrity tests, traversal tests, and RLS where user-specific data exists.
- Local typed graph model, traversal helpers, validator, CI hook, and report.

## M5.5 Official Learning Summaries

Status: complete in repo; live Supabase verification pending in M5.12.

Implemented:

- Source-grounded draft learning workspaces for certification domains.
- Domain overview, learning sequence, terminology, configuration steps, decision rules, mistakes, examples, source links, blueprint version, and review status.
- Main Admin approval and immutable published versions.
- Learner-facing approved summaries on certification learning pages, validator, CI hook, and report.

## M5.6 Controlled Question-Generation Factory

Status: complete in repo; production provider activation disabled.

Completed foundations:

- Generation run scaffolding has admin-only flags, budget caps, batch limits, kill-switch examples, and failure logs.

Implemented:

- Server-side provider interface, deterministic test generator, coverage matrix, generation jobs, draft metadata, batch/rate/cost/retry controls, cancellation, idempotency, quarantine, and disabled-by-default production behavior until configured.
- Supabase tables, RLS, validator, CI hook, and report.

## M5.6A Graph-Based Content Orchestration

Status: complete in repo; live workflow execution verification pending in M5.12.

Implemented:

- Typed workflow nodes for coverage planning, source resolution, question generation, grounding verification, ambiguity/distractor critics, duplicate detection, difficulty estimation, and admin handoff.
- Durable workflow state, retries, failure reasons, cost, duration, and events.
- No workflow may publish automatically.
- Supabase tables, RLS, validator, CI hook, and report.

## M5.7 Automated Critic And Duplicate Prevention

Status: complete in repo; live RLS/admin override verification pending in M5.12.

Completed foundations:

- `src/utils/questionQuality.ts` has duplicate normalization/fingerprints.
- `scripts/validate-duplicates.mjs` checks seed/demo fingerprints and approved source-grounded duplicates.
- Approved source-grounded helper refuses duplicate approved records.

Implemented:

- Critic checks for source support, answer uniqueness, distractor plausibility, ambiguity, hidden assumptions, objective alignment, difficulty, freshness, item-type validity, accessibility, wording leakage, semantic similarity, unsupported claims, and scenario consistency.
- Draft gating before Admin review.
- Non-overridable integrity failures and audited Main Admin override path for allowed warnings.
- Supabase critic reports/findings/overrides, validation script, CI hook, and report.

## M5.7A Source Dependency And Impact Graph

Status: complete in repo; live source-version processing pending in M5.12.

Implemented:

- Dependency chain from source document through Knowledge Units, summaries, assessment items, Domain Quiz placements, and Certification Run placements.
- Source version diffs, affected-content traversal, risk states, targeted replacement jobs, and Main Admin review.
- Supabase diff/impact/replacement tables, validation script, CI hook, and report.

## M5.8 Separate PraxisGrid Admin Review Studio

Status: complete in repo; live role-auth verification pending in M5.12.

Implemented:

- Distinct `/admin` back-office interface, separate from learner layout.
- Persistent sidebar, utility bar, dense tables, filters, queues, split-pane review, sticky actions, audit timelines, revision history, warning banners, keyboard-friendly workflows, and responsive fallback.
- Role-protected Main Admin, Content Reviewer, Support Admin, and User access boundaries.
- Admin scaffold connected to content orchestration, critic reports, source impact, summaries, route/CI validation, and report.

## M5.9 Curated Domain Quiz Structure

Status: complete in repo; publication blocked until approved item coverage is sufficient.

Implemented:

- Per-domain curated quizzes: Foundations, Configuration, Scenarios, Troubleshooting, Domain Challenge.
- Explicit quiz definitions and item placements using only Main Admin-approved published items.
- Unlock and timing rules.
- Missing approved placement tracking, blocked publication status, Supabase publication guard, validation script, CI hook, and report.

## M5.10 Finite Certification Runs

Status: complete in repo; publication blocked until approved item coverage is sufficient.

Implemented:

- Versioned Baseline, Applied, Pressure, Final, and Personalized runs.
- Explicit run definitions, distribution rules, publication state, effective dates, and Main Admin publication.
- Missing approved placement tracking, Supabase publication guard, validation script, CI hook, and report.

## M5.11 User Reporting And Content-Quality Feedback

Status: complete in repo; live persistence verification pending in M5.12.

Implemented:

- Report a problem workflow for every published assessment item.
- Stored item/version/source/attempt context, reason, optional comment, status, and Admin quality queue.
- Reports never auto-edit, remove, replace, or publish content.
- Supabase report/event tables, no-auto-mutation guard, Assessment Center action, Admin Review Studio queue, validation script, CI hook, and report.

## M5.12 Completion And Validation

Status: complete in repo; pushed CI verification pending.

Completed:

- Complete command suite and any additional scripts needed for typecheck, integration, E2E, migration, RLS, route, accessibility, and content-pipeline validation.
- Final M5 completion report.
- Principal Engineer PASS.
- Security/Data/Governance QA PASS.
- Product/Regression/Accessibility QA PASS.

## Not Approved

- M6.
- GitHub write permissions.
- Private repository import.
- Client-side LLM calls or frontend LLM API keys.
- Live LLM question generation during attempts.
- Production replacement of the static question bank before approved source-grounded content is broad enough.
- Payments.
- Native mobile apps.
- Voice/audio grading.
- Community-submitted questions.
