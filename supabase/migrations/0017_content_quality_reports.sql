create table if not exists public.content_quality_reports (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  cert text not null check (cert in ('SC-300', 'AZ-500', 'SC-500')),
  assessment_item_id text not null,
  assessment_item_version text not null,
  source_chunk_id text not null,
  source_url text not null,
  attempt_id text,
  assessment_session_id text,
  reason text not null check (reason in ('unclear', 'incorrect', 'source-mismatch', 'outdated', 'accessibility', 'other')),
  comment text,
  status text not null default 'open' check (status in ('open', 'triaged', 'in-review', 'resolved', 'rejected')),
  never_auto_mutates_content boolean not null default true check (never_auto_mutates_content = true),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_quality_report_events (
  id bigint generated always as identity primary key,
  report_id text not null references public.content_quality_reports(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null check (event_type in ('created', 'triaged', 'assigned', 'status-changed', 'commented', 'closed')),
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.content_quality_reports enable row level security;
alter table public.content_quality_report_events enable row level security;

create policy "Users can create content quality reports"
  on public.content_quality_reports for insert
  with check (
    (auth.uid() is null or user_id = auth.uid())
    and never_auto_mutates_content = true
    and source_url like 'https://learn.microsoft.com/%'
  );

create policy "Users can read their own content quality reports"
  on public.content_quality_reports for select
  using (user_id = auth.uid());

create policy "Reviewers can read content quality reports"
  on public.content_quality_reports for select
  using (public.can_review_content());

create policy "Reviewers can read content quality report events"
  on public.content_quality_report_events for select
  using (public.can_review_content());

create policy "Main admins manage content quality reports"
  on public.content_quality_reports for update
  using (public.can_publish_content())
  with check (
    public.can_publish_content()
    and never_auto_mutates_content = true
  );

create policy "Main admins manage content quality report events"
  on public.content_quality_report_events for all
  using (public.can_publish_content())
  with check (public.can_publish_content());

create or replace function public.guard_content_quality_report_no_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.never_auto_mutates_content is distinct from true then
    raise exception 'Content quality reports must never auto-edit, remove, replace, or publish content';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_content_quality_report_no_mutation on public.content_quality_reports;
create trigger guard_content_quality_report_no_mutation
  before insert or update on public.content_quality_reports
  for each row execute function public.guard_content_quality_report_no_mutation();

create index if not exists content_quality_reports_status_reason_idx
  on public.content_quality_reports (status, reason, created_at desc);

create index if not exists content_quality_reports_item_idx
  on public.content_quality_reports (assessment_item_id, assessment_item_version, status);

create index if not exists content_quality_report_events_report_idx
  on public.content_quality_report_events (report_id, created_at desc);
