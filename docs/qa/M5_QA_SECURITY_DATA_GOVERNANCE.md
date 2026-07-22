# M5 QA Security, Data, And Governance

Date opened: 2026-07-22

Role: Senior QA Engineer - Security, Authorization, Data Integrity and Content Governance

## Current Decision

Status: `FAIL`

The baseline S1/S2 authorization defects have been fixed in-repo and statically retested, but M5 remains blocked until live Supabase RLS/application verification, admin route/API verification, and the remaining product S1/S2 defects are complete.

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
| MAIN_ADMIN | May approve/publish/override with audit where allowed. | In-repo migration hardening added; live verification pending. |
| CONTENT_REVIEWER | May edit/recommend/flag but may not publish. | In-repo migration now blocks approved publication; live verification pending. |
| SUPPORT_ADMIN | Support-only access, no editorial publication. | Needs final policy coverage. |
| USER | No admin/draft access. | Needs final admin route/API verification. |

## RLS Results

Baseline failed. Repository migration `0006_m5_authorization_hardening.sql` now separates review and publish authority, blocks reviewer publication, requires Main Admin for approved-question insertion, derives audit actor fields, and scopes imported project rows by user/content.

Live Supabase RLS application and direct database threat-case execution are still pending.

## Migration Results

Migrations exist and are versioned. Migration `0006_m5_authorization_hardening.sql` was added. Live Supabase application was not verified.

## Data-Isolation Results

Fixed in repo. Supabase upsert row IDs are now user/content scoped through `importedProjectRowId()`, and migration `0006` adds `(user_id, content_hash)` uniqueness.

## Defects Discovered

- M5-DEF-001
- M5-DEF-002
- M5-DEF-003
- M5-DEF-004

## Defects Retested

- `npm run validate:authorization` passed on 2026-07-22.
- `npm test -- src/lib/cloudSync.test.ts` passed on 2026-07-22.

## Remaining Risks

- Live Supabase RLS behavior unverified.
- Admin APIs/routes not implemented yet.
- Full direct database threat-case suite is not yet automated.

## Pass Or Fail

`FAIL`
