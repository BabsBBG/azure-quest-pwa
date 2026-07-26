create table if not exists public.finite_certification_runs (
  id text primary key,
  cert text not null check (cert in ('SC-300', 'AZ-500', 'SC-500')),
  version text not null,
  run_type text not null check (run_type in ('BASELINE', 'APPLIED', 'PRESSURE', 'FINAL', 'PERSONALIZED')),
  title text not null,
  target_questions integer not null check (target_questions > 0),
  minutes integer not null check (minutes > 0),
  distribution_rules jsonb not null,
  personalized_rule text,
  publication_status text not null default 'draft' check (publication_status in ('draft', 'reviewed', 'published', 'blocked', 'retired')),
  effective_at timestamptz,
  retired_at timestamptz,
  published_by uuid references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cert, version, run_type),
  check (run_type <> 'PERSONALIZED' or personalized_rule is not null)
);

create table if not exists public.finite_certification_run_items (
  run_id text not null references public.finite_certification_runs(id) on delete cascade,
  approved_question_id text not null references public.approved_questions(id) on delete restrict,
  position integer not null check (position > 0),
  domain text not null,
  created_at timestamptz not null default now(),
  primary key (run_id, approved_question_id),
  unique (run_id, position)
);

alter table public.finite_certification_runs enable row level security;
alter table public.finite_certification_run_items enable row level security;

create policy "Published finite certification runs are readable"
  on public.finite_certification_runs for select
  using (publication_status = 'published' and effective_at is not null and (retired_at is null or retired_at > now()));

create policy "Published finite certification run items are readable"
  on public.finite_certification_run_items for select
  using (
    exists (
      select 1
      from public.finite_certification_runs fcr
      where fcr.id = finite_certification_run_items.run_id
        and fcr.publication_status = 'published'
        and fcr.effective_at is not null
        and (fcr.retired_at is null or fcr.retired_at > now())
    )
  );

create policy "Reviewers can read finite certification runs"
  on public.finite_certification_runs for select
  using (public.can_review_content());

create policy "Reviewers can read finite certification run items"
  on public.finite_certification_run_items for select
  using (public.can_review_content());

create policy "Main admins manage finite certification runs"
  on public.finite_certification_runs for all
  using (public.can_publish_content())
  with check (
    public.can_publish_content()
    and (
      publication_status <> 'published'
      or (effective_at is not null and published_by = auth.uid())
    )
  );

create policy "Main admins manage finite certification run items"
  on public.finite_certification_run_items for all
  using (public.can_publish_content())
  with check (
    public.can_publish_content()
    and exists (
      select 1
      from public.approved_questions aq
      where aq.id = approved_question_id
        and aq.approved_at is not null
    )
  );

create or replace function public.guard_finite_certification_run_publication()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  item_count integer;
begin
  if new.publication_status = 'published' then
    select count(*) into item_count
    from public.finite_certification_run_items fcri
    where fcri.run_id = new.id;

    if item_count < new.target_questions then
      raise exception 'Cannot publish finite certification run with missing approved item placements';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists guard_finite_certification_run_publication on public.finite_certification_runs;
create trigger guard_finite_certification_run_publication
  before insert or update of publication_status on public.finite_certification_runs
  for each row execute function public.guard_finite_certification_run_publication();

create index if not exists finite_certification_runs_cert_version_type_idx
  on public.finite_certification_runs (cert, version, run_type, publication_status);

create index if not exists finite_certification_run_items_run_position_idx
  on public.finite_certification_run_items (run_id, position);
