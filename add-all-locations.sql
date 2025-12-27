-- Add all Viroqua locations to database
-- Run this in Supabase SQL Editor

-- First check what locations exist
select * from locations;

-- Add all locations (will skip any that already exist)
insert into locations (name, slug, address, description) values
('Viroqua Food Co-op', 'viroqua-coop', '609 Main St', 'Community bulletin board by entrance'),
('County Seat Laundry', 'county-seat-laundry', '124 S Main St', 'Board on the wall'),
('Nelson''s AgriCenter', 'nelsons-agricenter', '126 N Main St', 'Community board inside'),
('Driftless Cafe', 'driftless-cafe', '118 W Court St', 'Community board by the door'),
('Noble Rind', 'noble-rind', '105 S Main St', 'Board near entrance'),
('Magie''s', 'magies', '116 S Main St', 'Bulletin board by register'),
('Driftless Books', 'driftless-books', '108 S Main St', 'Community board in entry')
on conflict (slug) do nothing;

-- Verify all were added
select * from locations order by name;