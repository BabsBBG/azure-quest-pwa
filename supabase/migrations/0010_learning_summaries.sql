create table if not exists public.learning_summary_workspaces (
  id text primary key,
  certification_id text not null references public.certifications(id) on delete cascade,
  domain_id text not null references public.certification_domains(id) on delete cascade,
  blueprint_version text not null,
  overview text not null,
  learning_sequence jsonb not null default '[]'::jsonb,
  terminology jsonb not null default '[]'::jsonb,
  configuration_steps jsonb not null default '[]'::jsonb,
  decision_rules jsonb not null default '[]'::jsonb,
  common_mistakes jsonb not null default '[]'::jsonb,
  examples jsonb not null default '[]'::jsonb,
  review_status text not null default 'draft' check (review_status in ('draft', 'critic-approved', 'approved', 'rejected')),
  publication_status text not null default 'draft' check (publication_status in ('draft', 'reviewed', 'approved', 'retired')),
  reviewer_notes jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (certification_id, domain_id, blueprint_version)
);

create table if not exists public.learning_summary_source_links (
  id text primary key,
  workspace_id text not null references public.learning_summary_workspaces(id) on delete cascade,
  source_document_id text not null references public.official_source_documents(id) on delete restrict,
  source_version_id text references public.official_source_versions(id) on delete restrict,
  knowledge_unit_id text references public.knowledge_units(id) on delete restrict,
  source_url text not null,
  source_section text not null,
  source_text_hash text not null,
  created_at timestamptz not null default now(),
  unique (workspace_id, source_document_id, source_text_hash)
);

create table if not exists public.published_learning_summary_versions (
  id text primary key,
  workspace_id text not null references public.learning_summary_workspaces(id) on delete restrict,
  version_number integer not null check (version_number > 0),
  certification_id text not null references public.certifications(id) on delete restrict,
  domain_id text not null references public.certification_domains(id) on delete restrict,
  blueprint_version text not null,
  payload jsonb not null,
  source_link_ids text[] not null default '{}',
  approved_by uuid not null references auth.users(id) on delete restrict,
  approved_at timestamptz not null default now(),
  supersedes_version_id text references public.published_learning_summary_versions(id) on delete restrict,
  publication_status text not null default 'approved' check (publication_status in ('approved', 'retired')),
  immutable boolean not null default true check (immutable = true),
  unique (workspace_id, version_number)
);

alter table public.learning_summary_workspaces enable row level security;
alter table public.learning_summary_source_links enable row level security;
alter table public.published_learning_summary_versions enable row level security;

create policy "Approved learning summaries are readable"
  on public.learning_summary_workspaces for select
  using (publication_status in ('reviewed', 'approved'));

create policy "Approved summary source links are readable"
  on public.learning_summary_source_links for select
  using (
    exists (
      select 1
      from public.learning_summary_workspaces lsw
      where lsw.id = learning_summary_source_links.workspace_id
        and lsw.publication_status in ('reviewed', 'approved')
    )
  );

create policy "Published learning summary versions are readable"
  on public.published_learning_summary_versions for select
  using (publication_status = 'approved');

create policy "Reviewers can read learning summary workspaces"
  on public.learning_summary_workspaces for select
  using (public.can_review_content());

create policy "Reviewers can read learning summary source links"
  on public.learning_summary_source_links for select
  using (public.can_review_content());

create policy "Reviewers can read published learning summary versions"
  on public.published_learning_summary_versions for select
  using (public.can_review_content());

create policy "Main admins manage learning summary workspaces"
  on public.learning_summary_workspaces for all
  using (public.can_publish_content())
  with check (public.can_publish_content());

create policy "Main admins manage learning summary source links"
  on public.learning_summary_source_links for all
  using (public.can_publish_content())
  with check (public.can_publish_content());

create policy "Main admins insert published learning summary versions"
  on public.published_learning_summary_versions for insert
  with check (
    public.can_publish_content()
    and immutable = true
    and publication_status = 'approved'
    and jsonb_typeof(payload) = 'object'
    and coalesce(array_length(source_link_ids, 1), 0) > 0
  );

create policy "Main admins retire published learning summary versions"
  on public.published_learning_summary_versions for update
  using (public.can_publish_content())
  with check (
    public.can_publish_content()
    and immutable = true
    and publication_status in ('approved', 'retired')
  );

create or replace function public.guard_published_learning_summary_immutability()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Published learning summary versions are immutable';
  end if;

  if old.payload is distinct from new.payload
    or old.workspace_id is distinct from new.workspace_id
    or old.version_number is distinct from new.version_number
    or old.certification_id is distinct from new.certification_id
    or old.domain_id is distinct from new.domain_id
    or old.blueprint_version is distinct from new.blueprint_version
    or old.source_link_ids is distinct from new.source_link_ids
    or old.approved_by is distinct from new.approved_by
    or old.approved_at is distinct from new.approved_at
    or old.supersedes_version_id is distinct from new.supersedes_version_id
    or old.immutable is distinct from new.immutable then
    raise exception 'Published learning summary version content cannot be changed';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_published_learning_summary_update on public.published_learning_summary_versions;
create trigger guard_published_learning_summary_update
  before update on public.published_learning_summary_versions
  for each row execute function public.guard_published_learning_summary_immutability();

drop trigger if exists guard_published_learning_summary_delete on public.published_learning_summary_versions;
create trigger guard_published_learning_summary_delete
  before delete on public.published_learning_summary_versions
  for each row execute function public.guard_published_learning_summary_immutability();

create index if not exists learning_summary_workspaces_cert_domain_idx
  on public.learning_summary_workspaces (certification_id, domain_id, publication_status, review_status);

create index if not exists learning_summary_source_links_workspace_idx
  on public.learning_summary_source_links (workspace_id, source_document_id);

create index if not exists published_learning_summary_versions_workspace_idx
  on public.published_learning_summary_versions (workspace_id, version_number desc, publication_status);
