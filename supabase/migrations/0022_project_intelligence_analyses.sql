create table if not exists public.project_intelligence_analyses (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  imported_project_id text not null references public.imported_projects(id) on delete cascade,
  content_hash text not null,
  status text not null default 'draft' check (status in ('draft', 'reviewed', 'approved')),
  generated_at timestamptz not null default now(),
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create policy "Imported projects are deletable by owner"
  on public.imported_projects for delete
  using (auth.uid() = user_id);

alter table public.project_intelligence_analyses enable row level security;

create policy "Users can read own project intelligence analyses"
  on public.project_intelligence_analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert own project intelligence analyses"
  on public.project_intelligence_analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own project intelligence analyses"
  on public.project_intelligence_analyses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own project intelligence analyses"
  on public.project_intelligence_analyses for delete
  using (auth.uid() = user_id);

create index if not exists project_intelligence_user_project_idx
  on public.project_intelligence_analyses (user_id, imported_project_id, updated_at desc);

create index if not exists project_intelligence_user_hash_idx
  on public.project_intelligence_analyses (user_id, content_hash);
