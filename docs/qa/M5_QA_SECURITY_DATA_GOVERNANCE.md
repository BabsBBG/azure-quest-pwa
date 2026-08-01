# M5 QA Security, Data, And Governance

Date updated: 2026-07-30

Role: Senior QA Engineer - Security, Authorization, Data Integrity and Content Governance

## Current Decision

Status: `FAIL - live security/data sign-off not granted`

The baseline S1/S2 authorization and governance defects are partially fixed in repo and covered by static validators/tests, but production security sign-off remains blocked until live owner bootstrap, authenticated auth flows, RLS, role-boundary, two-user isolation, and audit-integrity probes pass. M5 data structures now include assessment sessions, official source ingestion, graph relations, summaries, generation jobs, orchestration, critic gates, source impact, curated quizzes, finite runs, and quality reports.

## Authorization Matrix

| Role | M5 authority | Result |
| --- | --- | --- |
| MAIN_ADMIN | Publish, run generation, approve overrides, manage admin workflows. | Pass in migration/static validation; live RLS verification pending. |
| CONTENT_REVIEWER | Review drafts, critic output, source impact, summaries, queues. No publication. | Pass in migration/static validation; live RLS verification pending. |
| SUPPORT_ADMIN | Read support/quality queues without publication rights. | Pass in admin/migration scaffolds; live verification pending. |
| USER | Learner mode and report creation only. No admin publication. | Pass in route/data scaffolds; live verification pending. |

## Retested Defects

- M5-DEF-001 through M5-DEF-004: fixed in repo and `npm run validate:authorization` passed.
- M5-DEF-008: `/admin` route and separate layout validated.
- M5.4-M5.11 governance validators all passed.

## Commands

- `npm run validate:authorization`
- `npm run validate:source-ingestion`
- `npm run validate:knowledge-graph`
- `npm run validate:question-generation`
- `npm run validate:content-orchestration`
- `npm run validate:question-critic`
- `npm run validate:source-impact`
- `npm run validate:admin-review-studio`
- `npm run validate:curated-domain-quizzes`
- `npm run validate:finite-runs`
- `npm run validate:content-quality-reports`

## Remaining Risks

- Live Supabase RLS behavior was not executed against the target project in this local run.
- Production generation remains disabled until backend secrets, provider integration, and live controls are configured.

## Pass Or Fail

`FAIL - live security/data sign-off not granted`
