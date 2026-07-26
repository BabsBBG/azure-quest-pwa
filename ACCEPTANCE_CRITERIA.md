# ACCEPTANCE_CRITERIA.md

## Global completion rule

A milestone is not complete unless:

- Required commands pass.
- CURRENT_STATE.md is updated.
- KNOWN_FAILURES.md is updated.
- Known blockers are documented.
- No future milestone work is mixed into the current milestone without approval.

## M0 - Vercel migration + harness reset

M0 is complete only if:

- AGENTS.md exists.
- PRODUCT_SPEC.md exists.
- ARCHITECTURE.md exists.
- SECURITY.md exists.
- ACCEPTANCE_CRITERIA.md exists.
- CURRENT_STATE.md exists.
- KNOWN_BLOCKERS.md exists.
- KNOWN_FAILURES.md exists.
- IMPLEMENTATION_PLAN.md exists.
- TESTING_STRATEGY.md exists.
- VERCEL_DEPLOYMENT.md exists.
- vercel.json exists.
- .npmrc is clean.
- .nvmrc uses Node 20.
- npm install --legacy-peer-deps passes.
- npm run build passes.
- dist is generated.
- SPA refresh routes do not 404.
- The current question bank is visibly labelled as demo/seed content.
- Provider-neutral non-affiliation disclaimer is visible on relevant pages.

## M0/M1 blocking question-bank criterion

The app must visibly label current quizzes/certification runs as demo/seed practice content until the approved source-grounded question pipeline exists.

The label must appear:

- Before starting a quiz.
- Before starting a certification run.
- On practice/exam landing screens.
- Near the general disclaimer.

Completion is blocked if the current static question bank appears to users as official, complete, source-grounded, or production-grade.

Required copy or equivalent:

"Demo practice bank: These questions are seed content for testing the platform. They are not official certification-provider exam questions and are not yet fully source-grounded or reviewed."

## M1 - Exam engine hardening

M1 is complete only if:

- Learn/Docs/Videos are removed from active navigation.
- Main navigation uses Home, Learn, Domain Quizzes, Career Lab, Progress, and Account.
- Answers are hidden until quiz/exam completion.
- Timer counts down.
- Finish Now works.
- Unanswered questions count as incorrect.
- Attempt history saves.
- History separates quizzes and exams.
- Retake same seed works.
- New randomized attempt works.
- Domain heatmap updates after completion.
- Static duplicate-check script exists.
- Duplicate validation checks approved source-grounded records strictly before they can replace seed content.
- Question flag/report UI placeholder exists.
- Demo/seed question-bank warning remains visible.

## M1.6 - User accounts + Azure-blue visual/icon/font system + tests/CI hardening

M1.6 is complete only if:

- Supabase email/password sign up exists.
- Supabase email/password sign in exists.
- Supabase Google SSO exists without frontend Google secrets.
- Sign out exists.
- Auth state persists across refresh through the Supabase client.
- Logged-out users can still use local/demo practice.
- Account/Profile page exists.
- `.env.example` exists with placeholder Supabase values only.
- `AUTH_SETUP.md` documents setup and scope.
- No secrets are committed.
- Active nav uses Home, Learn, Domain Quizzes, Career Lab, Progress, and Account.
- Knowledge/quiz surfaces are not labelled as official content.
- Demo/seed question-bank warning remains visible before quiz/certification-run start.
- Provider-neutral non-affiliation disclaimer remains visible.
- Azure-blue visual direction is documented and applied globally.
- Monospace developer/security font stack is documented and applied globally.
- `lucide-react` is documented as the open-source icon system.
- GitHub Actions CI exists.
- Build, lint, test, harness validation, question-bank validation, and route checks pass locally.

## M2 - Career Lab engine

M2 is complete only if:

- Track selector exists.
- Project selector exists.
- 30-minute mock interview session can be started.
- Supported tracks include IAM, Cloud Security, SOC, Cloud SOC, Azure Security, Detection Engineering, AI Security.
- Session shows realistic interview questions.
- User can answer textually.
- After answer, app shows what the question tests, strong answer structure, what to say, follow-up traps, mistakes to avoid, and project reference where applicable.
- Self-score rubric appears.
- Interview session can be completed.
- Interview history is saved locally or documented as pending backend.

## M3 - Supabase foundation

M3 is complete only if Supabase auth, profiles, quiz attempts, interview sessions, question flags, and RLS are implemented while preserving local fallback.

## M4 - GitHub project import

M4 is complete only if GitHub import uses minimal permissions, no write scopes, manual repo selection, README/language import, rate limits, content-hash caching, server-side story draft creation, and draft review/approval.

## M5.0 - PraxisGrid foundation

M5.0 is complete only if:

- Product surfaces and PWA metadata use PraxisGrid.
- The approved tagline appears in brand metadata or visible product chrome.
- Provider-neutral disclaimers replace Microsoft-only affiliation language on active surfaces.
- Legacy `azure-quest:*` local storage is preserved through migration/fallback.
- GitHub remote points to `BabsBBG/praxisgrid`.
- Founder-specific project fixtures are removed from active Career Lab data.
- AZ-500 is RETIRING with retirement date 2026-08-31, historical progress preserved, and new activation routed toward SC-500.
- Role foundations exist for MAIN_ADMIN, CONTENT_REVIEWER, SUPPORT_ADMIN, and USER without hardcoded frontend admin emails.
- Required install, lint, test, validation, and build commands pass.

## M5 - Source-grounded question pipeline

M5 continuation is complete only if Microsoft Learn / MicrosoftDocs source docs, source chunks, cached embedding hashes, batch generation run controls, automated critic notes, admin review status, duplicate detection, validation, and approved-only serving exist.

M5 duplicate detection is complete only if approved source-grounded records fail validation on duplicate fingerprints or duplicate approval keys. Seed/demo duplicate checks may warn, but approved source-grounded duplicates must fail.

Production replacement of the demo/seed question bank remains blocked until the source-grounded pool is generated at full coverage and reviewed by an admin/human reviewer.

## M4/M5 cost-control blocking criterion

GitHub import, project story generation, Microsoft Learn ingestion, embeddings, and question generation are blocked unless rate limits, content-hash caching, and server-side-only LLM execution are implemented.

No LLM-backed feature may be considered complete without:

- rate limiting
- caching
- server-side secret handling
- budget cap or kill switch
- failure logging
