create table if not exists public.source_version_diffs (
  id text primary key,
  source_document_id text not null references public.official_source_documents(id) on delete cascade,
  previous_content_hash text not null,
  next_content_hash text not null,
  changed_sections text[] not null default '{}',
  removed_sections text[] not null default '{}',
  added_sections text[] not null default '{}',
  changed_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  check (previous_content_hash <> next_content_hash),
  check (cardinality(changed_sections) + cardinality(removed_sections) + cardinality(added_sections) > 0)
);

create table if not exists public.source_impact_records (
  id text primary key,
  source_diff_id text not null references public.source_version_diffs(id) on delete cascade,
  graph_node_id text not null references public.knowledge_graph_nodes(id) on delete cascade,
  node_kind text not null,
  risk_state text not null check (risk_state in ('unchanged', 'needs-review', 'needs-replacement', 'blocked')),
  reason text not null,
  review_status text not null default 'draft' check (review_status in ('draft', 'critic-approved', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  unique (source_diff_id, graph_node_id)
);

create table if not exists public.targeted_replacement_jobs (
  id text primary key,
  source_diff_id text not null references public.source_version_diffs(id) on delete cascade,
  affected_node_ids text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'queued', 'blocked', 'completed')),
  requires_main_admin_review boolean not null default true check (requires_main_admin_review = true),
  publish_automatically boolean not null default false check (publish_automatically = false),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.source_version_diffs enable row level security;
alter table public.source_impact_records enable row level security;
alter table public.targeted_replacement_jobs enable row level security;

create policy "Reviewers can read source version diffs"
  on public.source_version_diffs for select
  using (public.can_review_content());

create policy "Reviewers can read source impact records"
  on public.source_impact_records for select
  using (public.can_review_content());

create policy "Reviewers can read targeted replacement jobs"
  on public.targeted_replacement_jobs for select
  using (public.can_review_content());

create policy "Main admins manage source version diffs"
  on public.source_version_diffs for all
  using (public.can_publish_content())
  with check (public.can_publish_content());

create policy "Main admins manage source impact records"
  on public.source_impact_records for all
  using (public.can_publish_content())
  with check (public.can_publish_content());

create policy "Main admins manage targeted replacement jobs"
  on public.targeted_replacement_jobs for all
  using (public.can_publish_content())
  with check (
    public.can_publish_content()
    and requires_main_admin_review = true
    and publish_automatically = false
  );

create index if not exists source_version_diffs_document_time_idx
  on public.source_version_diffs (source_document_id, changed_at desc);

create index if not exists source_impact_records_diff_risk_idx
  on public.source_impact_records (source_diff_id, risk_state, review_status);

create index if not exists targeted_replacement_jobs_diff_status_idx
  on public.targeted_replacement_jobs (source_diff_id, status, created_at desc);
