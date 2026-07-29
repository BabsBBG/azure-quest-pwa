# M5/M6 Security, Data And Governance QA

Status: FAIL - live security/data sign-off not granted

Date: 2026-07-29

## Baseline Result

Static validators pass, umbrella migration/RLS/repository-isolation gates exist in repo, and the production Supabase project is now live with migrations applied. Production security and data governance sign-off remains blocked until live RLS, role, owner, audit, and two-user probes pass.

## Blocking Issues

- Live Supabase migration application is verified for migrations `0001` through `0025` against `praxisgrid-production`.
- Live RLS probes for MAIN_ADMIN, CONTENT_REVIEWER, SUPPORT_ADMIN, USER_A, and USER_B are not available.
- Live two-user Project Intelligence repository-isolation probes are not available.
- Vercel Production has encrypted `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values, but production authenticated browser verification remains pending.

## External Blockers

- `PRAXISGRID_OWNER_EMAIL` is not present, so the real owner cannot be bootstrapped as `MAIN_ADMIN`.
- Google OAuth client ID and client secret are not present, so live Google SSO remains disabled/unverified.
- Docker Desktop is unavailable, so hosted staging was used as the clean migration fallback.
- `https://praxisgrid.vercel.app` is not assigned to the connected Vercel account; auth uses `https://azure-quest-pwa.vercel.app` as the working fallback canonical URL.

## Sign-Off

Security/Data/Governance QA: FAIL
