create table if not exists public.curated_domain_quizzes (
  id text primary key,
  cert text not null check (cert in ('SC-300', 'AZ-500', 'SC-500')),
  domain_node_id text references public.knowledge_graph_nodes(id) on delete restrict,
  domain_title text not null,
  track text not null check (track in ('FOUNDATIONS', 'CONFIGURATION', 'SCENARIOS', 'TROUBLESHOOTING', 'DOMAIN_CHALLENGE')),
  target_questions integer not null check (target_questions > 0),
  minutes integer not null check (minutes > 0),
  unlock_rule text not null,
  publication_status text not null default 'draft' check (publication_status in ('draft', 'reviewed', 'published', 'blocked')),
  effective_at timestamptz,
  retired_at timestamptz,
  published_by uuid references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cert, domain_title, track)
);

create table if not exists public.curated_domain_quiz_items (
  quiz_id text not null references public.curated_domain_quizzes(id) on delete cascade,
  approved_question_id text not null references public.approved_questions(id) on delete restrict,
  position integer not null check (position > 0),
  created_at timestamptz not null default now(),
  primary key (quiz_id, approved_question_id),
  unique (quiz_id, position)
);

alter table public.curated_domain_quizzes enable row level security;
alter table public.curated_domain_quiz_items enable row level security;

create policy "Published curated domain quizzes are readable"
  on public.curated_domain_quizzes for select
  using (publication_status = 'published' and effective_at is not null and (retired_at is null or retired_at > now()));

create policy "Published curated domain quiz items are readable"
  on public.curated_domain_quiz_items for select
  using (
    exists (
      select 1
      from public.curated_domain_quizzes cdq
      where cdq.id = curated_domain_quiz_items.quiz_id
        and cdq.publication_status = 'published'
        and cdq.effective_at is not null
        and (cdq.retired_at is null or cdq.retired_at > now())
    )
  );

create policy "Reviewers can read curated domain quizzes"
  on public.curated_domain_quizzes for select
  using (public.can_review_content());

create policy "Reviewers can read curated domain quiz items"
  on public.curated_domain_quiz_items for select
  using (public.can_review_content());

create policy "Main admins manage curated domain quizzes"
  on public.curated_domain_quizzes for all
  using (public.can_publish_content())
  with check (
    public.can_publish_content()
    and (
      publication_status <> 'published'
      or (effective_at is not null and published_by = auth.uid())
    )
  );

create policy "Main admins manage curated domain quiz items"
  on public.curated_domain_quiz_items for all
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

create or replace function public.guard_curated_domain_quiz_publication()
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
    from public.curated_domain_quiz_items cdqi
    where cdqi.quiz_id = new.id;

    if item_count < new.target_questions then
      raise exception 'Cannot publish curated domain quiz with missing approved item placements';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists guard_curated_domain_quiz_publication on public.curated_domain_quizzes;
create trigger guard_curated_domain_quiz_publication
  before insert or update of publication_status on public.curated_domain_quizzes
  for each row execute function public.guard_curated_domain_quiz_publication();

create index if not exists curated_domain_quizzes_cert_domain_track_idx
  on public.curated_domain_quizzes (cert, domain_title, track, publication_status);

create index if not exists curated_domain_quiz_items_quiz_position_idx
  on public.curated_domain_quiz_items (quiz_id, position);
