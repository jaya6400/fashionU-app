-- Enable Row-Level Security on public tables and restrict anon access
-- to select + insert only (no update/delete). The app never updates or
-- deletes rows, so this changes nothing about app behavior — it just
-- closes the "anyone with the anon key can wipe the table" gap that
-- Supabase's security advisor flagged (table publicly writable/deletable
-- with RLS disabled).

alter table public.saved_looks enable row level security;
alter table public.styling_rules enable row level security;

create policy "anon can read saved_looks"
  on public.saved_looks
  for select
  to anon
  using (true);

create policy "anon can insert saved_looks"
  on public.saved_looks
  for insert
  to anon
  with check (true);

create policy "anon can read styling_rules"
  on public.styling_rules
  for select
  to anon
  using (true);