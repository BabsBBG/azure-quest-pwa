# TESTING_STRATEGY.md

## Current testing goal

The current priority is M5 production hardening followed by Phase 6 release validation: mandatory auth, onboarding, Learn/Practise/Prove IA, protected Admin, source-grounded content governance, repository isolation, privacy workflows, browser E2E, accessibility, visual review, production smoke, and live Supabase/RLS verification.

## M0 checks

Required commands:

```bash
npm install --legacy-peer-deps
npm run build
```

Manual checks:

- App loads.
- Main routes load.
- SPA refresh does not 404.
- Demo/seed question warning is visible before quizzes/exams.
- Microsoft disclaimer is visible.
- Dark/light toggle visible.
- No broken imports.
- No console-breaking runtime errors on main pages.

## Future automated checks

Current scripts:

- validate-harness.mjs
- validate-question-bank.mjs
- validate-source-grounding.mjs
- check-routes.mjs
- `npm run typecheck`
- `npm run test:integration`
- `npm run test:e2e`
- `npm run test:e2e:chromium`
- `npm run test:e2e:webkit`
- `npm run test:e2e:mobile`
- `npm run test:accessibility`
- `npm run test:visual`
- `npm run test:production-smoke`
- `npm run validate:routes`

Current Vitest coverage:

- score calculation
- unanswered questions count wrong
- demo/seed warning and Microsoft disclaimer render
- auth/account UI renders in logged-out unconfigured mode
- M2 job readiness tracks and interview answer workflow
- M3 cloud sync fallback when Supabase is unconfigured
- M4 GitHub URL parsing and local public import cap
- M5 approved-only source-grounded question serving

Current CI:

- npm install --legacy-peer-deps
- npm run typecheck
- npm run lint
- npm test
- npm run test:integration
- node scripts/validate-harness.mjs
- node scripts/validate-question-bank.mjs
- node scripts/validate-source-grounding.mjs
- node scripts/check-routes.mjs
- npm run test:e2e:chromium
- npm run test:e2e:webkit
- npm run test:e2e:mobile
- npm run test:accessibility
- npm run test:visual
- npm run build
- npm run test:production-smoke on `main` when GitHub Actions variable `PRODUCTION_BASE_URL` is configured

## Required M5/M6 E2E and Production Checks

Added scripts:

- `npm run typecheck`
- `npm run test:integration`
- `npm run test:e2e`
- `npm run test:e2e:chromium`
- `npm run test:e2e:webkit`
- `npm run test:e2e:mobile`
- `npm run test:accessibility`
- `npm run test:visual`
- `npm run test:production-smoke`
- `npm run validate:routes`

Missing scripts to add during the programme:

- `npm run validate:migrations`
- `npm run validate:rls`
- `npm run validate:assessment-shell`
- `npm run validate:project-fixtures`
- `npm run validate:repository-isolation`
- `npm run validate:production-content`

Required browser flows:

Test flows:

- Unauthenticated root redirects to signup.
- Signup, email verification state, sign-in, password recovery, logout, and data restoration.
- Onboarding and active certification selection.
- Learn, Practise, and Prove navigation on mobile and desktop.
- Public repository submission and Project Intelligence results.
- Interview Studio from a selected project.
- Domain Quiz and Certification Run with rich item types, mark for review, refresh recovery, submission review, results, export, and report-a-question.
- Admin denial and role-specific Admin journeys.

Live Supabase checks must cover real sign up/sign in/sign out, migrations, RLS, role boundaries, user isolation, repository deletion, and account deletion against a test project before production sign-off.
