-- ============================================================
-- Storage bucket for user-uploaded photos (public, required for
-- YouCam's src_file_url which must be publicly reachable).
-- Run in Supabase SQL editor.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('user-photos', 'user-photos', true)
on conflict (id) do nothing;

-- Anyone can upload (no auth in MVP scope — this is intentionally open).
-- Revisit before any public launch beyond the hackathon.
create policy "Allow public insert to user-photos"
  on storage.objects for insert
  with check (bucket_id = 'user-photos');

create policy "Allow public read of user-photos"
  on storage.objects for select
  using (bucket_id = 'user-photos');