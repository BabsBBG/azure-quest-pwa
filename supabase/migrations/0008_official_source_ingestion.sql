create table if not exists public.providers (
  id text primary key,
  code text not null unique,
  display_name text not null,
  status text not null check (status in ('active', 'planned', 'retired')),
  official_source_domains text[] not null,
  created_at timestamptz not null default now()
);

create table if not exists public.certifications (
  id text primary key,
  provider_id text not null references public.providers(id) on delete restrict,
  code text not null,
  version text not null,
  status text not null check (status in ('active', 'retiring', 'retired')),
  effective_date date not null,
  retirement_date date,
  replacement_certification text,
  official_exam_page text not null,
  official_study_guide text not null,
  created_at timestamptz not null default now(),
  unique (provider_id, code, version)
);

create table if not exists public.certification_domains (
  id text primary key,
  certification_id text not null references public.certifications(id) on delete cascade,
  title text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.certification_objectives (
  id text primary key,
  domain_id text not null references public.certification_domains(id) on delete cascade,
  objective text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.official_source_documents (
  id text primary key,
  provider_id text not null references public.providers(id) on delete restrict,
  certification_id text not null references public.certifications(id) on delete cascade,
  canonical_url text not null,
  title text not null,
  status text not null check (status in ('active', 'changed', 'removed', 'failed')),
  latest_content_hash text not null,
  fetched_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (certification_id, canonical_url)
);

create table if not exists public.official_source_versions (
  id text primary key,
  source_document_id text not null references public.official_source_documents(id) on delete cascade,
  content_hash text not null,
  previous_hash text,
  fetched_at timestamptz not null,
  body_excerpt text not null default '',
  created_at timestamptz not null default now(),
  unique (source_document_id, content_hash)
);

create table if not exists public.source_ingestion_jobs (
  id text primary key,
  provider_id text not null references public.providers(id) on delete restrict,
  certification_id text not null references public.certifications(id) on delete cascade,
  canonical_url text not null,
  status text not null check (status in ('queued', 'running', 'completed', 'failed', 'unchanged', 'changed')),
  attempts integer not null default 0 check (attempts >= 0),
  max_attempts integer not null default 3 check (max_attempts between 1 and 10),
  content_hash text,
  previous_hash text,
  failure_reason text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.knowledge_units (
  id text primary key,
  certification_id text not null references public.certifications(id) on delete cascade,
  domain_id text not null references public.certification_domains(id) on delete cascade,
  objective_id text references public.certification_objectives(id) on delete set null,
  concept text not null,
  prerequisites jsonb not null default '[]'::jsonb,
  procedures jsonb not null default '[]'::jsonb,
  constraints_list jsonb not null default '[]'::jsonb,
  exceptions jsonb not null default '[]'::jsonb,
  common_confusions jsonb not null default '[]'::jsonb,
  products jsonb not null default '[]'::jsonb,
  source_document_id text not null references public.official_source_documents(id) on delete cascade,
  source_section text not null,
  source_anchor text,
  source_text_hash text not null,
  review_status text not null default 'draft' check (review_status in ('draft', 'reviewed', 'approved', 'retired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (certification_id, domain_id, concept, source_text_hash)
);

alter table public.providers enable row level security;
alter table public.certifications enable row level security;
alter table public.certification_domains enable row level security;
alter table public.certification_objectives enable row level security;
alter table public.official_source_documents enable row level security;
alter table public.official_source_versions enable row level security;
alter table public.source_ingestion_jobs enable row level security;
alter table public.knowledge_units enable row level security;

create policy "Providers are readable"
  on public.providers for select
  using (true);

create policy "Certifications are readable"
  on public.certifications for select
  using (true);

create policy "Certification domains are readable"
  on public.certification_domains for select
  using (true);

create policy "Certification objectives are readable"
  on public.certification_objectives for select
  using (true);

create policy "Reviewed knowledge units are readable"
  on public.knowledge_units for select
  using (review_status in ('reviewed', 'approved'));

create policy "Reviewers can read source ingestion data"
  on public.official_source_documents for select
  using (public.can_review_content());

create policy "Reviewers can read source versions"
  on public.official_source_versions for select
  using (public.can_review_content());

create policy "Reviewers can read ingestion jobs"
  on public.source_ingestion_jobs for select
  using (public.can_review_content());

create policy "Main admins manage providers"
  on public.providers for all
  using (public.can_publish_content())
  with check (public.can_publish_content());

create policy "Main admins manage certifications"
  on public.certifications for all
  using (public.can_publish_content())
  with check (public.can_publish_content());

create policy "Main admins manage source documents"
  on public.official_source_documents for all
  using (public.can_publish_content())
  with check (public.can_publish_content());

create policy "Main admins manage source versions"
  on public.official_source_versions for all
  using (public.can_publish_content())
  with check (public.can_publish_content());

create policy "Main admins manage ingestion jobs"
  on public.source_ingestion_jobs for all
  using (public.can_publish_content())
  with check (public.can_publish_content());

create policy "Main admins manage knowledge units"
  on public.knowledge_units for all
  using (public.can_publish_content())
  with check (public.can_publish_content());

create index if not exists official_source_documents_cert_status_idx
  on public.official_source_documents (certification_id, status);

create index if not exists source_ingestion_jobs_cert_status_idx
  on public.source_ingestion_jobs (certification_id, status, created_at desc);

create index if not exists knowledge_units_cert_domain_review_idx
  on public.knowledge_units (certification_id, domain_id, review_status);
