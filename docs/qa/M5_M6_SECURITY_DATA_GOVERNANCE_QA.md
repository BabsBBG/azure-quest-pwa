# M5/M6 Security, Data And Governance QA

Status: FOCUSED PASS WITH EXCEPTIONS - final security/data sign-off not granted

Date: 2026-08-03

## Baseline Result

Static validators pass, umbrella migration/RLS/repository-isolation gates exist in repo, and the production Supabase project is live with migrations applied. Focused live security and data governance probes now pass for owner bootstrap, email auth, role boundaries, admin route access, user-owned RLS, two-user isolation, repository isolation, role-change audit forgery denial, and GitHub import quota boundaries across the covered M5 tables.

## Blocking Issues

- Live Supabase migration application is verified for migrations `0001` through `0027` against `praxisgrid-production`.
- Live RLS probes passed for MAIN_ADMIN, CONTENT_REVIEWER, SUPPORT_ADMIN, USER_A, and USER_B over the covered M5 tables.
- Live two-user Project Intelligence repository-isolation probes passed.
- Vercel Production has encrypted `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values, and focused production authenticated browser verification passed.
- Opt-in live production scripts now exist for Supabase auth, RLS, roles, repository isolation, and GitHub import quota boundaries. `npm run validate:live-supabase` passed against the exact production project guard and cleaned up all temporary users.
- Final sign-off remains blocked by database password rotation after local CLI dry-run exposure, owner completion of the sent reset email, absent Google OAuth credentials, absent canonical `praxisgrid.vercel.app` alias, and broader privileged-mutation automation.

## External Blockers

- Google OAuth client ID and client secret are not present, so live Google SSO remains disabled/unverified.
- Supabase owner password-reset email has been sent; owner completion remains pending.
- Supabase database password must be rotated outside source control after a CLI dry-run printed it in local output.
- Docker Desktop is unavailable, so hosted staging was used as the clean migration fallback.
- `https://praxisgrid.vercel.app` is not assigned to the connected Vercel account; auth uses `https://azure-quest-pwa.vercel.app` as the working fallback canonical URL.

## Sign-Off

Security/Data/Governance QA: FOCUSED PASS WITH EXCEPTIONS
