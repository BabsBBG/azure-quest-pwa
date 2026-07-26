create table if not exists public.question_generation_jobs (
  id text primary key,
  idempotency_key text not null unique,
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed', 'cancelled', 'quarantined')),
  provider_mode text not null default 'deterministic-test' check (provider_mode in ('deterministic-test', 'external-llm-disabled')),
  production_enabled boolean not null default false check (production_enabled = false),
  admin_only boolean not null default true check (admin_only = true),
  kill_switch_enabled boolean not null default false,
  budget_cap_cents integer not null default 0 check (budget_cap_cents >= 0),
  spent_estimate_cents integer not null default 0 check (spent_estimate_cents >= 0 and spent_estimate_cents <= budget_cap_cents),
  per_question_cost_cap_cents integer not null default 0 check (per_question_cost_cap_cents >= 0),
  batch_question_limit integer not null default 0 check (batch_question_limit >= 0),
  max_source_chunks integer not null default 0 check (max_source_chunks >= 0),
  rate_limit_per_hour integer not null default 1 check (rate_limit_per_hour > 0),
  max_retries integer not null default 0 check (max_retries >= 0),
  attempts integer not null default 0 check (attempts >= 0),
  cancellation_requested boolean not null default false,
  failure_log jsonb not null default '[]'::jsonb,
  quarantine_reasons jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.question_generation_targets (
  id text primary key,
  job_id text not null references public.question_generation_jobs(id) on delete cascade,
  cert text not null check (cert in ('SC-300', 'AZ-500', 'SC-500')),
  domain text not null,
  objective text not null,
  target_drafts integer not null check (target_drafts > 0),
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  source_chunk_ids text[] not null,
  created_at timestamptz not null default now(),
  unique (job_id, cert, domain, objective)
);

create table if not exists public.generated_question_drafts (
  id text primary key,
  job_id text not null references public.question_generation_jobs(id) on delete cascade,
  target_id text not null references public.question_generation_targets(id) on delete cascade,
  source_chunk_id text not null references public.source_chunks(id) on delete restrict,
  cert text not null check (cert in ('SC-300', 'AZ-500', 'SC-500')),
  domain text not null,
  payload jsonb not null,
  duplicate_key text not null,
  review_status text not null default 'draft' check (review_status in ('draft', 'critic-approved', 'approved', 'rejected')),
  critic_status text not null default 'pending' check (critic_status in ('pending', 'passed', 'warning', 'failed')),
  quarantine_reasons jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (job_id, duplicate_key)
);

create table if not exists public.question_generation_events (
  id bigint generated always as identity primary key,
  job_id text not null references public.question_generation_jobs(id) on delete cascade,
  event_type text not null check (event_type in ('queued', 'started', 'draft-created', 'quarantined', 'cancelled', 'failed', 'completed')),
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.question_generation_jobs enable row level security;
alter table public.question_generation_targets enable row level security;
alter table public.generated_question_drafts enable row level security;
alter table public.question_generation_events enable row level security;

create policy "Reviewers can read generation jobs"
  on public.question_generation_jobs for select
  using (public.can_review_content());

create policy "Reviewers can read generation targets"
  on public.question_generation_targets for select
  using (public.can_review_content());

create policy "Reviewers can read generated drafts"
  on public.generated_question_drafts for select
  using (public.can_review_content());

create policy "Reviewers can read generation events"
  on public.question_generation_events for select
  using (public.can_review_content());

create policy "Main admins manage generation jobs"
  on public.question_generation_jobs for all
  using (public.can_publish_content())
  with check (
    public.can_publish_content()
    and production_enabled = false
    and admin_only = true
    and spent_estimate_cents <= budget_cap_cents
  );

create policy "Main admins manage generation targets"
  on public.question_generation_targets for all
  using (public.can_publish_content())
  with check (
    public.can_publish_content()
    and cardinality(source_chunk_ids) > 0
  );

create policy "Main admins manage generated drafts"
  on public.generated_question_drafts for all
  using (public.can_publish_content())
  with check (
    public.can_publish_content()
    and review_status in ('draft', 'critic-approved', 'rejected')
  );

create policy "Main admins manage generation events"
  on public.question_generation_events for all
  using (public.can_publish_content())
  with check (public.can_publish_content());

create index if not exists question_generation_jobs_status_idx
  on public.question_generation_jobs (status, created_at desc);

create index if not exists question_generation_targets_job_cert_idx
  on public.question_generation_targets (job_id, cert, difficulty);

create index if not exists generated_question_drafts_job_review_idx
  on public.generated_question_drafts (job_id, review_status, critic_status);

create index if not exists question_generation_events_job_time_idx
  on public.question_generation_events (job_id, created_at desc);
