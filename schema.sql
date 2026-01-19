-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Locations table
create table locations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  address text,
  description text,
  view_count integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Photos table
create table photos (
  id uuid primary key default uuid_generate_v4(),
  location_id uuid references locations(id) on delete cascade,
  storage_path text not null,
  is_current boolean default false,
  is_flagged boolean default false,
  flag_count integer default 0,
  created_at timestamptz default now()
);

-- Flags table
create table flags (
  id uuid primary key default uuid_generate_v4(),
  photo_id uuid references photos(id) on delete cascade,
  reason text,
  created_at timestamptz default now()
);

-- Indexes
create index idx_photos_location_current on photos(location_id, is_current);
create index idx_photos_location_created on photos(location_id, created_at desc);

-- Trigger: only one current photo per location
create or replace function set_current_photo()
returns trigger as $$
begin
  if NEW.is_current = true then
    update photos 
    set is_current = false 
    where location_id = NEW.location_id 
    and id != NEW.id;
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger trigger_set_current_photo
before insert or update on photos
for each row execute function set_current_photo();

-- RLS Policies
alter table locations enable row level security;
alter table photos enable row level security;
alter table flags enable row level security;

create policy "Locations are viewable by everyone" 
on locations for select using (is_active = true);

-- No direct update policy for locations - use RPC only

create policy "Current photos are viewable by everyone" 
on photos for select using (is_current = true and is_flagged = false);

create policy "All photos viewable for history" 
on photos for select using (true);

create policy "Anyone can upload photos" 
on photos for insert with check (true);

create policy "Anyone can flag photos" 
on flags for insert with check (true);

-- RPC function: increment view count (atomic, secure)
create or replace function increment_view_count(loc_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update locations 
  set view_count = view_count + 1 
  where id = loc_id and is_active = true;
end;
$$;

-- RPC function: increment flag count (atomic, secure)
create or replace function increment_flag_count(p_photo_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update photos 
  set flag_count = flag_count + 1 
  where id = p_photo_id;
end;
$$;

-- Grant execute to anon role
grant execute on function increment_view_count(uuid) to anon;
grant execute on function increment_flag_count(uuid) to anon;

-- Storage bucket policies (run in Supabase Dashboard after creating bucket)
-- create policy "Public read access"
-- on storage.objects for select
-- using (bucket_id = 'board-photos');

-- create policy "Anyone can upload"
-- on storage.objects for insert
-- with check (bucket_id = 'board-photos');