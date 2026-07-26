# M5/M6 Defect Ledger

Date opened: 2026-07-26

Status: OPEN

No S1 or S2 defect may remain before M5 production hardening or Phase 6 completion sign-off.

| ID | Severity | Reporter | Route or subsystem | Expected behaviour | Actual behaviour | Root cause | Fix | Retest result | Final status |
|---|---|---|---|---|---|---|---|---|---|
| M5M6-DEF-001 | S1 | Principal Engineer, Product QA | `/admin` | Admin routes require authenticated role checks before protected data/actions render. | `/admin` is publicly routable and presents protected admin language/actions without runtime auth/role gating. | Admin Review Studio is a static scaffold mounted directly in `App.tsx`. | Pending. | Pending. | Open |
| M5M6-DEF-002 | S1 | Principal Engineer | Source-grounded content | Trusted certification practice is served from live approved source-grounded records. | Approved records are local/static fixtures and the 600-question seed bank remains the practical learner bank. | M5 source pipeline is implemented as local scaffolding and migrations, not production ingestion/review/publish runtime. | Pending. | Pending. | Open |
| M5M6-DEF-003 | S1 | Security/Data/Governance QA | Supabase/RLS | Migrations are applied and RLS boundaries are live-tested with MAIN_ADMIN, CONTENT_REVIEWER, SUPPORT_ADMIN, USER_A, and USER_B. | SQL exists, but live Supabase migration/RLS verification is externally blocked. | Supabase CLI/project access and configured test users are not available in this baseline. | Pending. | Pending. | Open |
| M5M6-DEF-004 | S1 | Principal Engineer, Security QA | GitHub import | Repo import limits/cache are durable and scoped to authenticated users. | API uses in-memory maps and IP-based rate buckets that reset per server instance. | Serverless endpoint has no durable store/session-aware limiter. | Pending. | Pending. | Open |
| M5M6-DEF-005 | S1 | Product Designer, Product QA | Secondary practice surfaces | Every assessment-like public surface shows trust copy before start and hides answers/explanations until completion. | KQL Gym and other secondary practice surfaces can show explanations immediately or lack the shared pre-start notice. | Secondary learning/practice routes were not brought under the same assessment trust contract. | Pending. | Pending. | Open |
| M5M6-DEF-006 | S2 | Product Designer | Mobile learner IA | Mobile learner navigation uses exactly Learn, Practise, Prove and never wraps at 320px. | Existing mobile nav remains crowded and still carries more destinations. | Old M1 navigation model remains active. | Pending. | Pending. | Open |
| M5M6-DEF-007 | S2 | Product Designer | Career Lab / Interview Studio | In-progress interview work is recoverable. | Active answers/timer/session state are component-local and persist only on completion. | Career Lab lacks active session persistence and recovery flow. | Pending. | Pending. | Open |
| M5M6-DEF-008 | S2 | Product QA | Test gates | Browser, mobile, WebKit, axe, visual, and production smoke gates run in CI. | Current QA is Vitest plus static validators; no Playwright/axe/visual gate exists. | Runtime verification infrastructure has not been added. | Pending. | Pending. | Open |
| M5M6-DEF-009 | S2 | Security/Data/Governance QA | Support role boundary | SUPPORT_ADMIN can access support queues without editorial publishing authority. | Content-quality report RLS is review/admin-oriented and does not cleanly expose a support queue boundary. | Role capabilities are not separated consistently across content-quality tables. | Pending. | Pending. | Open |
| M5M6-DEF-010 | S2 | Security/Data/Governance QA | Privacy workflows | Users can export/delete account-owned cloud data and repository analyses safely. | Local export/reset exists, but cloud export/delete workflows and verification are missing. | M3/M4 sync tables were added without full M6 privacy operations. | Pending. | Pending. | Open |
| M5M6-DEF-011 | S2 | Product/UX QA | Production auth | Public production has configured Supabase auth and no logged-out demo practice. | Vercel env list reports no Supabase env vars, and the app still supports logged-out local demo practice. | Production environment and route protection are not yet configured for mandatory auth. | Pending. | Pending. | Open |
| M5M6-DEF-012 | S3 | Principal Engineer | Bundle performance | Main production bundle is reasonably split. | Vite reports a main JS chunk above 500 kB. | Routes and admin surfaces are not lazy-loaded. | Pending. | Pending. | Open |

## Retest Protocol

Each defect must be retested with the narrowest meaningful check and then with the full required validation suite before final sign-off.
