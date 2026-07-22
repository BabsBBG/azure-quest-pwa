create table if not exists public.knowledge_graph_nodes (
  id text primary key,
  kind text not null check (kind in (
    'PROVIDER',
    'CERTIFICATION',
    'CERTIFICATION_VERSION',
    'DOMAIN',
    'OBJECTIVE',
    'KNOWLEDGE_UNIT',
    'SOURCE_DOCUMENT',
    'SOURCE_CHUNK',
    'LEARNING_SUMMARY',
    'ASSESSMENT_ITEM',
    'DOMAIN_QUIZ_PLACEMENT',
    'CERTIFICATION_RUN_PLACEMENT'
  )),
  label text not null,
  cert text check (cert in ('SC-300', 'AZ-500', 'SC-500')),
  status text not null default 'draft' check (status in ('draft', 'reviewed', 'approved', 'placeholder')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.knowledge_graph_edges (
  id text primary key,
  from_node_id text not null references public.knowledge_graph_nodes(id) on delete cascade,
  to_node_id text not null references public.knowledge_graph_nodes(id) on delete cascade,
  kind text not null check (kind in (
    'HAS_CERTIFICATION',
    'HAS_VERSION',
    'HAS_DOMAIN',
    'HAS_OBJECTIVE',
    'HAS_KNOWLEDGE_UNIT',
    'SUPPORTED_BY',
    'SUMMARIZED_BY',
    'ASSESSED_BY',
    'PLACED_IN_DOMAIN_QUIZ',
    'PLACED_IN_CERTIFICATION_RUN',
    'DEPENDS_ON',
    'RELATED_TO',
    'CONTRASTS_WITH',
    'COMMONLY_CONFUSED_WITH',
    'PREREQUISITE_OF'
  )),
  evidence text not null,
  confidence numeric(4, 3) not null check (confidence >= 0 and confidence <= 1),
  review_status text not null default 'draft' check (review_status in ('draft', 'critic-approved', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (from_node_id, to_node_id, kind)
);

create table if not exists public.assessment_item_knowledge_units (
  assessment_item_id text not null references public.knowledge_graph_nodes(id) on delete cascade,
  knowledge_unit_id text not null references public.knowledge_graph_nodes(id) on delete cascade,
  relation_kind text not null default 'ASSESSED_BY' check (relation_kind = 'ASSESSED_BY'),
  review_status text not null default 'draft' check (review_status in ('draft', 'critic-approved', 'approved', 'rejected')),
  evidence text not null,
  created_at timestamptz not null default now(),
  primary key (assessment_item_id, knowledge_unit_id)
);

create table if not exists public.domain_quiz_placements (
  id text primary key,
  domain_node_id text not null references public.knowledge_graph_nodes(id) on delete cascade,
  assessment_item_id text references public.knowledge_graph_nodes(id) on delete cascade,
  quiz_track text not null check (quiz_track in ('FOUNDATIONS', 'CONFIGURATION', 'SCENARIOS', 'TROUBLESHOOTING', 'DOMAIN_CHALLENGE')),
  publication_status text not null default 'draft' check (publication_status in ('draft', 'reviewed', 'published', 'retired')),
  effective_at timestamptz,
  retired_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.certification_run_placements (
  id text primary key,
  certification_version_node_id text not null references public.knowledge_graph_nodes(id) on delete cascade,
  assessment_item_id text references public.knowledge_graph_nodes(id) on delete cascade,
  run_type text not null check (run_type in ('BASELINE', 'APPLIED', 'PRESSURE', 'FINAL', 'PERSONALIZED')),
  publication_status text not null default 'draft' check (publication_status in ('draft', 'reviewed', 'published', 'retired')),
  effective_at timestamptz,
  retired_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.knowledge_graph_nodes enable row level security;
alter table public.knowledge_graph_edges enable row level security;
alter table public.assessment_item_knowledge_units enable row level security;
alter table public.domain_quiz_placements enable row level security;
alter table public.certification_run_placements enable row level security;

create policy "Reviewed graph nodes are readable"
  on public.knowledge_graph_nodes for select
  using (status in ('reviewed', 'approved', 'placeholder'));

create policy "Reviewed graph edges are readable"
  on public.knowledge_graph_edges for select
  using (review_status in ('critic-approved', 'approved'));

create policy "Reviewed assessment item knowledge links are readable"
  on public.assessment_item_knowledge_units for select
  using (review_status in ('critic-approved', 'approved'));

create policy "Published or placeholder domain quiz placements are readable"
  on public.domain_quiz_placements for select
  using (publication_status in ('reviewed', 'published'));

create policy "Published or placeholder certification run placements are readable"
  on public.certification_run_placements for select
  using (publication_status in ('reviewed', 'published'));

create policy "Main admins manage graph nodes"
  on public.knowledge_graph_nodes for all
  using (public.can_publish_content())
  with check (public.can_publish_content());

create policy "Main admins manage graph edges"
  on public.knowledge_graph_edges for all
  using (public.can_publish_content())
  with check (public.can_publish_content());

create policy "Main admins manage assessment item knowledge links"
  on public.assessment_item_knowledge_units for all
  using (public.can_publish_content())
  with check (public.can_publish_content());

create policy "Main admins manage domain quiz placements"
  on public.domain_quiz_placements for all
  using (public.can_publish_content())
  with check (public.can_publish_content());

create policy "Main admins manage certification run placements"
  on public.certification_run_placements for all
  using (public.can_publish_content())
  with check (public.can_publish_content());

create index if not exists knowledge_graph_nodes_kind_cert_idx
  on public.knowledge_graph_nodes (kind, cert, status);

create index if not exists knowledge_graph_edges_from_kind_idx
  on public.knowledge_graph_edges (from_node_id, kind, review_status);

create index if not exists knowledge_graph_edges_to_kind_idx
  on public.knowledge_graph_edges (to_node_id, kind, review_status);

create index if not exists assessment_item_knowledge_units_ku_idx
  on public.assessment_item_knowledge_units (knowledge_unit_id, review_status);

create index if not exists domain_quiz_placements_domain_track_idx
  on public.domain_quiz_placements (domain_node_id, quiz_track, publication_status);

create index if not exists certification_run_placements_version_type_idx
  on public.certification_run_placements (certification_version_node_id, run_type, publication_status);
