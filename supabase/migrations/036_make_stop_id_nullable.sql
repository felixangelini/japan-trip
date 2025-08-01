-- Make stop_id nullable in accommodations table to support standalone accommodations
ALTER TABLE accommodations 
ALTER COLUMN stop_id DROP NOT NULL; 