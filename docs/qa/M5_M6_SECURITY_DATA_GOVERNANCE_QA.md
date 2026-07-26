# M5/M6 Security, Data And Governance QA

Status: FAIL - live security/data sign-off not granted

Date: 2026-07-26

## Baseline Result

Static validators pass, but production security and data governance remain unverified.

## Blocking Issues

- Live Supabase migration application is not verified.
- Live RLS probes for MAIN_ADMIN, CONTENT_REVIEWER, SUPPORT_ADMIN, USER_A, and USER_B are not available.
- `/admin` is publicly routable without runtime role gating.
- GitHub import controls are not durable or authenticated-user scoped.
- Cloud export/delete workflows are missing.
- Support Admin boundaries are not consistently reflected in RLS for support-facing queues.
- Vercel has no configured Supabase environment variables in the baseline check.

## External Blockers

- Supabase CLI is not installed locally.
- Target Supabase project details and test-user setup are not available from this checkout.

## Sign-Off

Security/Data/Governance QA: FAIL
