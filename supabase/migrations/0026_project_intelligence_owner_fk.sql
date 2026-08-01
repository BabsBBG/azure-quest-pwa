alter table public.imported_projects
  add constraint imported_projects_id_user_id_unique unique (id, user_id);

alter table public.project_intelligence_analyses
  add constraint project_intelligence_import_owner_fk
  foreign key (imported_project_id, user_id)
  references public.imported_projects(id, user_id)
  on delete cascade;
