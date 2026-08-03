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
  v_today date := current_date;
  v_used_count integer;
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

  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text || ':' || v_today::text, 0));

  select count(*)::integer
    into v_used_count
    from public.github_import_events gie
    where gie.user_id = p_user_id
      and gie.import_day = v_today;

  if v_used_count >= p_daily_limit then
    raise exception 'Daily public repo import limit reached (%)', p_daily_limit
      using errcode = 'P0001';
  end if;

  insert into public.github_import_events (user_id, import_day, repo_key, content_hash)
  values (p_user_id, v_today, p_repo_key, p_content_hash);

  import_day := v_today;
  remaining := greatest(0, p_daily_limit - v_used_count - 1);
  return next;
end;
$$;

revoke execute on function public.claim_github_import_quota(uuid, text, text, integer) from anon;
revoke execute on function public.claim_github_import_quota(uuid, text, text, integer) from authenticated;
grant execute on function public.claim_github_import_quota(uuid, text, text, integer) to service_role;

comment on function public.claim_github_import_quota(uuid, text, text, integer) is 'Server-side quota claim for public GitHub imports. Execute is restricted to service_role; authenticated callers cannot claim quota for another user if execute is ever broadened. Uses local variable names to avoid output-column ambiguity.';
