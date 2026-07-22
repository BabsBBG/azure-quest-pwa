# M5 Defect Ledger

Date opened: 2026-07-22

## Open Defects

| ID | Severity | Reporter | Milestone | Status | Summary |
| --- | --- | --- | --- | --- | --- |
| M5-DEF-001 | S1 | Security/Data QA | Authorization | Open | Content reviewers can reach source-pipeline publication paths in RLS scaffolding. |
| M5-DEF-002 | S1 | Security/Data QA | Authorization | Open | Public approved-question serving trusts `review_status` without enough database-level payload/source integrity. |
| M5-DEF-003 | S2 | Security/Data QA | Governance | Open | Audit rows can be caller-shaped or manually inserted by privileged users. |
| M5-DEF-004 | S2 | Security/Data QA | M4/M5 data | Open | Imported project IDs collide globally when multiple users import the same public repo. |
| M5-DEF-005 | S1 | Product QA | M5.1 | Open | In-progress assessment sessions are not recoverable after refresh/browser closure. |
| M5-DEF-006 | S2 | Product QA | Career Lab | Open | In-progress mock interview sessions are volatile until completion. |
| M5-DEF-007 | S2 | Product QA | M5.2 | Open | Runtime item support is single-choice only; rich item types are absent. |
| M5-DEF-008 | S2 | Product QA | M5.8 | Open | No active `/admin` review studio route exists. |
| M5-DEF-009 | S2 | Product QA | Trust/accessibility | Open | KQL Gym lacks the demo/seed trust notice and reveals explanations immediately. |
| M5-DEF-010 | S3 | Product QA | Accessibility | Open | Mobile nav grid, answer option semantics, loading announcements, and progress labels need hardening. |

## Details

### M5-DEF-001 Content Reviewer Publication Path

Severity: S1

Reporter: Security/Data QA

Affected milestone: Authorization foundation

Reproduction steps: Inspect `supabase/migrations/0005_source_pipeline_review_policies.sql`.

Expected result: `CONTENT_REVIEWER` may review, edit drafts, comment, recommend approval/rejection, and flag duplicates, but may not approve or publish.

Actual result: Current scaffolding allows reviewer-adjacent insert/update paths that can reach approved-question publication records.

Root cause: Review and publish authority are not separated strongly enough in database policies/functions.

Fix: Pending.

Retest result: Pending.

Final status: Open.

### M5-DEF-002 Approved Serving Integrity

Severity: S1

Reporter: Security/Data QA

Affected milestone: M5.7/M5.8 publication gate

Reproduction steps: Inspect `approved_questions` policies and constraints.

Expected result: Public approved serving requires grounded payload, source integrity, approval authority, and non-overridable gate checks.

Actual result: Public serving is primarily gated by `review_status = 'approved'`.

Root cause: Scaffold-level policies lack full payload/source validation constraints.

Fix: Pending.

Retest result: Pending.

Final status: Open.

### M5-DEF-003 Audit Spoofing

Severity: S2

Reporter: Security/Data QA

Affected milestone: Governance

Reproduction steps: Inspect role-change audit and review-event insert policies.

Expected result: Audit actor fields are server-derived from `auth.uid()` or controlled triggers/functions.

Actual result: Some audit fields can be shaped by caller-controlled values.

Root cause: Scaffold-level audit tables allow manual/privileged inserts without enough trigger enforcement.

Fix: Pending.

Retest result: Pending.

Final status: Open.

### M5-DEF-004 Imported Project Collision

Severity: S2

Reporter: Security/Data QA

Affected milestone: M4/M5 data foundation

Reproduction steps: Two users import the same public repo; both receive an ID based on content hash.

Expected result: Each user owns an independent imported project record.

Actual result: Global primary key collides and owner-only RLS can block the second user.

Root cause: Project ID is global content-hash derived without owner scoping.

Fix: Pending.

Retest result: Pending.

Final status: Open.

### M5-DEF-005 Volatile Assessment Sessions

Severity: S1

Reporter: Product QA

Affected milestone: M5.1 Reliable Assessment Sessions

Reproduction steps: Start an assessment and refresh or close before completion.

Expected result: User can resume, restart, or abandon with deterministic session recovery.

Actual result: Current question index, answers, timer, and finish state are component-local until completion.

Root cause: No persisted in-progress assessment-session model.

Fix: Pending.

Retest result: Pending.

Final status: Open.

### M5-DEF-006 Volatile Mock Interview Sessions

Severity: S2

Reporter: Product QA

Affected milestone: Career Lab

Reproduction steps: Start a mock interview and refresh before finishing.

Expected result: Typed answers and session progress persist locally/cloud where available.

Actual result: Mock interview state is component-local until `finishSession`.

Root cause: No in-progress mock interview persistence.

Fix: Pending.

Retest result: Pending.

Final status: Open.

### M5-DEF-007 Missing Rich Assessment Items

Severity: S2

Reporter: Product QA

Affected milestone: M5.2 Rich Assessment Item Types

Reproduction steps: Inspect `src/types/index.ts` and `src/pages/PracticeArena.tsx`.

Expected result: Safe discriminated union and runtime support for single-choice, multiple-choice, ordering, matching, and case-study questions.

Actual result: Current model/runtime is single-answer four-option MCQ.

Root cause: Rich item model and renderer have not been implemented yet.

Fix: Pending.

Retest result: Pending.

Final status: Open.

### M5-DEF-008 Missing Admin Review Studio

Severity: S2

Reporter: Product QA

Affected milestone: M5.8 Admin Review Studio

Reproduction steps: Inspect `src/App.tsx`.

Expected result: `/admin` route provides separated back-office review studio.

Actual result: No active admin route exists.

Root cause: Admin frontend not implemented yet.

Fix: Pending.

Retest result: Pending.

Final status: Open.

### M5-DEF-009 KQL Trust Notice And Answer Reveal

Severity: S2

Reporter: Product QA

Affected milestone: Trust/accessibility

Reproduction steps: Open KQL Gym and answer a prompt.

Expected result: If treated as assessment/practice content, it shows demo/seed trust copy and does not reveal explanations before completion.

Actual result: KQL Gym lacks the trust notice and reveals explanations immediately after selection.

Root cause: KQL surface predates stricter assessment trust and answer-reveal rules.

Fix: Pending.

Retest result: Pending.

Final status: Open.

### M5-DEF-010 Accessibility Gaps

Severity: S3

Reporter: Product QA

Affected milestone: Product QA

Reproduction steps: Inspect mobile nav, answer option buttons, overlays, and progress bars.

Expected result: Responsive nav, non-color state cues, control semantics, loading announcements, and labelled progress indicators.

Actual result: Several semantics/announcement gaps remain.

Root cause: UI polish did not fully cover accessibility semantics.

Fix: Pending.

Retest result: Pending.

Final status: Open.
