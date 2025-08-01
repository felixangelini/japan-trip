-- Remove check_in, check_out, lat, and lng fields from accommodations table
ALTER TABLE accommodations 
DROP COLUMN IF EXISTS check_in,
DROP COLUMN IF EXISTS check_out,
DROP COLUMN IF EXISTS lat,
DROP COLUMN IF EXISTS lng; 