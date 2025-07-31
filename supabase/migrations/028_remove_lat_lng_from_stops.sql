-- Remove lat and lng columns from stops table
ALTER TABLE stops DROP COLUMN IF EXISTS lat;
ALTER TABLE stops DROP COLUMN IF EXISTS lng; 