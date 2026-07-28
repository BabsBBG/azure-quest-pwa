create policy "Quiz attempts are deletable by owner"
  on public.quiz_attempts for delete
  using (auth.uid() = user_id);

create policy "Interview sessions are deletable by owner"
  on public.interview_sessions for delete
  using (auth.uid() = user_id);

create policy "Question flags are deletable by owner"
  on public.question_flags for delete
  using (auth.uid() = user_id);

create policy "Assessment sessions are deletable by owner"
  on public.assessment_sessions for delete
  using (auth.uid() = user_id);

create policy "Profiles are deletable by owner"
  on public.profiles for delete
  using (auth.uid() = id);
