-- Storage bucket policies for board-photos
-- Run these in Supabase SQL Editor AFTER creating the "board-photos" bucket
-- 
-- BUCKET SETTINGS:
-- Name: board-photos
-- Public: Yes
-- File size limit: 10MB
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/heic, image/heif

-- Allow public read access to all photos
create policy "Public read access"
on storage.objects for select
using (bucket_id = 'board-photos');

-- Allow anyone to upload photos
create policy "Anyone can upload"
on storage.objects for insert
with check (bucket_id = 'board-photos');