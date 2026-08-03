# M5/M6 Principal Engineer Sign-Off

Status: FAIL - production sign-off not granted

Date: 2026-07-29

Basis: Baseline audit at commit `a12ba2c`, updated after live Supabase activation, focused production role/RLS verification, and the opt-in live Supabase QA harness.

## Findings

- M5 is reopened for production hardening.
- Phase 6 is approved but not complete.
- `/admin` is route-protected in repo, and focused live role-specific browser checks passed for USER denial and MAIN_ADMIN, CONTENT_REVIEWER, and SUPPORT_ADMIN access.
- Source-grounded content is scaffolded with fixtures and migrations, not live production ingestion/review/publication.
- Supabase migrations are applied through `0027`, remote/local history matches, and focused live RLS, role-boundary, audit-forgery, and two-user isolation probes pass for the covered M5 surfaces.
- GitHub import rate limiting and caching are durable in repo, and live Supabase quota verification now passes for service-role execution, daily-limit denial, and anon/authenticated denial.
- Focused production browser auth smoke passes for learner onboarding, normal-user Admin denial, seed-bank trust copy at desktop/mobile widths, and SUPPORT_ADMIN support-boundary UI.
- Browser, accessibility, visual, production-smoke, migration, RLS, production-content, and repository-isolation gates now exist in repo/CI. Public production smoke passed against `https://azure-quest-pwa.vercel.app`; opt-in live production scripts now cover Supabase auth, RLS, roles, and repository isolation but are not wired to public PR CI.

## Required Before PASS

- Close all S1/S2 defects in `docs/qa/M5_M6_DEFECT_LEDGER.md`.
- Complete broader cross-device sync and full product-workflow verification.
- Replace or gate demo/static content so it is not presented as trusted production content.
- Ship protected Admin operations with working mutations and audit records.
- Rotate the Supabase database password exposed by the local CLI dry-run output path.
- Pass the full required local, CI, browser, accessibility, visual, and production smoke suites.

## Sign-Off

Principal Engineer: FAIL
