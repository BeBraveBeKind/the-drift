-- Admin RPC functions for The Drift admin panel
-- Run these in your Supabase SQL Editor

-- Function: Create new location
create or replace function admin_create_location(
  p_name text,
  p_slug text,
  p_address text default null,
  p_description text default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  new_location_id uuid;
begin
  insert into locations (name, slug, address, description)
  values (p_name, p_slug, p_address, p_description)
  returning id into new_location_id;
  
  return new_location_id;
end;
$$;

-- Function: Update existing location
create or replace function admin_update_location(
  p_id uuid,
  p_name text,
  p_slug text,
  p_address text default null,
  p_description text default null
)
returns void
language plpgsql
security definer
as $$
begin
  update locations 
  set 
    name = p_name,
    slug = p_slug,
    address = p_address,
    description = p_description,
    updated_at = now()
  where id = p_id;
end;
$$;

-- Function: Toggle location active status
create or replace function admin_toggle_location_active(
  p_id uuid,
  p_is_active boolean
)
returns void
language plpgsql
security definer
as $$
begin
  update locations 
  set 
    is_active = p_is_active,
    updated_at = now()
  where id = p_id;
end;
$$;

-- Grant execute permissions to anon role (for client-side calls)
grant execute on function admin_create_location(text, text, text, text) to anon;
grant execute on function admin_update_location(uuid, text, text, text, text) to anon;
grant execute on function admin_toggle_location_active(uuid, boolean) to anon;