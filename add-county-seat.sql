-- Add County Seat Laundry to database
-- Run this in Supabase SQL Editor

-- First check what locations exist
select * from locations;

-- Add County Seat Laundry (will skip if already exists)
insert into locations (name, slug, address, description) values
('County Seat Laundry', 'county-seat-laundry', '124 S Main St', 'Board on the wall')
on conflict (slug) do nothing;

-- Verify it was added
select * from locations where slug = 'county-seat-laundry';