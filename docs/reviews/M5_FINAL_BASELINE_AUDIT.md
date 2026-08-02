# M5 Final Baseline Audit

Date: 2026-08-01

Branch: `codex/finish-m5-production`

Decision: `FAIL - M5 production sign-off not granted`

## Complete And Live-Verified

- Supabase organisation selected: `BabsBBG's Org`.
- Production project exists: `praxisgrid-production`, ref `ozf...agfd`, region `eu-west-1`.
- Production migrations `0001` through `0026` are applied and local/remote history matches.
- Vercel Production has encrypted browser-safe `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Public fallback production URL exists: `https://azure-quest-pwa.vercel.app`.

## Complete In Repository Or Static Validation

- Explicit disabled button colors replace opacity-disabled auth buttons.
- Pull-request production smoke now reports `PRODUCTION_SMOKE_STATUS=SKIPPED_PULL_REQUEST` because it cannot verify unmerged branch code through the production alias.
- Auth actions return typed success/failure results, preventing false signup/reset success notices.
- Password reset links target `/auth?mode=update-password`, and the auth page exposes a new-password form for recovery sessions.
- Google sign-in is hidden unless `VITE_GOOGLE_AUTH_ENABLED=true`.
- Onboarding remains on the page when metadata/profile persistence fails and exposes errors with `role="alert"`.
- Project Intelligence parent ownership is hardened by additive migration `0026_project_intelligence_owner_fk.sql`, now applied live.
- Local persisted learner data is partitioned by authenticated user ID in repo; anonymous legacy migration remains isolated from signed-in partitions.
- Static checks passed for migrations, RLS, repository isolation, auth redirects, production-smoke gate, and focused auth tests.

## Missing Or Broken For M5 Sign-Off

- Live owner bootstrap as `MAIN_ADMIN` is not verified.
- Live email signup, sign-in, logout, password reset, and session refresh are not verified.
- Live two-user RLS isolation is not verified.
- Live role-boundary checks for USER, CONTENT_REVIEWER, SUPPORT_ADMIN, and MAIN_ADMIN are not verified.
- Live audit-integrity checks are not verified.
- Admin Review Studio remains partly scaffold/static and must be connected to protected Supabase queues and audited mutations before PASS.
- Production source-grounded content is not serving as the trusted learner bank; seed/demo warnings must remain.
- Primary assessment runtime still needs full rich-item integration beyond the walkthrough/demo contract.
- Live signed-in account-switching browser verification for local persistence partitions is not verified.

## External Blockers

- `PRAXISGRID_OWNER_EMAIL` is missing, so the real owner cannot be resolved or bootstrapped.
- `SUPABASE_SERVICE_ROLE_KEY` is missing from the shell, so protected live QA identities and server-side role setup cannot run.
- Google OAuth client ID and client secret are missing, so Google SSO must remain hidden/disabled.
- SMTP credentials are missing; built-in Supabase email may be used only for controlled verification once live QA identities are available.
- `https://praxisgrid.vercel.app` is unavailable to the connected Vercel account; the public fallback remains `https://azure-quest-pwa.vercel.app`.

## Latest Local Commands

- PR #6 CI: PASS.
- Merged `main` CI run `30766968811`: PASS.
- Production deployment `dpl_3FK5MjhS14Kbo5VdqA8HsTPE3nZC`: READY.
- `PRODUCTION_BASE_URL=https://azure-quest-pwa.vercel.app npm run test:production-smoke`: PASS, 20 public checks and 10 expected signed-in skips.
- `npm run typecheck`: PASS.
- `npm run validate:auth-redirects`: PASS.
- `npm run validate:production-smoke-gate`: PASS.
- `npm test -- src/pages/Account.test.tsx src/hooks/useAuth.test.tsx`: PASS.
- `npm run validate:migrations`: PASS.
- `npm run validate:rls`: PASS.
- `npm run validate:repository-isolation`: PASS.
- `npm run validate:local-user-isolation`: PASS.
- `npm test -- src/store/useAppStore.test.ts`: PASS.
- `npm run lint`: PASS.
- `npm test`: PASS, 26 files and 74 tests.
- `npm run build`: PASS with the existing large chunk warning.
- `npm run test:e2e:chromium`: PASS, 15/15.
- `npm run test:e2e:webkit`: PASS, 15/15.
- `CI=true npm run test:e2e:webkit`: PASS, 15/15 after serializing Playwright workers for CI stability.
- `npm run test:e2e:mobile`: PASS, 30/30 after rerun with a longer local timeout.
- `npm run test:accessibility`: PASS, 36/36.
- `npm run test:visual`: PASS, 6/6.

## Next Work

1. When owner/service-role secrets are supplied, bootstrap owner and run live auth/RLS/role/audit/two-user production probes.
2. Continue remaining M5 implementation gaps: live Admin operations, trusted source-grounded content serving, rich assessment runtime, and live signed-in local partition browser verification.
3. Begin approved M6 only after M5 production hardening receives PASS.
