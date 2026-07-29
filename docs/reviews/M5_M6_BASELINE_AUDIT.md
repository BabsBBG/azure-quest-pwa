# M5/M6 Baseline Audit

Date: 2026-07-26

Branch: `codex/m5-m6-production-hardening`

Baseline commit: `a12ba2c Record Google SSO deployment`

Status: BASELINE COMPLETE - NOT PRODUCTION SIGNED OFF

## Starting Repository Condition

- Worktree was clean before the M5/M6 programme branch was created.
- Current branch is `codex/m5-m6-production-hardening`.
- Latest green `main` GitHub Actions run before the branch: `30203646990`.
- Current production Vercel project is still `azure-quest-pwa`.
- Current production alias is still `https://azure-quest-pwa.vercel.app`.
- Current production deployment inspected as READY: `dpl_3p6upUV5Ve7Bxw6VBdBjvyY7Jyzk`.
- `.env.example` contains only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` placeholders.
- Vercel reported no configured environment variables for the linked project during baseline.
- Local `.env.local` exposes only `VERCEL_OIDC_TOKEN` by name in this environment.
- Supabase CLI is not installed locally, so live migration/RLS validation is externally blocked.

## Baseline Validation

The existing suite passed before implementation edits:

- `npm ci`
- `npm run lint`
- `npm test`
- `npm run validate:harness`
- `npm run validate:questions`
- `npm run validate:source-grounding`
- `npm run validate:source-ingestion`
- `npm run validate:knowledge-graph`
- `npm run validate:learning-summaries`
- `npm run validate:question-generation`
- `npm run validate:content-orchestration`
- `npm run validate:question-critic`
- `npm run validate:source-impact`
- `npm run validate:admin-review-studio`
- `npm run validate:curated-domain-quizzes`
- `npm run validate:finite-runs`
- `npm run validate:content-quality-reports`
- `npm run validate:duplicates`
- `npm run validate:authorization`
- `npm run validate:rich-items`
- `npm run check:routes`
- `npm run build`

Known baseline warning:

- Vite reports the main JS chunk is larger than 500 kB after minification.

## Production-Complete In Repo

- PraxisGrid naming, tagline, local storage namespace migration, and provider-neutral disclaimer exist.
- AZ-500 is marked retiring with new activation blocked.
- Static demo/seed question-bank warnings exist on core quiz and certification landing flows.
- Local-first persistence exists through Zustand/localForage.
- Supabase client integration exists and preserves session detection.
- Email/password auth and Google SSO are implemented through Supabase client APIs.
- M5 SQL migrations exist through `0017`.
- Static validators exist for the M5 scaffold.
- Public GitHub import uses a server endpoint and avoids write/private scopes.

## Implemented But Unverified

- Supabase Auth is implemented in code, but production env vars and provider redirects were not configured in Vercel at baseline.
- Supabase migrations and RLS policies exist, but live migration application and live RLS probes are unverified.
- Assessment session recovery exists in local/cloud-best-effort form, but browser recovery is not proven by E2E.
- Cloud sync is best-effort and intentionally swallows some failures.
- Admin Review Studio exists at `/admin`, but runtime auth/role protection is missing.
- Curated quizzes and finite runs exist structurally, but most placements are blocked by missing approved source-grounded content.
- Rich item scoring and walkthrough exist, but real domain quizzes and certification runs still do not fully use every rich item type.

## Scaffold, Static, Or Fixture-Only

- The 600-question bank remains static demo/seed content.
- Source docs, chunks, approved questions, embeddings, generation runs, learning summaries, knowledge graph, critic output, source impact, curated quiz structures, and finite certification runs are local/static fixtures or deterministic scaffolds.
- Source ingestion uses a fixture adapter, not a live Microsoft Learn ingestion job.
- Question generation uses a deterministic test generator with production generation disabled.
- GitHub project story creation is deterministic README-based drafting, not production Project Intelligence.
- `/admin` uses static queues/actions and does not mutate protected live data.

## Missing

- Mandatory public authentication and `/auth` route.
- Post-signup onboarding.
- Learn, Practise, Prove primary learner IA.
- Dedicated full-screen Assessment Shell.
- Analytical Results export experience.
- Durable authenticated GitHub import limits/cache.
- Private repository connection through a read-only GitHub App/OAuth flow.
- Project Intelligence results workspace.
- Repository-backed Interview Studio integration.
- Live Admin Control Centre operations for M6.0 through M6.12.
- Playwright, WebKit, mobile, accessibility, visual, and production-smoke gates.
- Live migration, RLS, repository-isolation, production-content, and assessment-shell validators.
- Canonical PraxisGrid Vercel project/domain.

## Broken Or Production Blocking

- `/admin` is publicly routable and presents protected-admin language/actions without runtime auth or role checks.
- Secondary assessment-like surfaces such as KQL Gym do not consistently show the demo/seed notice before practice and may reveal explanations before completion.
- Public app still supports logged-out demo practice, contrary to the new production instruction.
- Vercel production has no Supabase env vars configured, so public auth cannot be production-verified.
- Static validators can pass while runtime route protection, browser rendering, and RLS are unproven.

## Externally Blocked

- Live Supabase migration application and RLS testing require a connected Supabase project and CLI/API access.
- Google SSO requires Supabase provider configuration plus Google Cloud OAuth callback configuration.
- Production canonical URL rename requires Vercel project/domain availability and settings access.
- Repository metadata/About update requires GitHub repository settings permission.

## Senior Role Baseline

- Principal Engineer: FAIL for production; strong scaffold, but live backend/admin/source-content gates remain open.
- Product Designer: FAIL for production UX; learner IA, admin, account lifecycle, secondary practice surfaces, and mobile/browser validation need hardening.
- Security/Data/Governance QA: FAIL for production; live RLS, role boundaries, durable rate limits, privacy workflows, and cloud deletion/export are not verified.
- Product/UX/Accessibility QA: FAIL for production; Playwright, axe, visual, mobile, and production smoke gates are missing.

## Baseline Conclusion

PraxisGrid is a credible M5 scaffold with passing local/static validators, but it is not production-complete under the new M5/M6 instruction. M5 is reopened for production hardening. Phase 6 is approved but must not be marked complete until the live, browser, accessibility, admin, content, privacy, and production gates pass.
