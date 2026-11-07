alter table public.flags add column if not exists visitor_key text;
create unique index if not exists flags_photo_visitor_uidx on public.flags (photo_id, visitor_key) where visitor_key is not null;
create index if not exists flags_visitor_created_idx on public.flags (visitor_key, created_at);
