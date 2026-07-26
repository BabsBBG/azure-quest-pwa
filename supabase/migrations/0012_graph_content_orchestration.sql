create table if not exists public.content_orchestration_workflows (
  id text primary key,
  status text not null default 'draft' check (status in ('draft', 'running', 'completed', 'failed', 'blocked')),
  graph_version_hash text not null,
  coverage_gap_node_ids text[] not null default '{}',
  generation_job_id text references public.question_generation_jobs(id) on delete set null,
  total_cost_estimate_cents integer not null default 0 check (total_cost_estimate_cents >= 0),
  total_duration_ms integer not null default 0 check (total_duration_ms >= 0),
  publish_automatically boolean not null default false check (publish_automatically = false),
  failure_reason text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_orchestration_nodes (
  id text primary key,
  workflow_id text not null references public.content_orchestration_workflows(id) on delete cascade,
  node_type text not null check (node_type in (
    'COVERAGE_PLANNING',
    'SOURCE_RESOLUTION',
    'QUESTION_GENERATION',
    'GROUNDING_VERIFICATION',
    'AMBIGUITY_CRITIC',
    'DISTRACTOR_CRITIC',
    'DUPLICATE_DETECTION',
    'DIFFICULTY_ESTIMATION',
    'ADMIN_HANDOFF'
  )),
  status text not null default 'pending' check (status in ('pending', 'running', 'completed', 'failed', 'blocked', 'skipped')),
  depends_on text[] not null default '{}',
  attempts integer not null default 0 check (attempts >= 0),
  max_retries integer not null default 0 check (max_retries >= 0),
  cost_estimate_cents integer not null default 0 check (cost_estimate_cents >= 0),
  duration_ms integer not null default 0 check (duration_ms >= 0),
  failure_reason text,
  output_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workflow_id, node_type),
  check (attempts <= max_retries + 1)
);

create table if not exists public.content_orchestration_events (
  id text primary key,
  workflow_id text not null references public.content_orchestration_workflows(id) on delete cascade,
  node_id text references public.content_orchestration_nodes(id) on delete cascade,
  event_type text not null check (event_type in ('started', 'completed', 'failed', 'blocked', 'retry-scheduled', 'handoff-created')),
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.content_orchestration_workflows enable row level security;
alter table public.content_orchestration_nodes enable row level security;
alter table public.content_orchestration_events enable row level security;

create policy "Reviewers can read orchestration workflows"
  on public.content_orchestration_workflows for select
  using (public.can_review_content());

create policy "Reviewers can read orchestration nodes"
  on public.content_orchestration_nodes for select
  using (public.can_review_content());

create policy "Reviewers can read orchestration events"
  on public.content_orchestration_events for select
  using (public.can_review_content());

create policy "Main admins manage orchestration workflows"
  on public.content_orchestration_workflows for all
  using (public.can_publish_content())
  with check (
    public.can_publish_content()
    and publish_automatically = false
  );

create policy "Main admins manage orchestration nodes"
  on public.content_orchestration_nodes for all
  using (public.can_publish_content())
  with check (
    public.can_publish_content()
    and attempts <= max_retries + 1
  );

create policy "Main admins manage orchestration events"
  on public.content_orchestration_events for all
  using (public.can_publish_content())
  with check (public.can_publish_content());

create index if not exists content_orchestration_workflows_status_idx
  on public.content_orchestration_workflows (status, created_at desc);

create index if not exists content_orchestration_nodes_workflow_type_idx
  on public.content_orchestration_nodes (workflow_id, node_type, status);

create index if not exists content_orchestration_events_workflow_time_idx
  on public.content_orchestration_events (workflow_id, created_at desc);
