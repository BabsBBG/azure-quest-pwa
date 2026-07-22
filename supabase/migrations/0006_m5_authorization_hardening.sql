-- M5 authorization hardening.
-- This migration preserves existing tables and tightens authority boundaries
-- between review, publication, support, and normal learner access.

create or replace function public.can_publish_content()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_user_role() = 'MAIN_ADMIN'::public.praxisgrid_user_role;
$$;

create or replace function public.can_support_users()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_user_role() in (
    'MAIN_ADMIN'::public.praxisgrid_user_role,
    'SUPPORT_ADMIN'::public.praxisgrid_user_role
  );
$$;

create or replace function public.source_question_payload_is_valid(p_payload jsonb)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    jsonb_typeof(p_payload) = 'object'
    and length(trim(coalesce(p_payload->>'stem', ''))) > 0
    and jsonb_typeof(p_payload->'options') = 'array'
    and case
      when jsonb_typeof(p_payload->'options') = 'array' then jsonb_array_length(p_payload->'options') = 4
      else false
    end
    and coalesce(p_payload->>'answer', '') in ('A', 'B', 'C', 'D')
    and length(trim(coalesce(p_payload->>'explanation', ''))) > 0
    and jsonb_typeof(p_payload->'whyWrong') = 'object'
    and length(trim(coalesce(p_payload->>'duplicateKey', ''))) > 0;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'imported_projects_user_content_hash_unique'
      and conrelid = 'public.imported_projects'::regclass
  ) then
    alter table public.imported_projects
      add constraint imported_projects_user_content_hash_unique unique (user_id, content_hash);
  end if;
end;
$$;

drop policy if exists "Reviewers can insert source docs" on public.source_docs;
create policy "Only main admins can insert source docs"
  on public.source_docs for insert
  with check (
    public.can_publish_content()
    and source_url like 'https://learn.microsoft.com/%'
    and length(trim(content_hash)) > 0
  );

drop policy if exists "Reviewers can insert source chunks" on public.source_chunks;
create policy "Only main admins can insert source chunks"
  on public.source_chunks for insert
  with check (
    public.can_publish_content()
    and source_url like 'https://learn.microsoft.com/%'
    and length(trim(content_hash)) > 0
    and exists (
      select 1
      from public.source_docs sd
      where sd.id = doc_id
        and sd.cert = source_chunks.cert
        and sd.source_url = source_chunks.source_url
    )
  );

drop policy if exists "Reviewers can insert draft question candidates" on public.question_candidates;
create policy "Reviewers can insert draft question candidates"
  on public.question_candidates for insert
  with check (
    public.can_review_content()
    and review_status = 'draft'
    and approved_at is null
    and public.source_question_payload_is_valid(payload)
    and exists (
      select 1
      from public.source_chunks sc
      where sc.id = source_chunk_id
        and sc.cert = question_candidates.cert
    )
  );

create policy "Main admins can insert reviewed question candidates"
  on public.question_candidates for insert
  with check (
    public.can_publish_content()
    and review_status in ('draft', 'critic-approved', 'approved', 'rejected')
    and public.source_question_payload_is_valid(payload)
    and (review_status <> 'approved' or approved_at is not null)
    and exists (
      select 1
      from public.source_chunks sc
      where sc.id = source_chunk_id
        and sc.cert = question_candidates.cert
    )
  );

drop policy if exists "Reviewers can update candidate review status" on public.question_candidates;
create policy "Reviewers can update non-published candidate review fields"
  on public.question_candidates for update
  using (public.can_review_content())
  with check (
    public.can_review_content()
    and public.source_question_payload_is_valid(payload)
    and (
      public.can_publish_content()
      or review_status in ('draft', 'critic-approved', 'rejected')
    )
  );

create or replace function public.guard_question_candidate_review_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.can_publish_content() then
    if new.review_status = 'approved' and new.approved_at is null then
      raise exception 'Approved candidates require approved_at';
    end if;
    return new;
  end if;

  if new.review_status = 'approved' then
    raise exception 'Only MAIN_ADMIN can approve question candidates';
  end if;

  if old.review_status = 'approved' then
    raise exception 'Only MAIN_ADMIN can change approved question candidates';
  end if;

  if old.run_id is distinct from new.run_id
    or old.cert is distinct from new.cert
    or old.domain is distinct from new.domain
    or old.source_chunk_id is distinct from new.source_chunk_id
    or old.duplicate_key is distinct from new.duplicate_key
    or old.approved_at is distinct from new.approved_at then
    raise exception 'Only MAIN_ADMIN can change candidate source, duplicate, approval, or publication fields';
  end if;

  return new;
end;
$$;

create or replace function public.approved_question_candidate_is_valid(
  p_candidate_id text,
  p_source_chunk_id text,
  p_source_url text,
  p_duplicate_key text,
  p_approved_at timestamptz
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.question_candidates qc
    join public.source_chunks sc on sc.id = qc.source_chunk_id
    left join public.generation_runs gr on gr.id = qc.run_id
    where qc.id = p_candidate_id
      and qc.review_status = 'approved'
      and qc.approved_at is not null
      and qc.source_chunk_id = p_source_chunk_id
      and qc.duplicate_key = p_duplicate_key
      and sc.source_url = p_source_url
      and sc.source_url like 'https://learn.microsoft.com/%'
      and sc.cert = qc.cert
      and length(trim(qc.duplicate_key)) > 0
      and jsonb_typeof(qc.critic_notes) = 'array'
      and jsonb_array_length(qc.critic_notes) > 0
      and public.source_question_payload_is_valid(qc.payload)
      and p_approved_at is not null
      and (gr.id is null or (
        gr.kill_switch_enabled = false
        and gr.spent_estimate_cents <= gr.budget_cap_cents
        and gr.admin_only = true
      ))
  );
$$;

drop policy if exists "Reviewers can insert approved questions" on public.approved_questions;
create policy "Only main admins can insert approved questions"
  on public.approved_questions for insert
  with check (
    public.can_publish_content()
    and review_status = 'approved'
    and approved_at is not null
    and source_url like 'https://learn.microsoft.com/%'
    and public.source_question_payload_is_valid(payload)
    and public.approved_question_candidate_is_valid(candidate_id, source_chunk_id, source_url, duplicate_key, approved_at)
  );

drop policy if exists "Main admins can insert role change events" on public.role_change_events;

create or replace function public.guard_user_role_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    if length(trim(coalesce(new.reason, ''))) = 0 then
      raise exception 'Role changes require a reason';
    end if;
    return new;
  end if;

  if not public.can_publish_content() then
    raise exception 'Only MAIN_ADMIN can modify roles';
  end if;

  if new.user_id = auth.uid() then
    raise exception 'Users cannot modify their own role';
  end if;

  if length(trim(coalesce(new.reason, ''))) = 0 then
    raise exception 'Role changes require a reason';
  end if;

  new.assigned_by = auth.uid();
  new.assigned_at = now();
  return new;
end;
$$;

drop trigger if exists guard_user_role_write on public.user_roles;
create trigger guard_user_role_write
  before insert or update on public.user_roles
  for each row execute function public.guard_user_role_write();

create or replace function public.audit_user_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.role_change_events (
      target_user_id,
      previous_role,
      new_role,
      changed_by,
      reason
    )
    values (
      new.user_id,
      null,
      new.role,
      coalesce(auth.uid(), new.assigned_by),
      new.reason
    );
    return new;
  end if;

  if old.role is distinct from new.role then
    insert into public.role_change_events (
      target_user_id,
      previous_role,
      new_role,
      changed_by,
      reason
    )
    values (
      new.user_id,
      old.role,
      new.role,
      coalesce(auth.uid(), new.assigned_by),
      new.reason
    );
  end if;

  return new;
end;
$$;

drop policy if exists "Reviewers can insert review events" on public.question_review_events;

create or replace function public.audit_question_candidate_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.review_status is distinct from new.review_status then
    insert into public.question_review_events (
      candidate_id,
      reviewer_id,
      reviewer_role,
      from_status,
      to_status,
      notes
    )
    values (
      new.id,
      auth.uid(),
      public.current_user_role(),
      old.review_status,
      new.review_status,
      case
        when new.review_status = 'approved' then 'candidate approved by MAIN_ADMIN'
        when new.review_status = 'critic-approved' then 'candidate recommended for approval'
        else 'candidate review status changed'
      end
    );
  end if;

  return new;
end;
$$;

comment on function public.can_publish_content() is 'Returns true only for MAIN_ADMIN. Use for publication and protected governance actions.';
comment on function public.can_review_content() is 'Returns true for MAIN_ADMIN and CONTENT_REVIEWER. Do not use for publication.';
