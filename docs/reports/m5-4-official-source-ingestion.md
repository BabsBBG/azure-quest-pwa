# M5.4 Official Source Ingestion

Date: 2026-07-22

## Implemented

- Added provider-neutral source ingestion model in `src/data/sourceIngestion.ts`.
- Added initial provider registry for Microsoft with official source domains.
- Added certification registry for SC-300 and SC-500 with official exam/study-guide URLs, domains, and objectives.
- Added canonical URL normalization.
- Added official-domain allowlist enforcement.
- Added deterministic fixture fetch adapter for local/test ingestion.
- Added content hashing, previous-hash comparison, and unchanged/changed job status.
- Added Knowledge Unit draft extraction with objective, concept, procedure, source section, source URL, and source text hash.
- Added Supabase migration `0008_official_source_ingestion.sql` for providers, certifications, domains, objectives, source documents, source versions, ingestion jobs, and knowledge units.
- Added `npm run validate:source-ingestion` and CI coverage.

## Preserved

- No browser-side crawling.
- No indiscriminate Microsoft Learn crawling.
- No fixture-derived content is published as production content.
- Production network retrieval remains behind an adapter and is not activated without external configuration.

## Validation

Passed:

- `npm test -- src/data/sourceIngestion.test.ts`
- `npm run validate:source-ingestion`
- `npm run build`

## External Setup Still Required

- Apply migrations to the target Supabase project.
- Configure production source retrieval job runtime.
- Define approved source seed URLs beyond the current fixture registry.
- Run live ingestion with production failure logging and monitoring.
