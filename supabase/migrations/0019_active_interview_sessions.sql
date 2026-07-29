create table if not exists public.active_interview_sessions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  cert text not null,
  track text not null,
  session_title text not null,
  status text not null check (status in ('ACTIVE', 'PAUSED')),
  started_at timestamptz not null,
  updated_at timestamptz not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.active_interview_sessions enable row level security;

drop policy if exists "Learners can read their active interview session" on public.active_interview_sessions;
create policy "Learners can read their active interview session"
  on public.active_interview_sessions for select
  using (auth.uid() = user_id);

drop policy if exists "Learners can create their active interview session" on public.active_interview_sessions;
create policy "Learners can create their active interview session"
  on public.active_interview_sessions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Learners can update their active interview session" on public.active_interview_sessions;
create policy "Learners can update their active interview session"
  on public.active_interview_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Learners can delete their active interview session" on public.active_interview_sessions;
create policy "Learners can delete their active interview session"
  on public.active_interview_sessions for delete
  using (auth.uid() = user_id);

create unique index if not exists active_interview_sessions_user_one_active_idx
  on public.active_interview_sessions(user_id)
  where status in ('ACTIVE', 'PAUSED');

create index if not exists active_interview_sessions_user_updated_idx
  on public.active_interview_sessions(user_id, updated_at desc);
