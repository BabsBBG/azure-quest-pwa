# KNOWN_FAILURES.md

Every failed command, build error, deployment error, and attempted fix must be logged here.

### Supabase db dump dry-run exposed database password locally

Date:
2026-08-03

Command:
`npx --yes supabase@latest db dump --schema public --linked --dry-run`

Error:
The Supabase CLI printed a generated `PGPASSWORD` value as part of the dry-run shell script for `pg_dump`.

Likely cause:
The CLI dry-run mode prints the exact shell script it would execute, including database connection environment variables.

Fix attempted:
Stopped using the dump dry-run path and switched to `supabase db query --linked` for live schema/RLS inspection because query output does not print database credentials.

Result:
Mitigated for future checks in this run. No database password was committed to source, documentation, or Vercel browser configuration.

Remaining issue:
Rotate the Supabase database password from the dashboard or a safe Management API path before final security sign-off.

### Owner password reset email rate-limited

Date:
2026-08-03

Command:
Supabase public password reset request for `tobibabalola21@gmail.com`.

Error:
Supabase returned `email rate limit exceeded`.

Likely cause:
The built-in Supabase email service had recently sent or attempted multiple auth emails during disposable-account signup/recovery verification.

Fix attempted:
Owner account was still created and verified as `MAIN_ADMIN` using temporary bootstrap credentials stored outside the repository. Password reset email was not retried immediately to avoid worsening the provider throttle.

Result:
Owner bootstrap and fresh-session role verification passed. Owner self-service password reset remains pending cooldown.

Remaining issue:
Retry the owner reset email after the Supabase provider cooldown, or configure approved SMTP credentials and retest delivery.

### M5 live auth recovery form required email after reset callback

Date:
2026-08-02

Command:
Live disposable-account password recovery browser verification against `https://azure-quest-pwa.vercel.app/auth?mode=update-password`.

Error:
The recovery callback reached the update-password screen, but the form still rendered a required email field. A password-only recovery session therefore could not submit the new password through the public UI.

Likely cause:
The shared auth form did not hide the email field for `update-password` mode.

Fix attempted:
Hide the email field when `mode === "update-password"`, add immediate update feedback, add a regression test proving the recovery password update form only requires the new password, and add the exact `/auth?mode=update-password` redirect URLs to the Supabase allow-list.

Result:
Resolved locally and live. `npm test -- src/pages/Account.test.tsx src/hooks/useAuth.test.tsx`, `npm run validate:auth-redirects`, `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` passed for the form fix. After the merged production deploy and Supabase config push, live recovery landed on `/auth?mode=update-password`, the password update returned `PUT /auth/v1/user` 200, and sign-in with the rotated disposable QA password passed.

Remaining issue:
None for the disposable-account recovery update path. Public reset email delivery remains subject to Supabase provider rate limits and must be checked separately when the cooldown allows.

### M5 production Supabase browser key encoding failure

Date:
2026-08-02

Command:
Live disposable-account browser sign-in against `https://azure-quest-pwa.vercel.app/auth?mode=signin`.

Error:
The deployed browser auth call failed before reaching Supabase because the Vercel production `VITE_SUPABASE_ANON_KEY` value contained a non-ISO-8859-1 code point and could not be used as a request header value.

Likely cause:
The production Vercel environment variable contained malformed copied key material.

Fix attempted:
Replaced the production `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with clean values retrieved from the Supabase project configuration, without printing or committing secret values, then redeployed production.

Result:
Resolved for disposable sign-in/onboarding/admin-denial/logout/sign-in-again browser verification.

Remaining issue:
Continue the full M5 live auth sequence after the recovery-form fix is deployed.

### PR #6 WebKit CI internal navigation error

Date:
2026-08-02

Command:
GitHub Actions run `30766356019`, step `npm run test:e2e:webkit`.

Error:
WebKit failed one public legal/status route test with `page.goto: WebKit encountered an internal error` while navigating to `/terms`; the other 14 WebKit tests passed.

Likely cause:
CI ran Playwright with two workers while WebKit route/navigation tests have historically been more stable in this repository when serialized.

Fix attempted:
Changed `playwright.config.ts` to use one worker in CI and local runs, matching the stable local browser-slice execution model.

Result:
Resolved locally. `CI=true npm run test:e2e:webkit` passed 15/15 with one worker.

Remaining issue:
PR #6 CI must be rerun after pushing the stabilization commit.

### M5 local user-isolation mobile slice timeout

Date:
2026-08-02

Command:
`npm run test:e2e:mobile`

Error:
The first local mobile Playwright slice exceeded the 420-second tool timeout and Playwright emitted an `EPIPE` while writing final reporter output after the shell closed the pipe.

Likely cause:
The mobile slice runs 30 tests serially across `mobile-390` and `mobile-320`; the local desktop environment needed more than seven minutes for this full slice.

Fix attempted:
Checked for leftover `node` processes, found none, then reran the same command with a longer timeout.

Result:
Resolved locally. `npm run test:e2e:mobile` passed 30/30 on rerun with the longer timeout.

Remaining issue:
Use a longer local timeout for the mobile slice; CI remains the source of truth after push.

### M5 production-mobile auth contrast failure on main and PR 4

Date:
2026-07-30

Command:
GitHub Actions runs `30484240674` and `30521845484`, step `npm run test:production-smoke`.

Error:
Production mobile accessibility failed with serious axe `color-contrast` violations on `/auth?mode=signin` and `/auth?mode=signup`.

Likely cause:
Disabled auth buttons used opacity-based styling, which blended Azure buttons and soft Google buttons into insufficient contrast on the deployed production alias.

Fix attempted:
Replaced opacity-disabled button styling with explicit accessible disabled border/background/text colors in `src/components/ui/button.tsx`. Then changed production smoke to skip pull requests explicitly because that gate tests the deployed production alias, not the unmerged branch.

Result:
Local focused mobile auth accessibility passed before this continuation. `npm run validate:production-smoke-gate` passes with the explicit pull-request skip.

Remaining issue:
PR #4 and post-merge `main` CI still need to pass after the current branch changes are pushed, merged, and production is redeployed.

### M5 auth success notices shown after failed hook actions

Date:
2026-08-01

Command:
Subagent audit and source inspection of `src/pages/AuthPage.tsx` and `src/hooks/useAuth.tsx`.

Error:
Signup and reset notices were shown immediately after awaiting auth actions, even though the hook only set `auth.error` and did not throw or return success/failure.

Likely cause:
Auth actions returned `Promise<void>`, so the page could not distinguish success from a handled Supabase error.

Fix attempted:
Auth actions now return typed `{ ok }` results, signup/reset notices appear only on confirmed success, onboarding navigation waits for successful metadata persistence, and password recovery uses `/auth?mode=update-password` with `updateUser({ password })`.

Result:
Focused auth tests, `npm run validate:auth-redirects`, and `npm run typecheck` passed.

Remaining issue:
Live email signup/sign-in/password recovery browser tests remain blocked until production QA identities and required secrets are available.

### Live Supabase CLI non-interactive login block

Date:
2026-07-29

Command:
`npx --yes supabase@latest login`

Error:
The first login attempts failed because the CLI detected a non-TTY/agent JSON environment and refused to prompt.

Likely cause:
The Codex shell exported CI/agent-style environment markers, causing Supabase CLI to require a token unless agent detection was disabled.

Fix attempted:
Reran the login with text output, `--agent no`, and `--no-browser`, then completed the Supabase dashboard verification-code flow.

Result:
Resolved. Supabase CLI authenticated successfully and was used to create/link `praxisgrid-production`.

Remaining issue:
None for CLI authentication.

### Live Supabase create rejected explicit free-plan size

Date:
2026-07-29

Command:
`supabase projects create praxisgrid-production --size micro`

Error:
Supabase returned `Instance size cannot be specified for free plan organizations.`

Likely cause:
Free-plan organisations choose the allowed instance size automatically.

Fix attempted:
Reran project creation without `--size`.

Result:
Resolved. Project `praxisgrid-production` was created in `eu-west-1`.

Remaining issue:
None.

### Supabase CLI key listing exposed legacy keys in local output

Date:
2026-07-29

Command:
`supabase projects api-keys --project-ref ... --output json`

Error:
The command output included legacy key material in the local command output.

Likely cause:
The current Supabase CLI reveals legacy anon/service-role values in this output mode while masking newer secret keys.

Fix attempted:
Do not commit, document, or configure the exposed service-role value. Configure Vercel with the Supabase publishable browser key only.

Result:
Partially mitigated. No key value was committed or added to browser env.

Remaining issue:
Legacy service-role use is not accepted for production sign-off from this run. Prefer the new Supabase secret key system for server-side QA, and rotate/revoke legacy credentials through the Supabase dashboard if required.

### Supabase generated config briefly weakened auth confirmation defaults

Date:
2026-07-29

Command:
`supabase config push --project-ref ozfexprlomzlhkcyagfd`

Error:
The first generated local config diff would have disabled email confirmations and lowered OTP settings.

Likely cause:
`supabase init` generated local development defaults that did not match the hosted production auth defaults.

Fix attempted:
Updated `supabase/config.toml` to keep email confirmations enabled, OTP length at 8, and email frequency at one minute, then pushed the corrected config.

Result:
Resolved. Production auth config was corrected immediately.

Remaining issue:
Live signup/sign-in/password-reset browser verification remains pending.

### Preferred PraxisGrid Vercel alias unavailable

Date:
2026-07-29

Command:
`vercel domains inspect praxisgrid.vercel.app`

Error:
Vercel reported the connected account does not have access to `praxisgrid.vercel.app`.

Likely cause:
The preferred alias is not assigned to the connected Vercel project/account.

Fix attempted:
Use the working public fallback `https://azure-quest-pwa.vercel.app` for Supabase Site URL and production smoke until a PraxisGrid canonical alias is assigned.

Result:
Partially resolved. Auth redirects now target the working public fallback while preserving PraxisGrid redirect entries for future alias activation.

Remaining issue:
Assign a canonical PraxisGrid domain or alias in Vercel.

### M5/M6 accessibility gate local timeout during assessment-shell retest

Date:
2026-07-29

Command:
`npm run test:accessibility`

Error:
The first run exceeded the local 420-second tool timeout before returning a result, leaving orphaned Playwright/Vite Node processes active.

Likely cause:
The full accessibility matrix runs 36 tests across Chromium, WebKit, mobile, tablet, and desktop projects. WebKit/mobile startup was slower than the local timeout budget.

Fix attempted:
Identified and stopped the orphaned Node processes from the timed run, then reran `npm run test:accessibility` with a longer timeout.

Result:
Resolved. The rerun passed 36/36 on 2026-07-29.

Remaining issue:
Use a longer local timeout for the full accessibility matrix. CI remains the source of truth after push.

### M5/M6 parallel Playwright server contention during signed-in retest

Date:
2026-07-29

Command:
Parallel run of `npm run test:accessibility` and `npm run test:visual`.

Error:
`npm run test:accessibility` failed with multiple `page.goto: Could not connect to server` and `net::ERR_CONNECTION_REFUSED` errors after the first Chromium checks passed.

Likely cause:
Two Playwright commands were run concurrently against the same local dev-server port. The visual slice passed, but the accessibility slice lost the shared local server mid-run.

Fix attempted:
Stop using parallel Playwright commands for slices that start the local server, clear generated Playwright artifacts, and rerun accessibility by itself.

Result:
Resolved. `npm run test:accessibility` passed 36/36 when rerun by itself after clearing generated Playwright artifacts.

Remaining issue:
None for this local command contention. Keep Playwright slices that start the dev server serialized.

### M5/M6 signed-in E2E spec lint parser miss

Date:
2026-07-29

Command:
`npm run lint`

Error:
`tests/e2e/signed-in-flows.spec.ts` failed with `Parsing error: Unexpected token Page`.

Likely cause:
The ESLint flat config applied the TypeScript parser to `src`, scripts, and root config files, but not `tests/**/*.ts`. The new Playwright spec used a valid TypeScript type-only import and was parsed by the default JavaScript parser.

Fix attempted:
Added `tests/**/*.ts` to the TypeScript parser file globs in `eslint.config.js`.

Result:
Resolved. `npm run lint` passed after adding `tests/**/*.ts` to the TypeScript parser globs.

Remaining issue:
None for this lint parser miss.

### M5/M6 production smoke timeout against fresh PraxisGrid deployment

Date:
2026-07-29

Command:
`PRODUCTION_BASE_URL=https://praxisgrid-om99h3h2u-tonybabalola-1114s-projects.vercel.app npm run test:production-smoke`

Error:
The first command exceeded the local 300-second tool timeout before returning Playwright output. A longer rerun against the unique deployment URL failed because Vercel deployment protection redirected Playwright to Vercel login instead of PraxisGrid.

Likely cause:
The unique deployment URL `https://praxisgrid-om99h3h2u-tonybabalola-1114s-projects.vercel.app` is protected in the connected Vercel account. The public production alias `https://azure-quest-pwa.vercel.app` serves the same latest deployment without the Vercel login interstitial.

Fix attempted:
Cleared generated Playwright artifacts, identified the protected-target redirect, and reran production smoke against the public production alias.

Result:
Resolved for public production smoke. `PRODUCTION_BASE_URL=https://azure-quest-pwa.vercel.app npm run test:production-smoke` passed 20/20 on 2026-07-29.

Remaining issue:
Do not use protected unique Vercel deployment URLs as public smoke targets unless deployment protection is disabled. The canonical `https://praxisgrid.vercel.app` domain remains unavailable.

### M5/M6 destructive delete error narrowing

Date:
2026-07-28

Command:
`npm run typecheck`

Error:
`src/store/useAppStore.ts(393,67): error TS2339: Property 'error' does not exist on type 'never'.`

Likely cause:
The new repository analysis delete failure path checked `!result.ok && !result.skipped`, which left TypeScript with an overly narrow inferred union for the optional `error` field.

Fix attempted:
Added a small unknown-error formatter and guarded `result.error` with `"error" in result` before throwing a learner-visible delete failure.

Result:
Resolved. `npm run typecheck` passed after the guarded error formatter.

Remaining issue:
None for this TypeScript failure.

### M5/M6 local WebKit slice timeout during destructive-action retest

Date:
2026-07-28

Command:
`npm run test:e2e:webkit`

Error:
The command exceeded the local 300-second tool timeout before returning Playwright output.

Likely cause:
Local WebKit/browser worker startup or teardown exceeded the command timeout during the full CI-equivalent retest. No leftover `node.exe` process remained after the timeout.

Fix attempted:
Rerun the same WebKit slice with a longer timeout before continuing validation.

Result:
Resolved. `npm run test:e2e:webkit` passed 10/10 when rerun with a longer local timeout.

Remaining issue:
None for the WebKit slice. The local WebKit gate is slow and may need a longer timeout than 300 seconds.

### M5/M6 onboarding validator dynamic heading mismatch

Date:
2026-07-28

Command:
`npm run validate:onboarding`

Error:
`Onboarding validation failed: page missing Set up your`

Likely cause:
The onboarding page heading became edit-aware with `{editing ? "Update" : "Set up"} your`, but the new validator still required the old literal phrase.

Fix attempted:
Updated `scripts/validate-onboarding.mjs` to require the edit-aware heading expression.

Result:
Resolved. `npm run validate:onboarding` passed after updating the validator.

Remaining issue:
None.

### M5/M6 umbrella RLS validator omitted base report migration

Date:
2026-07-28

Command:
`npm run validate:rls`

Error:
`RLS validation failed: content_quality_reports does not enable row level security.`

Likely cause:
The new umbrella RLS validator checked content-quality report tables but did not include `supabase/migrations/0017_content_quality_reports.sql`, where those tables enable RLS.

Fix attempted:
Added the base content-quality migration to the validator read set.

Result:
Retest pending.

Remaining issue:
Rerun RLS validation.

### M5/M6 repository-isolation umbrella expected explicit user-scoped wording

Date:
2026-07-28

Command:
`npm run validate:repository-isolation`

Error:
`Repository isolation validation failed: Project Intelligence validator must enforce user-scoped analysis rows.`

Likely cause:
`validate-project-intelligence` enforced `importedProjectAnalysisRowId(userId, project)` but did not also require the exact user-scoped row return or print `user-scoped`, so the new umbrella validator could not verify that contract transitively.

Fix attempted:
Added the explicit user-scoped analysis-row return requirement and updated the validator success text.

Result:
Retest pending.

Remaining issue:
Rerun repository-isolation validation.

### M5/M6 umbrella RLS validator support guard name mismatch

Date:
2026-07-28

Command:
`npm run validate:rls`

Error:
`RLS validation failed: missing guard_support_admin_report_write`

Likely cause:
The new umbrella RLS validator expected a shorthand guard name, but the migration uses concrete trigger names `guard_support_admin_report_update` and `guard_support_admin_report_event_write`.

Fix attempted:
Updated `scripts/validate-rls.mjs` to require the actual support guard trigger names.

Result:
Retest pending.

Remaining issue:
Rerun RLS validation.

### M5/M6 umbrella RLS validator flagged historical audit policy

Date:
2026-07-28

Command:
`npm run validate:rls`

Error:
`RLS validation failed: content quality report events must not have a mutable for-all policy.`

Likely cause:
The validator scanned all migrations as one string and found the historical `for all` policy in `0017_content_quality_reports.sql`, even though `0025_rpc_and_audit_hardening.sql` drops and replaces that policy.

Fix attempted:
Changed the validator to require the hardening migration to drop the mutable policy and avoid recreating it.

Result:
Retest pending.

Remaining issue:
Rerun RLS validation.

### M5/M6 admin validator stale role badge copy

Date:
2026-07-28

Command:
GitHub Actions run `30372718004`, job `90320460139`, step `npm run validate:admin-review-studio`.

Error:
`Admin Review Studio validation failed: missing Main Admin protected`

Likely cause:
The support-boundary slice changed Admin Review Studio from a static `Main Admin protected` badge to role-aware copy that shows the current role plus `Main Admin publishes` and support-only inspect affordances. The validator still expected the old static badge text.

Fix attempted:
Updated `scripts/validate-admin-review-studio.mjs` to require the new role-aware governance copy and support inspect affordance instead of the old badge text.

Result:
Resolved locally. `npm run validate:admin-review-studio`, `npm run validate:auth-redirects`, `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` passed after updating the stale validator and adding auth redirect preservation.

Remaining issue:
Push the validator fix and rerun PR CI.

### M5/M6 auth-first validator stale literal redirect

Date:
2026-07-28

Command:
GitHub Actions run `30373351670`, job `90322627904`, step `npm run validate:auth-first-ia`.

Error:
`Auth-first IA validation failed: App missing protected route snippet Navigate to="/auth?mode=signup"`

Likely cause:
The auth redirect continuity slice replaced the literal signup redirect with `authPath("signup", location)` so protected routes can preserve the original destination through sign-in and Google SSO. The validator still expected the older literal string.

Fix attempted:
Updated `scripts/validate-auth-first-ia.mjs` to require `authPath("signup", location)` instead of the old literal redirect.

Result:
Resolved locally. `npm run validate:auth-first-ia`, `npm run validate:auth-redirects`, and `npm run typecheck` passed after updating the stale auth-first validator.

Remaining issue:
Push the validator fix and rerun PR CI.

### M5/M6 authorization validator stale imported-project row pattern

Date:
2026-07-28

Command:
GitHub Actions run `30369719901`, job `90310088692`, step `npm run validate:authorization`.

Error:
`Authorization validation failed: imported project cloud rows must be user-scoped.`

Likely cause:
The Project Intelligence slice refactored `syncImportedProject` to compute `const rowId = importedProjectRowId(userId, project)` once and reuse it for both imported-project and analysis persistence. The validator still only accepted the older inline `id: importedProjectRowId(userId, project)` pattern.

Fix attempted:
Updated `scripts/validate-authorization.mjs` to accept either the old inline expression or the new local `rowId` pattern while still requiring `importedProjectRowId(userId, project)`.

Result:
Resolved locally. `npm run validate:authorization`, `npm run validate:project-intelligence`, `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` passed after updating the validator.

Remaining issue:
Push and rerun PR CI.

### M5/M6 CI cloud sync fallback shape mismatch

Date:
2026-07-28

Command:
GitHub Actions run `30364156414`, job `90290975870`, step `npm test`.

Error:
`src/lib/cloudSync.test.ts` failed because `fetchCloudLearningData()` now returns `activeInterviewSession: null`, but the fallback-shape test still expected the older object without that field.

Likely cause:
The active Interview Studio recovery slice extended the cloud fallback contract, and the existing cloud sync unit test was not updated in the same commit.

Fix attempted:
Added `activeInterviewSession: null` to the expected fallback object.

Result:
Resolved locally. `npm test -- src/lib/cloudSync.test.ts` and full `npm test` passed after updating the fallback expectation and guarding active draft local storage writes.

Remaining issue:
PR CI rerun pending after push.

### M5/M6 active interview autosave localForage test rejection

Date:
2026-07-28

Command:
`npm test`

Error:
All 26 test files and 72 tests passed, but Vitest failed the run because `JobReadiness.test.tsx` triggered six unhandled `No available storage method found` rejections from localForage.

Likely cause:
The new active Interview Studio autosave path writes to localForage after starting/typing in the Career Lab component test. The jsdom test environment has no available localForage storage driver.

Fix attempted:
Wrapped active interview local draft `setItem` and `removeItem` calls in storage-unavailable guards while preserving in-memory store updates and best-effort cloud sync.

Result:
Resolved. Full `npm test` passed after guarding active draft local storage writes.

Remaining issue:
PR CI rerun pending after push.

### M5/M6 GitHub import validator stale direct-events requirement

Date:
2026-07-28

Command:
`npm run validate:github-import-controls`

Error:
The validator failed with `API missing github_import_events`.

Likely cause:
The endpoint was correctly changed to claim quota through the new `claim_github_import_quota` RPC instead of touching `github_import_events` directly, but the validator still required the old direct table reference in `api/github-project.js`.

Fix attempted:
Removed the direct `github_import_events` API snippet requirement while keeping RPC and migration checks for `github_import_events`, `claim_github_import_quota`, and `pg_advisory_xact_lock`.

Result:
Resolved. `npm run validate:github-import-controls` passed after updating the validator for the RPC-based quota path.

Remaining issue:
None.

### M5/M6 active interview migration filename lookup miss

Date:
2026-07-28

Command:
`Get-Content .\supabase\migrations\0002_learning_records.sql`

Error:
The file did not exist.

Likely cause:
The learning-data migration is named `0002_learning_data.sql`, not `0002_learning_records.sql`.

Fix attempted:
Listed `supabase/migrations` and read `0002_learning_data.sql`.

Result:
Resolved. The correct migration file was inspected before adding the active interview migration.

Remaining issue:
None.

### M5/M6 GitHub import client duplicate data binding

Date:
2026-07-26

Command:
`npm test -- src/lib/githubProjectImport.test.ts`

Error:
The focused Vitest run failed during transform because `src/lib/githubProjectImport.ts` declared `data` for both the Supabase session response and the API JSON response.

Likely cause:
The auth-token fetch was added above existing response parsing without renaming the local binding.

Fix attempted:
Renamed the Supabase session binding to `sessionData`.

Result:
Resolved. Focused GitHub import tests, typecheck, and lint passed after renaming the binding.

Remaining issue:
None.

### M5/M6 CI WebKit auth signup contrast failure

Date:
2026-07-26

Command:
GitHub Actions `npm run test:e2e:webkit` in run `30213592120`.

Error:
WebKit failed the `/auth?mode=signup` axe check with near-white foreground computed on a light `bg-slate-50` background.

Likely cause:
Under parallel GitHub Actions WebKit execution, the public auth page could retain the dark root text token while the light background utility was already active, producing unstable computed contrast.

Fix attempted:
Pinned public auth/legal shells to explicit light foreground/background/color-scheme inline styles and pinned auth intro text/badge computed colors.

Result:
Resolved locally. `CI=true npm run test:e2e:webkit` passed 10/10 after the computed color pinning.

Remaining issue:
Resolved in PR CI. GitHub Actions run `30214329194` passed after the follow-up fixes.

### M5/M6 CI mobile auth opacity contrast failure

Date:
2026-07-26

Command:
GitHub Actions `npm run test:accessibility` in run `30213916042`.

Error:
The mobile-320 `/auth?mode=signin` and `/auth?mode=reset` axe checks failed because the PraxisGrid badge and intro text were computed with blended/partially transparent colors against the light page background.

Likely cause:
The public auth page intro used a Framer Motion fade-in. Fast CI accessibility scans can sample during opacity animation, making otherwise valid colors fail contrast.

Fix attempted:
Removed the intro fade animation from `AuthPage` and darkened the small intro copy to stable slate-800 computed colors.

Result:
Resolved locally. `CI=true npm run test:accessibility` passed 36/36 after removing the auth intro fade and darkening the intro copy.

Remaining issue:
Resolved in PR CI. GitHub Actions run `30214329194` passed after the follow-up fixes.

### M5/M6 CSS lookup command misses

Date:
2026-07-26

Command:
`rg -n "f6f8|f8fafc|color|--aq-ink|body|h1|\\.dark|color-scheme|@media" src index.html *.css`

Error:
The search partially ran but returned exit code 1 because PowerShell passed `*.css` in a way that produced a filename error.

Likely cause:
The workspace has CSS under `src/styles.css`; the extra root glob was unnecessary in PowerShell.

Fix attempted:
Read `src/styles.css` directly.

Result:
Resolved.

Remaining issue:
None.

Command:
`Get-Content -Path .\src\index.css`

Error:
The file does not exist.

Likely cause:
The repo uses `src/styles.css`.

Fix attempted:
Read `src/styles.css`.

Result:
Resolved.

Remaining issue:
None.

### M5/M6 PowerShell git staging separator failure

Date:
2026-07-26

Command:
`git add ... && git status --short`

Error:
PowerShell rejected `&&` with `The token '&&' is not a valid statement separator in this version`.

Likely cause:
The shell version for this workspace does not support `&&` command chaining.

Fix attempted:
Run `git add` and `git status --short` as separate PowerShell commands.

Result:
Resolved. The separate `git add` command staged the intended files, and `git status --short` confirmed the staged set.

Remaining issue:
None.

### M5/M6 Vitest imported Playwright specs

Date:
2026-07-26

Command:
`npm test`

Error:
Vitest tried to import `tests/e2e/accessibility.spec.ts` and `tests/e2e/auth-routing.spec.ts`, then failed because Playwright's `test()` API cannot be called inside the Vitest runner.

Likely cause:
Adding Playwright specs under `tests/e2e` without excluding that folder from Vitest's default file discovery.

Fix attempted:
Updated `vitest.config.ts` to exclude `tests/e2e/**` while preserving the existing jsdom test environment.

Result:
Resolved. `npm test` passed after excluding `tests/e2e/**` from Vitest.

Remaining issue:
None.

### M5/M6 admin validator expected unprotected route

Date:
2026-07-26

Command:
`npm run validate:admin-review-studio`

Error:
The validator failed with `/admin must be routed outside the learner Layout` and then with `missing ProtectedAdminRoute`.

Likely cause:
The validator used a broad `App.tsx` string-position check built for the old direct `/admin` route. After the auth hardening fix, `/admin` is intentionally routed through `ProtectedAdminRoute`, and `<Layout>` appears inside the `ProtectedLearnerShell` helper.

Fix attempted:
Updated `scripts/validate-admin-review-studio.mjs` to require `/admin` to use `ProtectedAdminRoute`, verify it is declared before the wildcard learner shell route, and check learner layout containment directly.

Result:
Resolved. `npm run validate:admin-review-studio` passed after the validator update.

Remaining issue:
None.

### PowerShell Playwright grep token failure

Date:
2026-07-26

Command:
`npx playwright test --project=desktop-1440 --grep @accessibility`

Error:
PowerShell treated `@accessibility` as a variable/splat token and failed with `The variable '$accessibility' cannot be retrieved because it has not been set`.

Likely cause:
The grep pattern was not quoted in PowerShell.

Fix attempted:
Rerun with `--grep "@accessibility"`.

Result:
Resolved. The quoted command ran correctly and exposed the real desktop accessibility contrast failures below.

Remaining issue:
None for command syntax.

### M5/M6 full E2E desktop auth contrast failure

Date:
2026-07-26

Command:
`npm run test:e2e`

Error:
Full Playwright E2E passed 59 of 60 tests, but the `desktop-1440` accessibility check for `/auth?mode=signin` failed with serious color-contrast violations.

Likely cause:
The public auth shell inherited a dark background from persisted app theme state while some left-panel text computed as dark foreground during the full cross-project run.

Fix attempted:
Made public auth/legal/status shells deliberately light and stable instead of inheriting app dark-mode surfaces.

Result:
Resolved. Public auth/legal/status routes now use stable light wrappers and explicit accessible text/background colors. Targeted desktop accessibility passed 6/6, full accessibility passed 36/36, and tablet/desktop project slices passed 20/20.

Remaining issue:
The combined `npm run test:e2e` command exceeded the local 240-second shell timeout before returning output. Equivalent project slices passed: Chromium 10/10, WebKit 10/10, mobile 20/20, tablet+desktop 20/20, accessibility 36/36, visual 6/6.

### M5/M6 combined Playwright matrix local timeout

Date:
2026-07-26

Command:
`npm run test:e2e`

Error:
The full six-project Playwright matrix exceeded the local 240-second command timeout before returning test output.

Likely cause:
The local matrix runs all browser, mobile, tablet, desktop, accessibility, routing, and visual-tagged checks serially with one worker to avoid dev-server/artifact contention.

Fix attempted:
Stopped the timed-out Playwright/Vite processes, cleared stale artifacts, and reran the same coverage as project/tag slices with longer per-command timeouts.

Result:
Resolved for coverage. Passing slices: `npm run test:e2e:chromium` 10/10, `npm run test:e2e:webkit` 10/10, `npm run test:e2e:mobile` 20/20, `npm run test:accessibility` 36/36, `npm run test:visual` 6/6, and `npx playwright test --project=tablet --project=desktop-1440` 20/20.

Remaining issue:
The single aggregate command should be run in CI or a longer local shell window if an all-in-one transcript is required.

### M5/M6 parallel Playwright matrix timeout

Date:
2026-07-26

Command:
Parallel run of:
`npm run test:e2e:webkit`
`npm run test:e2e:mobile`
`npm run test:accessibility`
`npm run test:visual`

Error:
The WebKit, mobile, and accessibility commands timed out after the tool timeout. The visual command failed with Playwright test timeouts and artifact `ENOENT` errors while multiple Playwright processes were running concurrently against the same local server/artifact output.

Likely cause:
Several Playwright commands launched simultaneously, contending for the same Vite dev server, browser resources, and `test-results` artifact paths.

Fix attempted:
Increased Playwright test timeout to 60 seconds and limited local workers to one while keeping CI at two workers.

Result:
Resolved. Sequential reruns passed: WebKit E2E, mobile E2E, accessibility, and visual checks all completed successfully after the timeout/worker adjustment.

Remaining issue:
None.

### M5/M6 typecheck script invalid noEmit with project references

Date:
2026-07-26

Command:
`npm run typecheck`

Error:
TypeScript reported `Referenced project ... tsconfig.node.json may not disable emit` when running `tsc -b --noEmit`.

Likely cause:
The repo uses TypeScript project references, and the referenced Node config disables emit. Combining `--build` and `--noEmit` was incompatible with the existing configuration.

Fix attempted:
Changed `typecheck` to `tsc -b`, matching the existing production build typecheck behavior.

Result:
Resolved. `npm run typecheck` passed after changing the script to `tsc -b`.

Remaining issue:
None.

### M5/M6 accessibility gate contrast failure

Date:
2026-07-26

Command:
`npm run test:e2e:chromium`

Error:
Chromium Playwright E2E passed routing tests but failed axe checks on public auth/legal routes for serious color-contrast and link-in-text-block violations.

Likely cause:
Azure-blue links/buttons used `text-[var(--aq-blue-700)]` on dark cards, and legal inline links relied on color without underline.

Fix attempted:
Added higher-contrast dark-mode link color and underline/offset styling to auth mode controls, legal links, and public-info return links.

Result:
Resolved. `npm run test:e2e:chromium` passed after the contrast and link styling fixes.

Remaining issue:
None.

### KQL feedback regression test localForage failure

Date:
2026-07-26

Command:
`npm test -- src/pages/KqlGym.test.tsx src/components/QuestionBankNotice.test.tsx`

Error:
The new KQL regression test failed after clicking `Finish now` with `No available storage method found`.

Likely cause:
The component called the real Zustand `recordAttempt` action, which writes through localForage; the Vitest/jsdom environment for this focused test did not provide a usable storage backend.

Fix attempted:
Mocked `recordAttempt` through `useAppStore.setState()` inside the KQL test so the test verifies feedback timing without invoking localForage.

Result:
Resolved. `npm test -- src/pages/KqlGym.test.tsx src/components/QuestionBankNotice.test.tsx` passed after mocking the store persistence action.

Remaining issue:
None.

### Google SSO Vercel log scan fetch failure

Date:
2026-07-26

Command:
`npx vercel logs https://azure-quest-nenrffh2z-tonybabalola-1114s-projects.vercel.app --since 1h`

Error:
Vercel CLI resolved the deployment and project, then failed while fetching logs with `Error: fetch failed`.

Likely cause:
Transient Vercel CLI/network log retrieval failure. The deployment itself inspected as `Ready`, and `/account` returned `200 OK`.

Fix attempted:
Deployment was verified with `npx vercel inspect` and an HTTP request to the production `/account` route.

Result:
Deployment verification passed; log scan remains unavailable in this local run.

Remaining issue:
Retry Vercel log retrieval later if post-deploy log inspection is required.

### Google SSO Vitest mock hoisting failure

Date:
2026-07-26

Command:
`npm test -- src/hooks/useAuth.test.tsx src/pages/Account.test.tsx`

Error:
Vitest failed `src/hooks/useAuth.test.tsx` before running tests because the mocked Supabase module referenced `signInWithOAuth` before initialization.

Likely cause:
`vi.mock` factories are hoisted, so the top-level mock function was unavailable when Vitest created the module mock.

Fix attempted:
Moved the OAuth spy into `vi.hoisted()` and referenced it through the hoisted mock object.

Result:
Resolved. `npm test -- src/hooks/useAuth.test.tsx src/pages/Account.test.tsx` passed after the hoisted mock fix.

Remaining issue:
None.

### M5.6 deterministic generator option literal widening

Date:
2026-07-26

Command:
`npm run build`

Error:
TypeScript rejected `src/data/questionGenerationFactory.ts` because deterministic generated option IDs widened to `string` instead of the `QuizOption["id"]` union.

Likely cause:
The returned option array did not have an explicit `QuizOption[]` annotation, so object literal IDs were widened inside the class method return inference.

Fix attempted:
Added an explicit `Omit<SourceGroundedQuestion, ...>` return type and a `QuizOption[]` annotation for deterministic options.

Result:
Resolved. `npm test -- src/data/questionGenerationFactory.test.ts`, `npm run validate:question-generation`, and `npm run build` passed.

Remaining issue:
None.

### M5.5 learning summary missing configuration steps

Date:
2026-07-22

Command:
`npm test -- src/data/learningSummaries.test.ts`
`npm run validate:learning-summaries`

Error:
Learning summary integrity failed with `missing-configuration-steps` for every draft workspace and immutable published version.

Likely cause:
The Knowledge Unit extraction helper only populated `procedures` when the supplied body contained the objective text exactly. The local M5.5 summary builder called the extractor without fixture body text, so configuration steps were empty.

Fix attempted:
Changed the Knowledge Unit extraction fallback so each objective emits a reviewable source-derived procedure when fixture body text is not available.

Result:
Resolved. `npm test -- src/data/learningSummaries.test.ts`, `npm run validate:learning-summaries`, and `npm run validate:source-ingestion` passed after the extractor fallback fix.

Remaining issue:
None.

### M5.4A knowledge graph TypeScript narrowing failure

Date:
2026-07-22

Command:
`npm run build`

Error:
TypeScript reported `node` is possibly `undefined` in `src/data/knowledgeGraph.ts` filter predicates after mapping graph edges back to optional nodes.

Likely cause:
The predicates used `Boolean(node) && node.kind === ...`, which did not narrow the optional node before reading `kind` under the active TypeScript settings.

Fix attempted:
Changed the predicates to explicit `node !== undefined` type guards before checking node kind.

Result:
Resolved. `npm test -- src/data/knowledgeGraph.test.ts` and `npm run build` passed after the type guard fix.

Remaining issue:
None.

### M5.2 rich item TypeScript narrowing failure

Date:
2026-07-22

Command:
`npm run build`

Error:
TypeScript rejected `src/utils/richItemScoring.ts` because item/answer union narrowing was insufficient, and `src/utils/richItemScoring.test.ts` used a readonly fixture that did not satisfy mutable `AssessmentItem` arrays.

Likely cause:
The first rich-item scoring implementation compared `item.type !== answer.type`, but TypeScript did not narrow both discriminated unions across all branches.

Fix attempted:
Rewrote scoring branches to narrow on both `item.type` and `answer.type`; changed the test fixture to avoid readonly `tags`.

Result:
Resolved. `npm test -- src/utils/richItemScoring.test.ts` and `npm run build` passed after the narrowing/type fixes.

Remaining issue:
None.

### M5.4 source ingestion Node crypto build failure

Date:
2026-07-22

Command:
`npm run build`

Error:
TypeScript could not resolve `node:crypto` from `src/data/sourceIngestion.ts`.

Likely cause:
The Vite frontend TypeScript configuration does not expose Node built-in module declarations for browser source files.

Fix attempted:
Replaced the Node crypto import with a deterministic browser-safe 64-character content hash helper for the local ingestion scaffold.

Result:
Resolved. `npm test -- src/data/sourceIngestion.test.ts`, `npm run validate:source-ingestion`, and `npm run build` passed after replacing the Node crypto import.

Remaining issue:
None.

## Format

### Failure title

Date:
Command:
Error:
Likely cause:
Fix attempted:
Result:
Remaining issue:

### M5.0 chained PowerShell status command rejected

Date:
2026-07-21

Command:
`git status --short && git remote -v`

Error:
PowerShell reported `The token '&&' is not a valid statement separator in this version.`

Likely cause:
The active PowerShell version does not support `&&` command chaining.

Fix attempted:
Re-ran the status and remote check using PowerShell statement separation.

Result:
Resolved. The local origin points to `https://github.com/BabsBBG/praxisgrid.git`.

Remaining issue:
None.

### M5.0 founder-data cleanup hash literal failed

Date:
2026-07-21

Command:
Mechanical PowerShell replacement map over Career Lab fixture files.

Error:
PowerShell rejected duplicate hash keys because hash literals are case-insensitive.

Likely cause:
The replacement map contained keys that differed only by case.

Fix attempted:
Re-ran the cleanup with an ordered replacement list instead of a hash literal.

Result:
Resolved. Founder-specific names and repo URLs were removed from the Career Lab fixture files and replaced with fictional instructional examples.

Remaining issue:
None.

### M5.0 Career Lab test role-query timeout

Date:
2026-07-21

Command:
`npm test`

Error:
`src/pages/JobReadiness.test.tsx` timed out on two tests after 5000 ms.

Likely cause:
The test used broad role queries across the expanded Career Lab page, which became slow after the M5.0 content and copy updates.

Fix attempted:
Replaced broad role assertions with direct text assertions for track names and direct `fireEvent.click` interactions for the focused answer flow.

Result:
Resolved. `npm test` passes with 10 test files and 18 tests.

Remaining issue:
None expected if the rerun passes.

### M5.0 PracticeArena hook-order lint failure

Date:
2026-07-21

Command:
`npm run lint`

Error:
ESLint reported 24 `react-hooks/rules-of-hooks` errors in `src/pages/PracticeArena.tsx`.

Likely cause:
The AZ-500 retirement screen returned before later hooks were declared.

Fix attempted:
Moved the inactive-cert return below the unconditional hook declarations.

Result:
Resolved. `npm run lint` passes.

Remaining issue:
None.

### M5.0 AZ-500 scan regex parse error

Date:
2026-07-21

Command:
`rg -n "cert=AZ-500|\[\)" ...`

Error:
ripgrep reported an unclosed regex group.

Likely cause:
The PowerShell/regex pattern was malformed while scanning for AZ-500 activation escape hatches.

Fix attempted:
Re-ran the scan with a simpler quoted pattern.

Result:
Resolved. Follow-up scan found no direct `arena?cert=AZ-500` activation links in active page/component/data files.

Remaining issue:
None.

### M5.0 Career Lab duplicate track-label test failure

Date:
2026-07-21

Command:
`npm test`

Error:
Testing Library found multiple elements with text such as `Azure Security` and `Detection Engineering`.

Likely cause:
The expanded Career Lab page shows track names in both the track selector and mapper controls.

Fix attempted:
Changed assertions to accept one or more visible instances for duplicated track labels.

Result:
Resolved. `npm test` passes with 10 test files and 18 tests.

Remaining issue:
None.

## Known previous failures

### M5.1 patch context mismatch

Date:
2026-07-21

Command:
`apply_patch` for source-grounding validator and Supabase policy hardening.

Error:
Patch verification failed because the expected SQL function context did not match the current file.

Likely cause:
The migration file had already been edited after the reviewer feedback, so the patch context was stale.

Fix attempted:
Reopened the relevant SQL/function sections and applied a narrower patch against the current context.

Result:
Resolved. Follow-up focused source-grounding validation, focused tests, and lint passed.

Remaining issue:
None.

### Netlify build instability

Problem:
Previous Netlify/GitHub deployment had dependency and build issues.

Decision:
Move frontend hosting to Vercel after harness reset.

### npm registry issue

Problem:
npm previously attempted to fetch from an internal non-public registry.

Required fix:
Ensure .npmrc contains:

```ini
legacy-peer-deps=true
audit=false
fund=false
registry=https://registry.npmjs.org/
```

### tsc not found

Problem:
Build previously failed when TypeScript compiler was unavailable.

Required fix:
Ensure TypeScript is installed as a devDependency and npm install runs before npm run build.

## M0 run failures

### ESLint 9 flat config missing

Date:
2026-07-13

Command:
`npm run lint`

Error:
ESLint 9 could not find an `eslint.config.(js|mjs|cjs)` file.

Likely cause:
The repo had an ESLint script and ESLint 9 dependency, but no flat config file.

Fix attempted:
Added `eslint.config.js` using the existing TypeScript parser and React Hooks/React Refresh plugins.

Result:
Initial config exposed one stale hook dependency suppression and attempted to lint generated declaration/config artifacts. Updated the hook dependencies in `src/pages/PracticeArena.tsx` and ignored generated declaration files.

Remaining issue:
Resolved. `npm run lint` passes.

### Vite large chunk warning

Date:
2026-07-13

Command:
`npm run build`

Error:
Not a failure. Vite warned that the main JavaScript chunk is larger than 500 kB after minification.

Likely cause:
The app is currently bundled as one large frontend surface with many routes and dependencies.

Fix attempted:
No fix attempted in M0 because the build passes and route-level code splitting is broader than harness reset scope.

Result:
Build passed and `dist` was generated.

Remaining issue:
Consider route-level dynamic imports or manual chunks in a future hardening milestone.

### npm install script approval warnings

Date:
2026-07-13

Command:
`npm install --legacy-peer-deps`

Error:
Not a failure. npm reported pending install-script approvals for `esbuild` and `sharp`.

Likely cause:
Current npm security behavior requires review for packages with install scripts.

Fix attempted:
No fix required for M0 because install completed successfully and build passed.

Result:
Install passed.

Remaining issue:
Review with `npm approve-scripts` if the project adopts strict install-script approvals.

### First dev server verification attempt did not respond

Date:
2026-07-13

Command:
`npm run dev -- --host 127.0.0.1 --port 5173`

Error:
Vite printed ready, but browser navigation timed out and `Invoke-WebRequest http://127.0.0.1:5173/` returned "Unable to connect to the remote server."

Likely cause:
The first Vite dev-server process did not bind/respond correctly in the local desktop environment.

Fix attempted:
Stopped that process and restarted Vite with `npm run dev -- --host 0.0.0.0 --port 5174`.

Result:
`Invoke-WebRequest http://localhost:5174/` returned `200`, and in-app browser verification passed for home, exam landing, and arena routes.

Remaining issue:
Resolved for local verification. Current dev server is running at `http://localhost:5174/`.

## M1 run failures

### M1.5 browser verification used production preview after dev HMR noise

Date:
2026-07-14

Command:
`npm run dev -- --host localhost`

Error:
The in-app browser logged Vite HMR websocket errors from `localhost:5173`.

Likely cause:
Local dev-server websocket/HMR transport noise in the desktop browser environment, not an application runtime error.

Fix attempted:
Verified the built app with `npm run preview -- --host localhost --port 4173` and filtered browser errors to `localhost:4173`.

Result:
Preview route checks passed with no current-page console errors. Arena warning, Microsoft disclaimer, flag/report placeholder, question content, and Finish Now were present after the loader.

Remaining issue:
None for the production build. The existing bundle-size warning remains.

### Subagent harness validation

Date:
2026-07-14

Command:
`npm run lint`, `npm run build`, `npm run validate:harness`, `npm run validate:questions`, `npm run check:routes`

Error:
No command failure. Browser visual verification initially used unsupported `networkidle` load-state waiting.

Likely cause:
The in-app browser automation surface supports `load` for this check, not `networkidle`.

Fix attempted:
Retried browser verification with supported `load` waiting and captured visual screenshots.

Result:
All validation commands passed. Browser screenshots were captured with no console errors.

Remaining issue:
The existing Vite large chunk warning remains; route-level code splitting is still future hardening work.

### ESLint scanned generated dev PWA output

Date:
2026-07-14

Command:
`npm run lint`

Error:
ESLint scanned `dev-dist/workbox-6cedd345.js` and failed on generated Workbox eslint-disable comments and missing TypeScript ESLint rule names.

Likely cause:
`dev-dist` was generated by Vite PWA dev verification and was ignored by git, but not ignored by ESLint.

Fix attempted:
Added `dev-dist/**` to `eslint.config.js` ignores.

Result:
Resolved. `npm run lint` passes.

Remaining issue:
None.

### M1.6 test run missing Testing Library DOM dependency

Date:
2026-07-14

Command:
`npm test`

Error:
Vitest failed before running the React component tests with `Cannot find module '@testing-library/dom'`.

Likely cause:
`@testing-library/react` expects `@testing-library/dom`, but the DOM package was not explicitly saved in the project.

Fix attempted:
Installed `@testing-library/dom` as a dev dependency and regenerated the lockfile.

Result:
Resolved. `npm test` now passes with 3 test files and 3 tests.

Remaining issue:
None expected.

### M1.6 dependency audit found Supabase package was not saved

Date:
2026-07-14

Command:
Subagent dependency audit and clean-install review.

Error:
`@supabase/supabase-js` was imported by the new auth foundation but was not listed in `package.json`, so clean CI installs would prune or omit it.

Likely cause:
The package had been installed locally during the milestone but not persisted as a runtime dependency after the required clean install.

Fix attempted:
Installed `@supabase/supabase-js` as a runtime dependency and regenerated the lockfile.

Result:
Resolved. Clean `npm install --legacy-peer-deps`, `npm run lint`, `npm test`, and `npm run build` pass.

Remaining issue:
None expected.

### M1.6 jsdom preview probe could not execute the Vite module bundle

Date:
2026-07-14

Command:
No-screenshot jsdom route probe against `http://127.0.0.1:4175/`.

Error:
The probe returned an empty body for SPA routes even though HTTP status checks passed and no jsdom errors were emitted.

Likely cause:
jsdom did not execute the production Vite module script as a real browser would.

Fix attempted:
Fell back to HTTP SPA route status checks and the existing build/route/import validation.

Result:
Partially resolved. The production preview serves SPA HTML for `/`, `/account`, `/cert/sc-300/readiness`, and `/cert/sc-300/knowledge`.

Remaining issue:
True automated browser verification was not available in this environment without adding another browser automation dependency.

### M1.6 agent-browser CLI unavailable

Date:
2026-07-14

Command:
`agent-browser --help`

Error:
PowerShell reported `agent-browser` was not recognized as a command.

Likely cause:
The agent-browser CLI is not installed on this machine or not on PATH.

Fix attempted:
Used no-screenshot HTTP route checks plus lint, tests, harness validation, route/import checks, and production build.

Result:
Resolved for this milestone verification path.

Remaining issue:
No screenshot or real-browser automated visual report was produced, per the user's instruction to only provide screenshots when requested.

### M1.6 global Vercel CLI unavailable

Date:
2026-07-14

Command:
`vercel --prod --yes`

Error:
PowerShell reported `vercel` was not recognized as a command.

Likely cause:
The Vercel CLI is not installed globally or is not on PATH.

Fix attempted:
Use `npx vercel --prod --yes` from the linked project instead.

Result:
Resolved. `npx vercel --prod --yes` deployed production successfully and Vercel aliased it to `https://azure-quest-pwa.vercel.app`.

Remaining issue:
None.

### M1.6 chained PowerShell git command rejected

Date:
2026-07-14

Command:
`git add KNOWN_FAILURES.md VERCEL_DEPLOYMENT.md && git commit -m "Record M1.6 deployment" && git push origin main`

Error:
PowerShell reported `&&` was not a valid statement separator.

Likely cause:
This PowerShell version does not support `&&` command chaining.

Fix attempted:
Run the Git add, commit, and push commands separately.

Result:
Resolved. Separate `git add`, `git commit`, and `git push` commands succeeded.

Remaining issue:
None.

### PowerShell route-label scan quoting failed

Date:
2026-07-14

Command:
`rg -n "label: \"(Learn|Docs|Videos|Flashcards|Study Mode)\"|Knowledge Check|Exam Readiness|Job Readiness" src`

Error:
PowerShell parsed part of the quoted expression as commands instead of passing the full regex to `rg`.

Likely cause:
The command mixed nested double quotes with PowerShell parsing rules.

Fix attempted:
Re-ran broader route and copy scans with safer quoting and explicit file targets.

Result:
Resolved. Follow-up scans completed and informed the M1.6 cleanup.

Remaining issue:
None.

### React hook dependency warning for focus tags

Date:
2026-07-14

Command:
`npm run lint`

Error:
`focusTags` was created as a fresh array on every render and made hook dependencies unstable.

Likely cause:
The URL `tags` parameter was parsed inline in `PracticeArena`.

Fix attempted:
Memoized parsed tags with `useMemo`.

Result:
Resolved. `npm run lint` passes.

Remaining issue:
None.

### Vercel inferred invalid project name

Date:
2026-07-14

Command:
`npx vercel deploy --prod --yes`

Error:
Vercel rejected the inferred project name from the local folder because project names must be lowercase.

Likely cause:
The local folder is named `Azure-Quest`.

Fix attempted:
Created an explicit lowercase Vercel project named `azure-quest-pwa` with `npx vercel project add azure-quest-pwa`, then linked with `npx vercel link --yes --project azure-quest-pwa`.

Result:
Resolved. Production deployment completed and was aliased to `https://azure-quest-pwa.vercel.app`.

Remaining issue:
None.

### Vercel project did not exist before migration

Date:
2026-07-14

Command:
`npx vercel deploy --prod --yes --project azure-quest-pwa`

Error:
Project `azure-quest-pwa` was not found in scope `tonybabalola-1114s-projects`.

Likely cause:
The app had not yet been created in the connected Vercel account.

Fix attempted:
Created the project, linked the workspace, and redeployed.

Result:
Resolved. Production deployment is READY.

Remaining issue:
None.

### PowerShell rejected chained git command

Date:
2026-07-14

Command:
`git add . && git commit -m "Harden M1 exam flow and deploy to Vercel"`

Error:
PowerShell reported `The token '&&' is not a valid statement separator in this version.`

Likely cause:
The active shell does not support `&&` command chaining.

Fix attempted:
Run `git add .` and `git commit` as separate commands.

Result:
Resolved by separate commands.

Remaining issue:
None.

### PowerShell mojibake cleanup command parse error

Date:
2026-07-14

Command:
Direct PowerShell string replacement for mojibake cleanup in `src`.

Error:
PowerShell rejected the command because the replacement string quoting was malformed.

Likely cause:
The command mixed encoded characters and quoted replacement strings in a way PowerShell parsed incorrectly.

Fix attempted:
Re-ran cleanup using safer `Get-Content -Raw` reads and explicit file writes.

Result:
Resolved. Follow-up scans found no remaining `Â`, `â`, or rejected playful-copy markers in `src`.

Remaining issue:
None.

### PowerShell recursive cleanup attempted directories

Date:
2026-07-14

Command:
Recursive PowerShell cleanup using `Get-ChildItem -Recurse -Include` over source paths.

Error:
PowerShell reported directory access/read errors while the cleanup loop attempted to process directories as files.

Likely cause:
The file enumeration was too broad and included directory entries.

Fix attempted:
Restricted cleanup to file content reads and then verified with targeted `rg` scans.

Result:
Resolved. No remaining mojibake markers were found in `src`.

Remaining issue:
None.

### M1.5 follow-up audit rejected first visual polish as insufficient

Date:
2026-07-14

Command:
Three-subagent M1.5 follow-up audit.

Error:
The UI/UX and QA/Product audits found release-blocking quality issues: Job Readiness and History still looked under-polished, global borders were too loud, low-bandwidth styling was overridden, and interview copy had cleanup regressions.

Likely cause:
The first design polish pass updated shared primitives and several pages but did not fully apply the design system to every high-traffic surface.

Fix attempted:
Applied a stronger Azure-blue system pass, softened borders, removed remote font import, fixed low-bandwidth behavior, reworked Job Readiness/History/Study/Readiness surfaces, added selected-state semantics, and repaired damaged copy.

Result:
Resolved. `npm run lint`, `npm run validate:harness`, `npm run validate:questions`, `npm run check:routes`, and `npm run build` pass. Production deployment `dpl_HHzPuV35C8ctFqh3sKV1ZytszX6p` is READY.

Remaining issue:
An already-open PWA tab can serve stale cached assets until refreshed, but the production alias network asset points at the new build.

### Local preview verification served stale PWA assets

Date:
2026-07-14

Command:
Browser DOM verification on `http://127.0.0.1:4173/`.

Error:
The DOM check did not show the new `aq-*` classes after rebuilding, even though the built files contained the updated CSS and markup.

Likely cause:
The previous local preview origin had an active PWA service worker/cache.

Fix attempted:
Started `vite preview` on a fresh port, `http://127.0.0.1:4174/`, and reran the route checks there.

Result:
Resolved. Fresh-port browser verification passed for Settings, Case Files, KQL Gym, Scenarios, and Flashcards with no app console errors.

Remaining issue:
None.

## M2-M5 continuation failures

### M2 Job Readiness build failed on invalid button variant

Date:
2026-07-14

Command:
`npm run build`

Error:
TypeScript rejected `variant="secondary"` on a shared `Button` because the design system supports `default`, `hero`, `success`, `danger`, `ghost`, and `soft`.

Likely cause:
The new Job Readiness completion panel used a variant name that does not exist in this repo.

Fix attempted:
Changed the button to `variant="soft"`.

Result:
Resolved. `npm run build` passed after the fix.

Remaining issue:
None.

### M2 Job Readiness test timed out on typed answer

Date:
2026-07-14

Command:
`npm test`

Error:
`src/pages/JobReadiness.test.tsx` timed out while `user.type` simulated a long interview answer character by character.

Likely cause:
The test was validating state flow but used slow per-character typing for a long textarea payload.

Fix attempted:
Switched the textarea update to `fireEvent.change` while keeping user clicks for the interactive controls.

Result:
Resolved. `npm test` passes with 8 test files and 13 tests.

Remaining issue:
None.

### M4 GitHub helper test had no localStorage shim

Date:
2026-07-14

Command:
`npm test`

Error:
`src/lib/githubProjectImport.test.ts` failed with `Cannot read properties of undefined (reading 'clear')`.

Likely cause:
The test environment did not expose `window.localStorage` for that helper test.

Fix attempted:
Added a small in-memory localStorage mock in the test before each run.

Result:
Resolved. `npm test` passes.

Remaining issue:
None.

### M2-M5 build large chunk warning

Date:
2026-07-14

Command:
`npm run build`

Error:
Not a failure. Vite warned that `dist/assets/index-CN66TbvX.js` is larger than 500 kB after minification.

Likely cause:
The app still ships most routes in one bundle.

Fix attempted:
No fix attempted in M2-M5 because the build passes and code splitting belongs in launch hardening.

Result:
Build passed and PWA assets were generated.

Remaining issue:
Consider route-level dynamic imports or manual chunks in M6.
