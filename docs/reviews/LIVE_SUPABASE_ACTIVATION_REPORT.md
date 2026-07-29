# Live Supabase Activation Report

Date: 2026-07-29

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

- Repository migrations present: 25.
- Static migration validation: PASS.
- Static RLS validation: PASS.
- Static authorization validation: PASS.
- Static repository-isolation validation: PASS.
- Static GitHub import controls validation: PASS.
- Static Project Intelligence validation: PASS.
- Static privacy workflow validation: PASS.
- Hosted staging fallback: the pre-existing empty default project was used because Docker is unavailable in this environment.
- Staging dry run: PASS, exactly migrations `0001` through `0025`.
- Staging apply: PASS, migrations `0001` through `0025`.
- Production dry run: PASS, exactly migrations `0001` through `0025`.
- Production apply: PASS, migrations `0001` through `0025`.
- Production migration history: PASS, local and remote histories match for `0001` through `0025`.
- Docker local reset: externally unavailable in this environment.

## Authentication Configuration

- Supabase Site URL: `https://azure-quest-pwa.vercel.app`.
- Redirect allow-list includes:
  - `https://azure-quest-pwa.vercel.app/auth`
  - `https://azure-quest-pwa.vercel.app/auth/callback`
  - `https://azure-quest-pwa.vercel.app/account`
  - `https://praxisgrid.vercel.app/auth`
  - `https://praxisgrid.vercel.app/auth/callback`
  - `https://praxisgrid.vercel.app/account`
  - local development callback/account URLs on port `4173`.
- Email/password signup: configured.
- Email confirmation: enabled.
- Password recovery redirect: repository implementation still requires live browser verification.
- Google OAuth: externally blocked because no Google OAuth client ID or client secret is available in the environment.

## Vercel Configuration

- `VITE_SUPABASE_URL`: configured for Production.
- `VITE_SUPABASE_ANON_KEY`: configured for Production using the Supabase publishable key.
- `SUPABASE_SERVICE_ROLE_KEY`: not added to client/browser env.
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`: not present as environment variables; cached Vercel CLI auth is active.
- Production redeploy: PASS.
- Deployment ID: `dpl_72KcnyvFKWKA2FxoPPbBVcR54xrz`.
- Deployment URL: `https://praxisgrid-kjc9kwys4-tonybabalola-1114s-projects.vercel.app`.
- Public alias: `https://azure-quest-pwa.vercel.app`.

## Validation Run

- `npm install --legacy-peer-deps`: PASS.
- `npm run validate:migrations`: PASS.
- `npm run validate:rls`: PASS.
- `npm run validate:authorization`: PASS.
- `npm run validate:repository-isolation`: PASS.
- `npm run validate:github-import-controls`: PASS.
- `npm run validate:project-intelligence`: PASS.
- `npm run validate:privacy-workflows`: PASS.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm test`: PASS, 26 files and 72 tests.
- `npm run build`: PASS with existing large chunk warning.
- `PRODUCTION_BASE_URL=https://azure-quest-pwa.vercel.app npm run test:production-smoke`: PASS, 20 public checks passed and 10 signed-in checks skipped pending live QA identities.

## Requirement Classification

- Supabase account access: complete and live-verified.
- Correct organisation selected: complete and live-verified.
- `praxisgrid-production` exists: complete and live-verified.
- Repository linked: complete and live-verified.
- Migrations applied: complete and live-verified.
- Migration history match: complete and live-verified.
- Vercel Production Supabase env: complete and live-verified.
- Supabase auth Site URL/redirects: complete and live-verified for fallback canonical URL.
- Email auth configuration: repository and hosted configuration complete; live signup/sign-in/reset browser verification pending.
- Google SSO: externally blocked pending Google OAuth credentials.
- Owner `MAIN_ADMIN` bootstrap: externally blocked pending `PRAXISGRID_OWNER_EMAIL`.
- Live RLS/two-user isolation tests: externally blocked pending live QA identity bootstrap credentials.
- Role-boundary tests: repository/static validation only; live verification pending.
- Audit-integrity tests: repository/static validation only; live verification pending.
- Production browser auth tests: public unauthenticated/auth-route smoke complete; signed-in tests pending live QA identity bootstrap.
- Service-role absence from frontend bundle: pending redeploy and built-bundle scan.
- Temporary QA cleanup: pending creation of live QA identities.

## Remaining External Blockers

- `PRAXISGRID_OWNER_EMAIL` is not present, so the real owner cannot be resolved or bootstrapped as `MAIN_ADMIN`.
- Google OAuth client ID and client secret are not present, so Google SSO cannot be safely enabled or tested.
- Docker Desktop is unavailable, so local `supabase db reset` cannot run; hosted staging fallback passed.
- `https://praxisgrid.vercel.app` is not assigned to the connected Vercel account; production auth uses the working fallback `https://azure-quest-pwa.vercel.app`.

## Security Notes

- No Supabase credentials were committed.
- No database password was committed.
- No service-role key was configured as a `VITE_` variable.
- A Supabase CLI key-list command exposed legacy keys in local command output; legacy service-role use is therefore not accepted for production sign-off. The app uses the publishable browser key for frontend configuration.
