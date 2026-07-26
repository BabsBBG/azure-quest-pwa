# Subagent Audit

## Purpose

This report collects historical findings from the PraxisGrid subagent harness:

- UI/UX Revamp Lead
- Senior Software Engineer
- QA and Product Lead

## Current Status

Initial subagent audit requested on 2026-07-14.

Three subagents completed read-only audits:

- UI/UX Revamp Lead: Kepler
- Senior Software Engineer: Faraday
- QA and Product Lead: Epicurus

## UI/UX Revamp Lead Findings

Top issues:

- Current UI is still blue-heavy, glassy, rounded, and gradient-driven, while product guidance calls for white, dark green, neutral greys, and a quieter premium feel.
- Some language is too playful for a cybersecurity credibility product, including labels such as Daily Boss, Pick your fighter, Swipe Cards, and Cozy cyber cave.
- Navigation is mostly aligned, but mobile labels had been shortened and should match the approved vocabulary.
- Major pages rely on many similar cards, badges, and bold text, weakening scan hierarchy.
- Demo/seed and Microsoft disclaimer messaging is present, but should be integrated into a calmer trust hierarchy.

Recommended improvements:

- Create restrained design tokens for dark green, neutral surfaces, subtle borders, fewer gradients, and consistent radii.
- Replace playful copy with professional language.
- Normalize navigation labels across desktop and mobile.
- Improve exam-flow hierarchy around timer, question count, answered count, Finish Now, flag/report, and demo warning.
- Redesign readiness/history as analytical dashboards with clearer filters and heatmap explanation.

Most affected files/pages:

- `src/components/Layout.tsx`
- `src/pages/PathHome.tsx`
- `src/pages/CertHome.tsx`
- `src/pages/KnowledgeCheck.tsx`
- `src/pages/PracticeArena.tsx`
- `src/pages/Readiness.tsx`
- `src/pages/PastExams.tsx`
- `src/pages/JobReadiness.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/badge.tsx`

## Senior Software Engineer Findings

Top risks:

- Attempt persistence could fail silently because the UI marked a run saved before `recordAttempt` completed.
- M1 behavior is mostly implemented but under-tested.
- Mobile navigation labels needed to match acceptance wording.
- Demo/seed warning coverage should extend to every practice-start surface that can create attempts.
- Duplicate question validation currently warns but does not fail.

Technical debt:

- `PracticeArena` owns a large amount of state and workflow behavior and is the highest-value refactor/test target.
- Weighted question selection assumes sane domain weights.
- ESLint and TypeScript checks are still minimal.
- Route smoke script lists routes but does not render them.

Recommended implementation slices:

- Await attempt persistence and surface save errors.
- Add focused tests for scoring, unanswered questions, retake URLs, randomized URLs, and history grouping.
- Add a real route/browser smoke check.
- Split duplicate checking into warn and strict modes.
- Normalize navigation labels and remove stale Learn/Docs/Videos paths from active surfaces.

## QA and Product Lead Findings

Top product gaps:

- Mobile nav labels should exactly match Exams, Exam Readiness, Job Readiness, History, Settings.
- Cert landing should show the demo-bank warning because it introduces quizzes, mocks, and readiness.
- Legacy dashboard still linked to `/learn`.
- M2 job-readiness gaps remain: Detection Engineering, typed answers, session completion, and interview history.
- Duplicate checker is visibility-only.

Critical journeys:

- Start quiz/mock from cert exam page, see demo-bank warning and Microsoft disclaimer, complete run, then review answers.
- Finish Now with unanswered questions and verify unanswered scores wrong.
- Complete exam, verify History entry, domain report, readiness update, retake same seed, and new randomized run.
- Use Job Readiness from track selection through answer coaching and self-score rubric.
- Reset/export local data from Settings without breaking hydration/history.

Acceptance tests needed:

- E2E quiz completion and Finish Now with unanswered questions.
- E2E timer countdown/auto-finish.
- E2E History sections for exams, quizzes, and labs.
- E2E retake seed equality and new randomized difference.
- E2E demo-bank warning and Microsoft disclaimer visibility.
- Unit tests for `scoreAttempt`, `pickQuestions`, readiness/domain aggregation, and question-bank validation behavior.

## Immediate Actions Taken

- Added subagent role briefs under `docs/agents/`.
- Updated `AGENTS.md`, `IMPLEMENTATION_PLAN.md`, and `ROADMAP.md` with the three-role subagent operating model.
- Normalized mobile navigation labels to the approved wording.
- Added the demo-bank warning to cert landing pages.
- Removed the stale `/learn` call-to-action from the legacy dashboard.
- Hardened attempt persistence so save errors are surfaced and retryable.

## M1.5 Follow-Up Audit

Follow-up audit requested on 2026-07-14 after the first M1.5 visual pass was judged too timid.

Three subagents completed read-only audits:

- UI/UX Revamp Lead: Volta
- Senior Software Developer: Cicero
- QA and Product Lead: Huygens

Release-blocking or high-impact findings:

- Job Readiness still carried the weakest polish, including violet accents, oversized rounded panels, old slate-heavy selected states, and heavy typography.
- History attempt cards lagged behind the newer landing surfaces.
- Global Azure borders were too saturated and the page background was too busy.
- A remote Google font import was risky for PWA/offline and low-bandwidth behavior.
- Low-bandwidth mode was visually overridden by the richer page shell.
- Selectable Job Readiness buttons lacked explicit selected-state semantics.
- Mojibake cleanup damaged interview coaching copy with strings such as `thinking-not`, `notifications-all`, `gaps-stale`, `done-in`, and `principal-is`.
- Study Mode still had childish learner-facing copy: Explain Like I'm 5 and Next bite.
- Readiness trend copy used developer shorthand: `-> same`.

Follow-up actions taken:

- Removed the remote font import and moved to a professional system font stack.
- Softened Azure borders, reduced shadows, and simplified page backgrounds.
- Fixed low-bandwidth mode so it bypasses the richer page shell.
- Reworked Job Readiness, History, Study Mode, and Readiness copy/styling to match the M1.5 professional tone.
- Extended the same Azure-blue system to secondary routes including Dashboard, Settings, Case Files, KQL Gym, Scenarios, Docs, Videos, Learn Tracker, Learning Content, and Flashcards.
- Added `aria-pressed` to key selectable Job Readiness controls.
- Fixed the damaged interview coaching copy.
- Re-ran lint, harness validation, question validation, route checks, and production build.

## Recommended Next Step

Finish M1 hardening by adding automated tests for exam scoring, Finish Now, history grouping, retake seed behavior, and demo-warning visibility.

## M1.6 Account and CI Hardening Audit

M1.6 audit requested on 2026-07-14 while adding account/profile auth, Azure-blue visual system hardening, icon/font decisions, and CI tests.

Three subagents completed read-only audits:

- UI/UX Revamp Lead: Banach
- Senior Software Engineer: Helmholtz
- QA and Product Lead: Pauli

Release-blocking or high-impact findings:

- Exams/readiness launched a weighted mock without showing the demo/seed bank warning on that route.
- Signed-in Account/Profile actions could set errors that were not rendered in the signed-in state.
- `@supabase/supabase-js` was imported but not saved as a runtime dependency.
- `@testing-library/dom` was missing, causing Vitest React tests to fail before execution.
- CI did not explicitly restrict the default GitHub token to read-only contents access.

Follow-up actions taken:

- Added `QuestionBankNotice` to the Exams/readiness route before mock launch CTAs.
- Rendered signed-in Account/Profile errors and added account form autocomplete attributes.
- Saved `@supabase/supabase-js` and `@testing-library/dom` in `package.json`.
- Added top-level `permissions: contents: read` to the CI workflow.
- Removed the stale deploy-fork workflow that depended on a GitHub PAT.
- Renamed remaining user-facing links from Knowledge/Interview readiness to Quiz/Job Prep where they crossed active M1.6 surfaces.

## Google SSO Account Audit

Google SSO audit requested on 2026-07-26 for the existing Supabase account foundation.

Three subagents completed read-only audits:

- UI/UX Revamp Lead: Galileo
- Senior Software Engineer: Hubble
- QA and Product Lead: Cicero

Release-blocking or high-impact findings:

- Google SSO must use Supabase OAuth only, with no Google SDK, frontend OAuth secret, or separate identity stack.
- Google OAuth secrets belong in Supabase/Google provider settings, not `.env.example` or Vite variables.
- The Account page should present Google as a neutral SSO option, preserve local/demo fallback, and avoid implying affiliation with Google or certification providers.
- Google profile metadata should tolerate `name` as well as `full_name`.
- Live provider and redirect allow-list verification remains required before production Google sign-in can be considered externally verified.

Follow-up actions taken:

- Added `signInWithGoogle` to the auth provider using `supabase.auth.signInWithOAuth({ provider: "google" })`.
- Added a neutral "Continue with Google" action on the logged-out Account page while preserving disabled local-mode behavior.
- Added provider-neutral sign-in copy near the auth actions.
- Updated auth setup, security, acceptance, and current-state docs with Google SSO scope and secret-handling rules.
- Added focused tests for the disabled local-mode Google button and Supabase OAuth call shape.
