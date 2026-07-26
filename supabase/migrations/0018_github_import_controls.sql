create table if not exists public.github_import_cache (
  repo_key text primary key,
  owner text not null,
  repo text not null,
  source_url text not null,
  default_branch text not null,
  content_hash text not null,
  payload jsonb not null,
  fetched_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.github_import_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  import_day date not null default current_date,
  repo_key text not null,
  content_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.github_import_cache enable row level security;
alter table public.github_import_events enable row level security;

create policy "Users can read own GitHub import events"
  on public.github_import_events for select
  using (auth.uid() = user_id);

create index if not exists github_import_events_user_day_idx
  on public.github_import_events (user_id, import_day, created_at desc);

create index if not exists github_import_events_repo_idx
  on public.github_import_events (repo_key, content_hash);

create index if not exists github_import_cache_updated_idx
  on public.github_import_cache (updated_at desc);
