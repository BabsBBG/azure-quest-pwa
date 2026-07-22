create table if not exists public.assessment_sessions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  cert text not null,
  mode text not null,
  kind text not null,
  title text not null,
  status text not null check (status in ('ACTIVE', 'PAUSED', 'SUBMITTED', 'EXPIRED', 'ABANDONED')),
  started_at timestamptz not null,
  updated_at timestamptz not null,
  expires_at timestamptz not null,
  submitted_attempt_id text,
  payload jsonb not null,
  inserted_at timestamptz not null default now()
);

alter table public.assessment_sessions enable row level security;

create policy "Assessment sessions are readable by owner"
  on public.assessment_sessions for select
  using (auth.uid() = user_id);

create policy "Assessment sessions are insertable by owner"
  on public.assessment_sessions for insert
  with check (auth.uid() = user_id);

create policy "Assessment sessions are updatable by owner"
  on public.assessment_sessions for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and not (
      status = 'ACTIVE'
      and exists (
        select 1
        from public.assessment_sessions current_session
        where current_session.id = assessment_sessions.id
          and current_session.status in ('SUBMITTED', 'EXPIRED', 'ABANDONED')
      )
    )
  );

create index if not exists assessment_sessions_user_status_updated_idx
  on public.assessment_sessions (user_id, status, updated_at desc);
