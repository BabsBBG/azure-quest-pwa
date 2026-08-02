# Live Supabase Activation Report

Date: 2026-07-29

Latest update: 2026-08-03 on `main` after PR #8 and live role/RLS verification.

## Starting State

- Product: PraxisGrid.
- Programme: reopened M5 Production Perfection, followed by approved M6.
- Branch: `codex/live-supabase-activation`.
- GitHub remote: `https://github.com/BabsBBG/praxisgrid.git`.
- Connected Vercel project: `tonybabalola-1114s-projects/praxisgrid`.
- Public production fallback URL: `https://azure-quest-pwa.vercel.app`.
- Preferred canonical URL `https://praxisgrid.vercel.app`: externally blocked; not assigned to the connected Vercel account.

## Supabase Organisation And Project

- Organisation selected: `BabsBBG's Org`.
- Organisation ID: `qgeamzbqbmsxqvvoluxk`.
- Production project created: `praxisgrid-production`.
- Production project ref: `ozf...agfd`.
- Region: `eu-west-1`.
- Created at: `2026-07-29T16:46:47.265022Z`.
- Readiness state: `ACTIVE_HEALTHY`.
- Browser key configured for Vercel: Supabase publishable key.
- Service-role key: not committed and not configured in Vercel browser env.

## Migration Verification

- Repository migrations present: 26.
- Static migration validation: PASS.
- Static RLS validation: PASS.
- Static authorization validation: PASS.
- Static repository-isolation validation: PASS.
- Static local user-isolation validation: PASS.
- Static GitHub import controls validation: PASS.
- Static Project Intelligence validation: PASS.
- Static privacy workflow validation: PASS.
- Hosted staging fallback: the pre-existing empty default project was used because Docker is unavailable in this environment.
- Staging dry run: PASS, exactly migrations `0001` through `0025`.
- Staging apply: PASS, migrations `0001` through `0025`.
- Production dry run: PASS, exactly migrations `0001` through `0025` before the latest M5 hardening slice.
- Production apply: PASS, migrations `0001` through `0025` before the latest M5 hardening slice.
- Production migration history: PASS, local and remote histories match for `0001` through `0026`.
- Latest repository migration `0026_project_intelligence_owner_fk.sql`: dry run PASS and production apply PASS.
- Docker local reset: externally unavailable in this environment.

## Authentication Configuration

- Supabase Site URL: `https://azure-quest-pwa.vercel.app`.
- Redirect allow-list includes:
  - `https://azure-quest-pwa.vercel.app/auth`
  - `https://azure-quest-pwa.vercel.app/auth?mode=update-password`
  - `https://azure-quest-pwa.vercel.app/auth/callback`
  - `https://azure-quest-pwa.vercel.app/account`
  - `https://praxisgrid.vercel.app/auth`
  - `https://praxisgrid.vercel.app/auth?mode=update-password`
  - `https://praxisgrid.vercel.app/auth/callback`
  - `https://praxisgrid.vercel.app/account`
  - local development callback/account URLs on port `4173`.
- Email/password signup: configured.
- Email confirmation: enabled.
- Password recovery redirect: live-verified after adding exact `/auth?mode=update-password` redirect URLs to the Supabase allow-list. Disposable QA recovery landed on the update form, returned `PUT /auth/v1/user` 200, and the account could sign in with the rotated temporary password.
- Google OAuth: externally blocked because no Google OAuth client ID or client secret is available in the environment. The browser button is hidden unless `VITE_GOOGLE_AUTH_ENABLED=true`.

## Vercel Configuration

- `VITE_SUPABASE_URL`: configured for Production.
- `VITE_SUPABASE_ANON_KEY`: configured for Production using the Supabase publishable key.
- `SUPABASE_SERVICE_ROLE_KEY`: not added to client/browser env.
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`: not present as environment variables; cached Vercel CLI auth is active.
- Production redeploy: PASS.
- Deployment ID: `dpl_72KcnyvFKWKA2FxoPPbBVcR54xrz`.
- Deployment URL: `https://praxisgrid-kjc9kwys4-tonybabalola-1114s-projects.vercel.app`.
- Public alias: `https://azure-quest-pwa.vercel.app`.
- PR #6 verification deployment ID: `dpl_3FK5MjhS14Kbo5VdqA8HsTPE3nZC`.
- PR #6 verification deployment URL: `https://praxisgrid-1rk29n3if-tonybabalola-1114s-projects.vercel.app`.
- M5 live-auth env refresh: production `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` were rotated to clean Supabase project values after browser sign-in exposed malformed header encoding in the deployed anon-key value. No secret values were printed or committed.
- M5 live-auth env refresh deployment URL: `https://praxisgrid-am85i7tkh-tonybabalola-1114s-projects.vercel.app`.
- PR #7 recovery-form deployment ID: `dpl_C6V68F25yyWdRQDRZpnsCjazidcC`.
- PR #8 recovery-redirect deployment ID: `dpl_2yfxrw9Ji7kjvfiahoCntv1sNaRu`.
- Current production deployment URL: `https://praxisgrid-rg9891u72-tonybabalola-1114s-projects.vercel.app`.
- Current deployment SHA: `af91959a`.

## Validation Run

- `npm install --legacy-peer-deps`: PASS.
- `npm run validate:migrations`: PASS for 26 sequential migrations.
- `npm run validate:rls`: PASS.
- `npm run validate:authorization`: PASS.
- `npm run validate:repository-isolation`: PASS, including the Project Intelligence owner-scoped row contract.
- `npm run validate:local-user-isolation`: PASS, including authenticated localForage partitioning and auth-aware hydration.
- `npm run validate:github-import-controls`: PASS.
- `npm run validate:project-intelligence`: PASS.
- `npm run validate:privacy-workflows`: PASS.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm test`: PASS, 26 files and 75 tests after adding the recovery-form regression.
- `npm run build`: PASS with existing large chunk warning.
- `PRODUCTION_BASE_URL=https://azure-quest-pwa.vercel.app npm run test:production-smoke`: PASS, 20 public checks passed and 10 signed-in checks skipped pending live QA identities.
- Main CI run `30766968811`: PASS for the full CI-equivalent suite after PR #6 merge.
- Public production smoke after PR #6 verification deployment `dpl_3FK5MjhS14Kbo5VdqA8HsTPE3nZC`: PASS, 20 public checks passed and 10 signed-in checks skipped pending live QA identities.
- PR #7 CI run `30770640414`: PASS.
- Merged `main` CI run `30770848102`: PASS.
- PR #8 CI run `30771363518`: PASS.
- Merged `main` CI run `30771557919`: PASS for the full CI-equivalent suite.
- Live disposable account verification: signup confirmation, role default, sign-in, onboarding persistence, admin denial, logout, re-sign-in, recovery redirect, password update, and rotated-password sign-in PASS.
- Live owner bootstrap: `tobibabalola21@gmail.com` created and verified with fresh session role `MAIN_ADMIN`.
- Live personal study account: `tonybabalola@gmail.com` created and verified with fresh session role `USER`.
- Live RLS flags: all returned public tables have row-level security enabled.
- Live two-user isolation: PASS, 27 cross-user read/update/delete checks in each direction across profiles, assessment sessions, quiz attempts, question flags, imported projects, Project Intelligence analyses, interview sessions, active interview sessions, and content quality reports.
- Live role-boundary checks: PASS. USER cannot escalate or read audit events; CONTENT_REVIEWER cannot publish approved questions; SUPPORT_ADMIN can read support reports but cannot publish; MAIN_ADMIN can read audit events.
- Live admin browser checks: PASS. Personal study USER is denied `/admin`; MAIN_ADMIN, CONTENT_REVIEWER, and SUPPORT_ADMIN can enter the protected Admin route.
- Temporary role/RLS QA users: deleted after verification. Temporary content-quality report rows from live QA were explicitly removed.

## Requirement Classification

- Supabase account access: complete and live-verified.
- Correct organisation selected: complete and live-verified.
- `praxisgrid-production` exists: complete and live-verified.
- Repository linked: complete and live-verified.
- Migrations applied: complete and live-verified.
- Migration history match: complete and live-verified.
- Vercel Production Supabase env: complete and live-verified.
- Supabase auth Site URL/redirects: complete and live-verified for fallback canonical URL.
- Email auth configuration: repository and hosted configuration complete; disposable signup confirmation, sign-in, onboarding persistence, admin denial, logout, re-sign-in, recovery redirect, password update, and rotated-password sign-in are live-verified. Public reset email request remains subject to Supabase provider rate-limit cooldown.
- Google SSO: externally blocked pending Google OAuth credentials.
- Owner `MAIN_ADMIN` bootstrap: complete and live-verified for `tobibabalola21@gmail.com`.
- Live RLS/two-user isolation tests: complete and live-verified for the user-owned tables covered by the temporary QA run.
- Role-boundary tests: complete and live-verified for USER, CONTENT_REVIEWER, SUPPORT_ADMIN, and MAIN_ADMIN boundaries covered by direct DB and browser checks.
- Audit-integrity tests: partially live-verified. Role-change audit rows are created by server-side role assignment and MAIN_ADMIN can read them; forged caller audit fields and every privileged mutation class still need broader automated production-test coverage.
- Production browser auth tests: signed-in admin route checks passed for USER denial and the three admin roles; broader signed-in product smoke remains pending.
- Same-browser local account switching: repository/static validation complete; live signed-in browser verification pending live QA identity bootstrap.
- Service-role absence from frontend bundle: repository build path keeps service-role variables out of `VITE_`; pending redeploy and built-bundle scan after the current branch merges.
- Temporary QA cleanup: complete for the role/RLS QA users and bounded QA records created during this run.

## Remaining External Blockers

- Google OAuth client ID and client secret are not present, so Google SSO cannot be safely enabled or tested.
- Owner password-reset email is temporarily blocked by Supabase email rate limiting; the owner account exists and is `MAIN_ADMIN`, but the reset email must be retried after cooldown so the owner can set their own password.
- Docker Desktop is unavailable, so local `supabase db reset` cannot run; hosted staging fallback passed.
- `https://praxisgrid.vercel.app` is not assigned to the connected Vercel account; production auth uses the working fallback `https://azure-quest-pwa.vercel.app`.
- Database password rotation is required because `supabase db dump --dry-run` printed a database password in local tool output. No value was committed or shown in project docs, but the password should be rotated from Supabase dashboard or a safe Management API call.

## Security Notes

- No Supabase credentials were committed.
- No database password was committed.
- No service-role key was configured as a `VITE_` variable.
- A Supabase CLI key-list command exposed legacy keys in local command output; legacy service-role use is therefore not accepted for production sign-off. The app uses the publishable browser key for frontend configuration.
- A Supabase CLI database dump dry-run printed a database password in local tool output. The command path is now avoided; database password rotation remains required before final security sign-off.
