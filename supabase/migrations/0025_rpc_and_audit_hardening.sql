create or replace function public.claim_github_import_quota(
  p_user_id uuid,
  p_repo_key text,
  p_content_hash text,
  p_daily_limit integer
)
returns table(import_day date, remaining integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  today date := current_date;
  used_count integer;
begin
  if p_user_id is null then
    raise exception 'Authenticated user is required for GitHub import quota claims';
  end if;

  if auth.uid() is not null and auth.uid() <> p_user_id then
    raise exception 'Users cannot claim GitHub import quota for another account';
  end if;

  if p_daily_limit is null or p_daily_limit < 1 then
    raise exception 'GitHub import daily limit must be at least 1';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text || ':' || today::text, 0));

  select count(*)::integer
    into used_count
    from public.github_import_events
    where user_id = p_user_id
      and import_day = today;

  if used_count >= p_daily_limit then
    raise exception 'Daily public repo import limit reached (%)', p_daily_limit
      using errcode = 'P0001';
  end if;

  insert into public.github_import_events (user_id, import_day, repo_key, content_hash)
  values (p_user_id, today, p_repo_key, p_content_hash);

  import_day := today;
  remaining := greatest(0, p_daily_limit - used_count - 1);
  return next;
end;
$$;

revoke execute on function public.claim_github_import_quota(uuid, text, text, integer) from anon;
revoke execute on function public.claim_github_import_quota(uuid, text, text, integer) from authenticated;
grant execute on function public.claim_github_import_quota(uuid, text, text, integer) to service_role;

drop policy if exists "Main admins manage content quality report events" on public.content_quality_report_events;

create policy "Main admins can insert content quality report events"
  on public.content_quality_report_events for insert
  with check (public.can_publish_content());

create policy "Main admins can read content quality report events"
  on public.content_quality_report_events for select
  using (public.can_publish_content());

comment on function public.claim_github_import_quota(uuid, text, text, integer) is 'Server-side quota claim for public GitHub imports. Execute is restricted to service_role; authenticated callers cannot claim quota for another user if execute is ever broadened.';
