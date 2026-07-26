create table if not exists public.question_critic_reports (
  id text primary key,
  question_candidate_id text references public.question_candidates(id) on delete cascade,
  generated_draft_id text references public.generated_question_drafts(id) on delete cascade,
  status text not null check (status in ('passed', 'warning', 'failed')),
  non_overrideable_error_count integer not null default 0 check (non_overrideable_error_count >= 0),
  overrideable_warning_count integer not null default 0 check (overrideable_warning_count >= 0),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (question_candidate_id is not null or generated_draft_id is not null)
);

create table if not exists public.question_critic_findings (
  id text primary key,
  report_id text not null references public.question_critic_reports(id) on delete cascade,
  check_id text not null check (check_id in (
    'source-support',
    'answer-uniqueness',
    'distractor-plausibility',
    'ambiguity',
    'hidden-assumptions',
    'objective-alignment',
    'difficulty',
    'freshness',
    'item-type-validity',
    'accessibility',
    'wording-leakage',
    'semantic-similarity',
    'unsupported-claims',
    'scenario-consistency'
  )),
  severity text not null check (severity in ('error', 'warning')),
  message text not null,
  override_allowed boolean not null default false,
  created_at timestamptz not null default now(),
  check (
    (severity = 'warning' and override_allowed = true)
    or (severity = 'error' and override_allowed = false)
  )
);

create table if not exists public.question_critic_overrides (
  id text primary key,
  finding_id text not null references public.question_critic_findings(id) on delete restrict,
  report_id text not null references public.question_critic_reports(id) on delete restrict,
  reason text not null check (length(trim(reason)) >= 12),
  actor_id uuid not null references auth.users(id) on delete restrict,
  actor_role text not null default 'MAIN_ADMIN' check (actor_role = 'MAIN_ADMIN'),
  created_at timestamptz not null default now()
);

alter table public.question_critic_reports enable row level security;
alter table public.question_critic_findings enable row level security;
alter table public.question_critic_overrides enable row level security;

create policy "Reviewers can read critic reports"
  on public.question_critic_reports for select
  using (public.can_review_content());

create policy "Reviewers can read critic findings"
  on public.question_critic_findings for select
  using (public.can_review_content());

create policy "Reviewers can read critic overrides"
  on public.question_critic_overrides for select
  using (public.can_review_content());

create policy "Main admins manage critic reports"
  on public.question_critic_reports for all
  using (public.can_publish_content())
  with check (public.can_publish_content());

create policy "Main admins manage critic findings"
  on public.question_critic_findings for all
  using (public.can_publish_content())
  with check (public.can_publish_content());

create policy "Main admins insert critic overrides"
  on public.question_critic_overrides for insert
  with check (
    public.can_publish_content()
    and actor_id = auth.uid()
    and actor_role = 'MAIN_ADMIN'
    and exists (
      select 1
      from public.question_critic_findings qcf
      where qcf.id = finding_id
        and qcf.report_id = question_critic_overrides.report_id
        and qcf.severity = 'warning'
        and qcf.override_allowed = true
    )
  );

create or replace function public.guard_question_candidate_critic_approval()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.review_status in ('critic-approved', 'approved') then
    if not exists (
      select 1
      from public.question_critic_reports qcr
      where qcr.question_candidate_id = new.id
        and qcr.status in ('passed', 'warning')
        and qcr.non_overrideable_error_count = 0
    ) then
      raise exception 'Question candidate requires passing critic report before critic approval or approval';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists guard_question_candidate_critic_approval on public.question_candidates;
create trigger guard_question_candidate_critic_approval
  before update of review_status on public.question_candidates
  for each row execute function public.guard_question_candidate_critic_approval();

create index if not exists question_critic_reports_candidate_status_idx
  on public.question_critic_reports (question_candidate_id, status, created_at desc);

create index if not exists question_critic_findings_report_severity_idx
  on public.question_critic_findings (report_id, severity, override_allowed);

create index if not exists question_critic_overrides_report_idx
  on public.question_critic_overrides (report_id, created_at desc);
