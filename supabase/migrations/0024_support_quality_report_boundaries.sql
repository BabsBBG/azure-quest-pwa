create or replace function public.can_read_support_queue()
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

drop policy if exists "Support admins can read content quality reports" on public.content_quality_reports;
create policy "Support admins can read content quality reports"
  on public.content_quality_reports for select
  using (public.can_read_support_queue());

drop policy if exists "Support admins can read content quality report events" on public.content_quality_report_events;
create policy "Support admins can read content quality report events"
  on public.content_quality_report_events for select
  using (public.can_read_support_queue());

create or replace function public.guard_support_admin_no_content_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_user_role() = 'SUPPORT_ADMIN'::public.praxisgrid_user_role then
    raise exception 'SUPPORT_ADMIN can inspect support queues but cannot mutate content or report state';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_support_admin_report_update on public.content_quality_reports;
create trigger guard_support_admin_report_update
  before update on public.content_quality_reports
  for each row execute function public.guard_support_admin_no_content_mutation();

drop trigger if exists guard_support_admin_report_event_write on public.content_quality_report_events;
create trigger guard_support_admin_report_event_write
  before insert or update or delete on public.content_quality_report_events
  for each row execute function public.guard_support_admin_no_content_mutation();

comment on function public.can_read_support_queue() is 'Returns true for MAIN_ADMIN and SUPPORT_ADMIN so support queues can be inspected without granting content review or publication authority.';
comment on function public.guard_support_admin_no_content_mutation() is 'Prevents SUPPORT_ADMIN from mutating content-quality reports or report events even when future policies are broadened.';
