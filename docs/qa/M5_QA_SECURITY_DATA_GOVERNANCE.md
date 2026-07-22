# M5 QA Security, Data, And Governance

Date opened: 2026-07-22

Role: Senior QA Engineer - Security, Authorization, Data Integrity and Content Governance

## Current Decision

Status: `FAIL`

M5 is blocked by open S1/S2 defects in `docs/qa/M5_DEFECT_LEDGER.md`.

## Test Inventory

- Static inspection of Supabase migrations.
- Static inspection of RLS policies and helper functions.
- Static inspection of source-grounded approved serving policies.
- Static inspection of imported-project ID generation and cloud sync.
- Baseline local validation suite run by main agent.

## Threat Cases Attempted

- Content reviewer direct publication path.
- Approved-question public serving with insufficient integrity constraints.
- Caller-shaped audit actor fields.
- Same public repo imported by more than one user.

## Authorization Matrix

| Role | Expected M5 authority | Baseline result |
| --- | --- | --- |
| MAIN_ADMIN | May approve/publish/override with audit where allowed. | Partially scaffolded; needs stricter function/policy separation. |
| CONTENT_REVIEWER | May edit/recommend/flag but may not publish. | Fails: publication-adjacent paths exist. |
| SUPPORT_ADMIN | Support-only access, no editorial publication. | Needs final policy coverage. |
| USER | No admin/draft access. | Needs final admin route/API verification. |

## RLS Results

Failing at baseline. Source-pipeline policies need stricter separation between review and publish authority.

## Migration Results

Migrations exist and are versioned. Live Supabase application was not verified. Additional migrations are required.

## Data-Isolation Results

Imported project rows can collide for users importing the same public repo because IDs are global content-hash derived.

## Defects Discovered

- M5-DEF-001
- M5-DEF-002
- M5-DEF-003
- M5-DEF-004

## Defects Retested

None yet.

## Remaining Risks

- Live Supabase RLS behavior unverified.
- Admin APIs/routes not implemented yet.
- Publication gate semantics not yet durable enough.

## Pass Or Fail

`FAIL`
