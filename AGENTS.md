# AGENTS.md - PraxisGrid Operating Manual

## Mission

Build a public, free-to-use PWA for source-grounded technical capability, certification practice, and career readiness.

The product has two halves:

1. Practice and certification-run engine for SC-300 and SC-500, with AZ-500 preserved as a retiring historical path.
2. Career Lab engine that turns public GitHub projects into interview-ready stories, pitches, STAR answers, architecture walkthroughs, and mock interview simulations.

PraxisGrid tagline: Learn it. Practise it. Prove it.

PraxisGrid description: PraxisGrid is a source-grounded technical capability platform connecting official learning, certifications, approved assessments, hands-on practice, real project evidence, personalized interviews, and technical career paths.

This product is an independent learning platform and is not affiliated with, endorsed by, or sponsored by Microsoft, Amazon Web Services, Google Cloud, or other certification providers.

## Current approved programme

M5 Production Perfection followed by Phase 6 public beta delivery.

The user explicitly approved reopening M5 production-hardening work and completing Phase 6 on 2026-07-26.

Approved work now:

- Reopen M5 claims that are scaffold-only, fixture-only, static, or externally unverified.
- Make public authentication mandatory, with signup/sign-in, Google SSO through Supabase, password recovery, email-verification states, and onboarding.
- Remove logged-out public demo practice and production demo/founder project surfaces.
- Build the three-destination learner IA: Learn, Practise, Prove.
- Redesign Home around exactly three primary cards: Learn, Practise, Prove.
- Build a dedicated Assessment Shell and analytical Results experience.
- Complete repository import and Project Intelligence with authenticated user ownership, privacy-safe redaction, deletion, and durable rate limits.
- Complete Interview Studio integration using selected repository evidence.
- Complete production source-grounded SC-300 and SC-500 content workflows without serving seed/demo questions as trusted content.
- Complete live protected Admin operations for M6.0 through M6.12.
- Add Playwright, accessibility, visual, production-smoke, migration, RLS, production-content, and repository-isolation gates.
- Configure and verify Vercel/Supabase production environments where connected access permits, without committing secrets.
- Rename/canonicalize production identity to PraxisGrid where access permits.
- Preserve provider-neutral non-affiliation disclaimer and certification-provider independence.
- Keep payments, native mobile apps, voice/audio grading, community-submitted questions, and M7 out of scope.

Still not approved:

- GitHub write permissions.
- Broad GitHub scopes or organization-wide automatic indexing.
- Client-side LLM calls or frontend LLM API keys.
- Live LLM question generation during quiz/exam attempts.
- Automatic publication of generated certification content.
- Payments, native mobile apps, voice/audio grading, or community-submitted questions.
- M7.

Current harness state:

- Product: PraxisGrid.
- Active programme: M5 Production Perfection followed by Phase 6.
- M5 status: REOPENED FOR PRODUCTION HARDENING.
- M6 status: APPROVED.
- M7 status: NOT APPROVED.

The roadmap is context only. Complete only the current approved programme.

## Source of truth order

When files conflict, trust them in this order:

1. AGENTS.md
2. PRODUCT_SPEC.md
3. ACCEPTANCE_CRITERIA.md
4. ARCHITECTURE.md
5. SECURITY.md
6. CURRENT_STATE.md
7. Existing implementation

If code conflicts with source-of-truth docs, update the code or report the mismatch.

## Subagent operating model

PraxisGrid uses four named senior roles for M5/M6 production delivery. They are advisory by default unless the user explicitly asks for implementation delegation.

Use subagents when the work affects multiple surfaces, changes user experience, changes core exam behavior, or prepares a milestone handoff.

Required senior roles:

1. Senior Principal Engineer
2. Senior Product Designer and Design Systems Lead
3. Senior QA Engineer: Security, Data and Governance
4. Senior QA Engineer: Product, UX, Accessibility and Regression

Authoritative role briefs live in:

- `docs/agents/ui-ux-revamp-lead.md`
- `docs/agents/senior-software-engineer.md`
- `docs/agents/qa-product-lead.md`

Coordination rules:

- The main agent owns final decisions, integration, and source-of-truth updates.
- Subagents must not override AGENTS.md, PRODUCT_SPEC.md, SECURITY.md, or ACCEPTANCE_CRITERIA.md.
- Subagents must not start M7.
- Subagents must keep the demo/seed question-bank warning visible until the seed bank is removed from public trusted content.
- Subagents must preserve the provider-neutral non-affiliation disclaimer.
- Subagents must not add payments, native mobile apps, voice/audio grading, community-submitted questions, or M7 scope.
- If subagents disagree, prefer the option that is safest for learners, easiest to verify, and closest to the current approved milestone.

Default review sequence:

1. UI/UX Revamp Lead reviews visual hierarchy, clarity, trust, navigation, interaction ergonomics, and accessibility.
2. Senior Software Engineer reviews architecture, state flow, data contracts, tests, build stability, performance, and maintainability.
3. QA and Product Lead reviews user journeys, acceptance criteria, release risk, prioritization, and product coherence.

Every subagent-backed run should update `CURRENT_STATE.md`, `KNOWN_FAILURES.md`, and the relevant `docs/reports/*` file with the result.

## Non-negotiable rules

- Do not build outside the currently approved programme.
- Do not rewrite the whole app unless explicitly instructed.
- Do not remove working functionality without replacing it and updating tests/checks.
- Do not expose LLM API keys in frontend code.
- Do not request GitHub write permissions.
- Do not add payments in v1.
- Do not add native mobile apps in v1.
- Do not add voice/audio interview grading in v1.
- Do not add community-submitted questions in v1.
- Do not claim certification-provider affiliation.
- Do not present generated or static questions as official certification-provider questions.
- Every assessment/practice page must show the provider-neutral non-affiliation disclaimer.
- If a build/test fails, stop and report the failure.
- Do not claim success unless required commands pass.

## Question bank trust rule

The current static question bank is seed/demo content only.

Until the source-grounded Microsoft Learn pipeline is built and questions are reviewed, the UI must clearly label practice content as demo/seed practice content.

Do not present the current bank as official, complete, source-grounded, or production-quality.

Completion is blocked if users can take quizzes/exams without seeing that the current question bank is demo/seed content.

Required UI copy or equivalent:

"Demo practice bank: These questions are seed content for testing the platform. They are not official certification-provider exam questions and are not yet fully source-grounded or reviewed."

This must appear:

- Before starting a quiz.
- Before starting a certification run.
- On practice/exam landing screens.
- Near the provider-neutral non-affiliation disclaimer.

## Future source-grounding rule

Long-term, every production question must trace back to a specific source chunk from official Microsoft Learn / MicrosoftDocs content.

A production question is not trusted unless it has:

- source_chunk_id
- source URL
- cert ID
- domain ID
- explanation
- why-wrong explanation per option
- review status
- approval status

## Cost and abuse control rule

Any feature that calls an LLM, imports GitHub repositories, generates questions, creates project stories, embeds content, or processes Microsoft Learn source material must include cost and abuse controls before it is considered complete.

Required controls:

- No live LLM question generation on the user quiz/exam path.
- Question generation must be batch/admin-triggered only.
- Batch generation must have a budget cap per run.
- LLM calls must run server-side only.
- Repo imports must be rate-limited per user.
- Project story generation must be cached by README/content hash.
- Source ingestion must be cached by content hash.
- Embedding generation must avoid re-processing unchanged content.
- Admin kill switch or config flag must exist for generation jobs.
- Failures must be logged and reported, not silently retried forever.

Completion is blocked for future M4/M5 work if these controls are missing.

## GitHub permission rule

For v1, do not request GitHub write permissions.

Prefer public repo import using minimal permissions.

Do not use broad repository scopes unless explicitly approved.

Private repo support is not part of the current milestone.

## Product constraints

Frontend:

- React
- TypeScript
- Vite
- Tailwind
- Zustand
- localForage
- PWA

Hosting:

- Vercel for frontend
- Supabase for auth, backend data, RLS, and live production validation

## Visual direction

Professional, quiet, premium.

Primary palette for M1.6:

- White
- Azure blue
- Deep navy
- Light blue-tinted backgrounds
- Neutral greys

Avoid:

- Loud purple
- Unnecessary decorative glow/blur
- Cartoon-heavy UI
- Oversized buttons
- Overly bold fonts
- Busy gradients
- Childish gamification

The app should feel credible for cybersecurity learners and early-career security professionals.

Typography:

- Use a highly legible sans-serif stack for body text, forms, dashboards, results, tables, and assessment questions.
- Use monospace selectively for code, commands, compact technical metadata, and labels where it adds genuine value.
- Keep sizes readable and weights controlled.

Icons:

- Use `lucide-react` as the verified open-source Iconbuddy-style React icon system.
- `lucide-react` is ISC licensed in the installed package metadata.
- Do not mix multiple icon systems without a documented reason.

## Required build checks

Before marking work complete, run:

```bash
npm install --legacy-peer-deps
npm run build
```

If lint/test scripts exist, also run:

```bash
npm run lint
npm test
```

If these commands fail, completion is blocked.

## Completion report required

Every agent run must end with:

- Files changed
- What was preserved
- What was removed
- Commands run
- Build result
- Tests/checks run
- Known failures
- Known remaining issues
- Next recommended step
