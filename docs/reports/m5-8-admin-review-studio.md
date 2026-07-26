# M5.8 Separate PraxisGrid Admin Review Studio

Status: complete in repo; live role-auth verification pending in M5.12.

## Implemented

- Added separate `/admin` route outside the learner layout.
- Added `src/pages/AdminReviewStudio.tsx`.
- Added persistent admin sidebar, utility bar, dense queue cards, review table, split-pane review, sticky actions, audit timeline, warning banner, and responsive layout.
- Added visible role boundaries for Main Admin, Content Reviewer, Support Admin, and User access expectations.
- Connected the admin scaffold to existing M5 content systems:
  - Content orchestration workflow.
  - Question critic report.
  - Source impact graph and replacement job.
  - Published learning summaries.
- Added `scripts/validate-admin-review-studio.mjs` and CI coverage.
- Updated route validation for `/admin`.

## Preserved

- Learner navigation and layout remain unchanged.
- Admin actions are scaffolded and do not publish content automatically.
- Microsoft/provider-neutral non-affiliation disclaimer remains visible.
- No payments, private repo import, GitHub write scopes, or learner-path LLM calls were added.

## Remaining M5.12 verification

- Verify route accessibility in browser.
- Verify live Supabase role gating once migrations are applied.
- Connect real admin auth session role checks after live backend configuration is available.
