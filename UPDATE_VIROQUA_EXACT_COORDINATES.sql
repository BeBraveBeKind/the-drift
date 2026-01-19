-- Exact coordinates from Google Maps for all Viroqua businesses
-- Run this in Supabase SQL Editor to update all locations

UPDATE locations SET 
  latitude = CASE slug
    WHEN 'my-wild-child' THEN 43.55522933140584
    WHEN 'the-commons' THEN 43.55550625074247
    WHEN 'mcintosh-memorial-library' THEN 43.55506384271638
    WHEN 'ewetopia' THEN 43.55609337444436
    WHEN 'woolly-bear-taphouse' THEN 43.554022730057376
    WHEN 'tractor-supply' THEN 43.674589531025056
    WHEN 'kwik-trip-north' THEN 43.5863745011309
    WHEN 'kwik-trip-south' THEN 43.55516006378465
    WHEN 'maybe-latelys' THEN 43.55700444580584
    WHEN 'driftless-cafe' THEN 43.556485307595295
    WHEN 'nelsons-agricenter' THEN 43.55879874764292
    WHEN 'noble-rind' THEN 43.55655559367528
    WHEN 'driftless-books' THEN 43.55855510466387
    WHEN 'viroqua-coop' THEN 43.56065409777781
    WHEN 'county-seat-laundry' THEN 43.57362961469739
    ELSE latitude
  END,
  longitude = CASE slug
    WHEN 'my-wild-child' THEN -90.8897253536413
    WHEN 'the-commons' THEN -90.8852535160687
    WHEN 'mcintosh-memorial-library' THEN -90.89039860963717
    WHEN 'ewetopia' THEN -90.88945055844033
    WHEN 'woolly-bear-taphouse' THEN -90.88856040293082
    WHEN 'tractor-supply' THEN -90.87311439159794
    WHEN 'kwik-trip-north' THEN -90.88455295354643
    WHEN 'kwik-trip-south' THEN -90.88991339179375
    WHEN 'maybe-latelys' THEN -90.88914110813971
    WHEN 'driftless-cafe' THEN -90.88971439440311
    WHEN 'nelsons-agricenter' THEN -90.8867162983522
    WHEN 'noble-rind' THEN -90.88964632089662
    WHEN 'driftless-books' THEN -90.88272537964387
    WHEN 'viroqua-coop' THEN -90.88828254807756
    WHEN 'county-seat-laundry' THEN -90.88958348936215
    ELSE longitude
  END
WHERE town = 'viroqua';

-- Verify the update worked
SELECT name, slug, address, latitude, longitude 
FROM locations 
WHERE town = 'viroqua'
ORDER BY name;