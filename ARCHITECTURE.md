# ARCHITECTURE.md

## Current architecture

The current app is a frontend-first PWA with a Supabase-backed production architecture under active M5/M6 hardening.

Stack:

- React
- TypeScript
- Vite
- Tailwind
- Zustand
- localForage
- Static JSON data
- PWA support

Current storage:

- localForage for local attempts/progress.
- Static questions from src/data/questions.json.
- Static job readiness data from src/data/jobReadiness.ts.

Current backend/account foundation:

- Supabase Auth client for email/password accounts.
- Supabase OAuth path for Google SSO.
- Auth configuration is read from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Supabase is used for best-effort local-first sync of profiles, quiz attempts, interview sessions, question flags, and imported projects when configured.
- Logged-out/local mode remains supported in the current implementation, but public production must now move to mandatory authentication with development/test-only local fixture behavior.
- Vercel serverless functions are used for public GitHub repository import and draft story creation.

## Hosting

Frontend hosting target:

- Vercel

Build output:

- dist

## M5/M6 production backend requirements

The reopened M5 and approved Phase 6 programme require:

- Live Supabase migration application and RLS verification.
- Mandatory public authentication, onboarding, and route protection.
- Role-gated Admin APIs and operational Admin data access.
- Durable per-user repository import limits, content-hash caching, deletion, and auditability.
- Server-side-only generation/analysis jobs with budget caps, kill switches, failure logs, and no client-side provider secrets.
- Privacy workflows for data export, account deletion, repository-analysis deletion, and GitHub disconnect.
- Production smoke, browser, accessibility, visual, migration, RLS, repository-isolation, and production-content validation.

## Production question pipeline

Production-grade question flow:

1. Ingest official Microsoft Learn / MicrosoftDocs content.
2. Store source documents.
3. Chunk source documents.
4. Cache embedding hashes for chunks.
5. Generate scenario-style candidates in batch/admin runs.
6. Run automated critic.
7. Send to admin review.
8. Approve questions.
9. Serve only approved questions.

No live LLM question generation should happen during user quiz/exam attempts.

## Future GitHub project flow

1. User signs in.
2. User selects public GitHub repo.
3. System imports README and language data.
4. Server-side LLM drafts project story.
5. User reviews/edits.
6. User approves.
7. Approved story feeds interview simulator.

## Local fallback rule

Until Supabase is fully implemented, localForage/Zustand must remain working.

Do not break offline/local attempt history while migrating.
