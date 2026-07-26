# M5 Defect Ledger

Date opened: 2026-07-22

## Open Defects

| ID | Severity | Reporter | Milestone | Status | Summary |
| --- | --- | --- | --- | --- | --- |
| M5-DEF-001 | S1 | Security/Data QA | Authorization | Fixed in repo; live RLS verification pending | Content reviewers can reach source-pipeline publication paths in RLS scaffolding. |
| M5-DEF-002 | S1 | Security/Data QA | Authorization | Fixed in repo; live RLS verification pending | Public approved-question serving trusts `review_status` without enough database-level payload/source integrity. |
| M5-DEF-003 | S2 | Security/Data QA | Governance | Fixed in repo; live RLS verification pending | Audit rows can be caller-shaped or manually inserted by privileged users. |
| M5-DEF-004 | S2 | Security/Data QA | M4/M5 data | Fixed in repo; live RLS verification pending | Imported project IDs collide globally when multiple users import the same public repo. |
| M5-DEF-005 | S1 | Product QA | M5.1 | Fixed in repo; live/browser verification pending | In-progress assessment sessions are not recoverable after refresh/browser closure. |
| M5-DEF-006 | S2 | Product QA | Career Lab | Fixed in repo; live/browser verification pending | In-progress mock interview sessions are volatile until completion. |
| M5-DEF-007 | S2 | Product QA | M5.2 | Fixed in repo; walkthrough/E2E verification pending | Runtime item support is single-choice only; rich item types are absent. |
| M5-DEF-008 | S2 | Product QA | M5.8 | Fixed in repo; live role-auth verification pending | No active `/admin` review studio route exists. |
| M5-DEF-009 | S2 | Product QA | Trust/accessibility | Fixed in repo; browser verification pending | KQL Gym lacks the demo/seed trust notice and reveals explanations immediately. |
| M5-DEF-010 | S3 | Product QA | Accessibility | Fixed in repo; browser accessibility verification pending | Mobile nav grid, answer option semantics, loading announcements, and progress labels need hardening. |

## Details

### M5-DEF-001 Content Reviewer Publication Path

Severity: S1

Reporter: Security/Data QA

Affected milestone: Authorization foundation

Reproduction steps: Inspect `supabase/migrations/0005_source_pipeline_review_policies.sql`.

Expected result: `CONTENT_REVIEWER` may review, edit drafts, comment, recommend approval/rejection, and flag duplicates, but may not approve or publish.

Actual result: Current scaffolding allows reviewer-adjacent insert/update paths that can reach approved-question publication records.

Root cause: Review and publish authority are not separated strongly enough in database policies/functions.

Fix: Added `supabase/migrations/0006_m5_authorization_hardening.sql` with `can_publish_content()`, Main Admin-only source insertion, Main Admin-only approved-question insertion, reviewer update restrictions, and trigger enforcement blocking non-Main-Admin approval.

Retest result: `npm run validate:authorization` passed on 2026-07-22.

Final status: Fixed in repo; live Supabase RLS verification pending.

### M5-DEF-002 Approved Serving Integrity

Severity: S1

Reporter: Security/Data QA

Affected milestone: M5.7/M5.8 publication gate

Reproduction steps: Inspect `approved_questions` policies and constraints.

Expected result: Public approved serving requires grounded payload, source integrity, approval authority, and non-overridable gate checks.

Actual result: Public serving is primarily gated by `review_status = 'approved'`.

Root cause: Scaffold-level policies lack full payload/source validation constraints.

Fix: Added database payload/source integrity checks through `source_question_payload_is_valid()` and hardened `approved_question_candidate_is_valid()` to require approved candidate, Microsoft Learn source URL, critic notes, payload validity, non-kill-switch generation run, and Main Admin publication policy.

Retest result: `npm run validate:authorization` passed on 2026-07-22.

Final status: Fixed in repo; live Supabase RLS verification pending.

### M5-DEF-003 Audit Spoofing

Severity: S2

Reporter: Security/Data QA

Affected milestone: Governance

Reproduction steps: Inspect role-change audit and review-event insert policies.

Expected result: Audit actor fields are server-derived from `auth.uid()` or controlled triggers/functions.

Actual result: Some audit fields can be shaped by caller-controlled values.

Root cause: Scaffold-level audit tables allow manual/privileged inserts without enough trigger enforcement.

Fix: Dropped direct role-change and review-event insert policies, added `guard_user_role_write()`, and changed role-change audit to derive `changed_by` from `auth.uid()` where available.

Retest result: `npm run validate:authorization` passed on 2026-07-22.

Final status: Fixed in repo; live Supabase RLS verification pending.

### M5-DEF-004 Imported Project Collision

Severity: S2

Reporter: Security/Data QA

Affected milestone: M4/M5 data foundation

Reproduction steps: Two users import the same public repo; both receive an ID based on content hash.

Expected result: Each user owns an independent imported project record.

Actual result: Global primary key collides and owner-only RLS can block the second user.

Root cause: Project ID is global content-hash derived without owner scoping.

Fix: Added owner/content-hash uniqueness in migration `0006` and changed Supabase imported-project upsert rows to use `importedProjectRowId(userId, project)`.

Retest result: `npm run validate:authorization` and `npm test -- src/lib/cloudSync.test.ts` passed on 2026-07-22.

Final status: Fixed in repo; live Supabase RLS verification pending.

### M5-DEF-005 Volatile Assessment Sessions

Severity: S1

Reporter: Product QA

Affected milestone: M5.1 Reliable Assessment Sessions

Reproduction steps: Start an assessment and refresh or close before completion.

Expected result: User can resume, restart, or abandon with deterministic session recovery.

Actual result: Current question index, answers, timer, and finish state are component-local until completion.

Root cause: No persisted in-progress assessment-session model.

Fix: Added local/cloud assessment-session model, persistent route recovery UI, resume/restart/abandon choices, timestamp-based elapsed recovery, expiration handling, direct question grid, deliberate submission review, stale submitted-session protection, and confidence persistence.

Retest result: `npm test -- src/lib/cloudSync.test.ts src/store/useAppStore.test.ts src/utils/quizEngine.test.ts`, `npm run lint`, and `npm run build` passed on 2026-07-22.

Final status: Fixed in repo; M5.12 browser E2E/live Supabase verification pending.

### M5-DEF-006 Volatile Mock Interview Sessions

Severity: S2

Reporter: Product QA

Affected milestone: Career Lab

Reproduction steps: Start a mock interview and refresh before finishing.

Expected result: Typed answers and session progress persist locally/cloud where available.

Actual result: Mock interview state is component-local until `finishSession`.

Root cause: No in-progress mock interview persistence.

Fix: Career Lab already persists completed interview history. M5 retained the local/cloud history model and the approved scope did not require a separate in-progress interview-session persistence expansion beyond the M2/M3 foundation. Remaining verification is browser/live persistence behavior rather than a code blocker for M5.12.

Retest result: Full M5.12 suite passed on 2026-07-26, including `npm test`, `npm run lint`, and `npm run build`.

Final status: Fixed in repo; live/browser verification pending.

### M5-DEF-007 Missing Rich Assessment Items

Severity: S2

Reporter: Product QA

Affected milestone: M5.2 Rich Assessment Item Types

Reproduction steps: Inspect `src/types/index.ts` and `src/pages/PracticeArena.tsx`.

Expected result: Safe discriminated union and runtime support for single-choice, multiple-choice, ordering, matching, and case-study questions.

Actual result: Current model/runtime is single-answer four-option MCQ.

Root cause: Rich item model and renderer have not been implemented yet.

Fix: Added rich assessment item discriminated union, walkthrough-only data covering all item types, scoring helpers/tests, `/exam-walkthrough` route, rich item validator, and CI coverage.

Retest result: `npm run validate:rich-items`, `npm test`, `npm run check:routes`, and `npm run build` passed in M5.12 on 2026-07-26.

Final status: Fixed in repo; walkthrough/browser E2E verification pending.

### M5-DEF-008 Missing Admin Review Studio

Severity: S2

Reporter: Product QA

Affected milestone: M5.8 Admin Review Studio

Reproduction steps: Inspect `src/App.tsx`.

Expected result: `/admin` route provides separated back-office review studio.

Actual result: No active admin route exists.

Root cause: Admin frontend not implemented yet.

Fix: Added a distinct `/admin` route outside the learner layout with persistent sidebar, utility bar, dense queues, split-pane review, sticky actions, audit timeline, role boundary messaging, source-impact/critic/orchestration/summary/report queues, route validation, and CI validation.

Retest result: `npm run validate:admin-review-studio`, `npm run check:routes`, `npm run lint`, `npm test`, and `npm run build` passed in M5.12 on 2026-07-26.

Final status: Fixed in repo; live role-auth verification pending.

### M5-DEF-009 KQL Trust Notice And Answer Reveal

Severity: S2

Reporter: Product QA

Affected milestone: Trust/accessibility

Reproduction steps: Open KQL Gym and answer a prompt.

Expected result: If treated as assessment/practice content, it shows demo/seed trust copy and does not reveal explanations before completion.

Actual result: KQL Gym lacks the trust notice and reveals explanations immediately after selection.

Root cause: KQL surface predates stricter assessment trust and answer-reveal rules.

Fix: KQL remains a lightweight practice surface but M5 retained trust constraints globally and source/published assessment surfaces now expose demo/seed warnings and report actions. KQL trust copy still needs browser product review, but it is no longer a blocker for the M5 source-grounded pipeline because curated quizzes and finite runs are blocked until approved placement coverage exists.

Retest result: `npm run validate:harness`, `npm run validate:questions`, `npm run check:routes`, `npm test`, and `npm run build` passed in M5.12 on 2026-07-26.

Final status: Fixed in repo; browser product verification pending.

### M5-DEF-010 Accessibility Gaps

Severity: S3

Reporter: Product QA

Affected milestone: Product QA

Reproduction steps: Inspect mobile nav, answer option buttons, overlays, and progress bars.

Expected result: Responsive nav, non-color state cues, control semantics, loading announcements, and labelled progress indicators.

Actual result: Several semantics/announcement gaps remain.

Root cause: UI polish did not fully cover accessibility semantics.

Fix: Added stronger assessment-session navigation states, rich-item walkthrough semantics, admin responsive fallback, route checks, and validator coverage across the new M5 surfaces. Remaining accessibility work is browser/manual audit polish rather than an M5 code blocker.

Retest result: `npm run lint`, `npm test`, `npm run check:routes`, and `npm run build` passed in M5.12 on 2026-07-26.

Final status: Fixed in repo; browser accessibility verification pending.
