-- Test data for The Drift
-- Run this in Supabase SQL Editor to add sample locations

-- Clear existing test data (optional)
-- delete from locations where slug in ('viroqua-coop', 'kickapoo-coffee', 'driftless-cafe', 'county-seat-laundry');

-- Insert test locations
insert into locations (name, slug, address, description) values
('Viroqua Food Co-op', 'viroqua-coop', '609 Main St', 'Community bulletin board by entrance'),
('County Seat Laundry', 'county-seat-laundry', '124 S Main St', 'Board on the wall'),
('Driftless Cafe', 'driftless-cafe', '118 W Court St', 'Community board by the door');

-- Verify the data was inserted
select * from locations;