drop policy if exists "Users can create content quality reports" on public.content_quality_reports;

create policy "Authenticated users can create content quality reports"
  on public.content_quality_reports for insert
  with check (
    auth.uid() is not null
    and user_id = auth.uid()
    and never_auto_mutates_content = true
    and source_url like 'https://learn.microsoft.com/%'
  );
