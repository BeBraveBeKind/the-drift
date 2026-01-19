-- Add County Seat Laundry to Switchboard database
-- Run this in Supabase SQL Editor AFTER running complete-switchboard-migration.sql

-- First check what locations exist
select name, slug, town, address from locations order by town, name;

-- Add County Seat Laundry with town (will skip if already exists)
insert into locations (name, slug, town, address, description, is_active) values
('County Seat Laundry', 'county-seat-laundry', 'viroqua', '124 S Main St', 'Board on the wall', true)
on conflict (slug) do nothing;

-- Verify it was added
select * from locations where slug = 'county-seat-laundry' and town = 'viroqua';