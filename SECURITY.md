# SECURITY.md

## Security principles

- No secrets in frontend code.
- No LLM API keys in client-side code.
- No GitHub write permissions in v1.
- No unnecessary OAuth scopes.
- User data must be protected by RLS before cloud profile or attempt data is trusted.
- LLM-generated content must be labelled as draft until reviewed or approved.
- Assessment questions must not be represented as official certification-provider questions.

## Provider-neutral disclaimer

The app must show:

"PraxisGrid is an independent learning platform and is not affiliated with, endorsed by, or sponsored by Microsoft, Amazon Web Services, Google Cloud, or other certification providers."

This must appear on:

- Footer.
- Practice start page.
- Certification run start page.
- Question review page where appropriate.

## GitHub permissions

For v1:

- Prefer public repo import.
- Do not request write scopes.
- Do not request private repo access unless explicitly approved in a future milestone.

## LLM safety

LLM calls must be:

- Server-side only.
- Rate-limited.
- Cached where possible.
- Logged for failure.
- Blocked by budget caps for batch jobs.

## Cost, abuse, and rate-limit controls

LLM-backed and GitHub-backed features introduce financial and abuse risk.

Any feature that calls an LLM, imports GitHub repositories, generates questions, creates project stories, embeds content, or processes Microsoft Learn source material must include rate limits, content-hash caching, server-side secret handling, a budget cap or kill switch, and failure logging before it is considered complete.

Controls required before public launch:

- GitHub repo import capped per user per day.
- Project story generation capped per user per day.
- Batch question generation capped per admin run.
- No client-side LLM API keys.
- No frontend calls directly to LLM providers.
- Cache LLM outputs by stable content hash.
- Cache embeddings by source chunk hash.
- Do not regenerate unchanged source content.
- Add admin kill switch for generation jobs.
- Log generation attempts, failures, and token/cost estimates where possible.

## Current known security limitation

Current static content is local/demo content only.

The current app has:

- Supabase Auth client foundation for email/password accounts and Google SSO.
- Supabase migrations for profiles, quiz attempts, interview sessions, question flags, imported projects, source docs, source chunks, generation runs, question candidates, and approved questions.
- Owner-only RLS for learner data tables.
- Public-read-only GitHub import with no write scopes or private repo access.
- Source-grounding scaffold with approved-only serving and validation.
- Role foundation for MAIN_ADMIN, CONTENT_REVIEWER, SUPPORT_ADMIN, and USER with server-controlled bootstrap and audit logging.

The current app does not yet have:

- production-verified Supabase migration application in the target project
- server-side LLM calls
- production-scale Microsoft Learn ingestion
- full admin review UI
- full replacement of the demo/seed question bank

Google SSO still requires live Supabase provider configuration and redirect URL allow-list verification in each deployed environment before it can be considered production-verified.

## Icon licensing

The app uses `lucide-react` as its open-source icon system. The installed package metadata reports license `ISC`.
