-- Fix foreign key constraint to allow accommodation deletion
-- This will automatically set accommodation_id to NULL in stops table when an accommodation is deleted

-- Drop the existing foreign key constraint
ALTER TABLE stops 
DROP CONSTRAINT IF EXISTS stops_accommodation_id_fkey;

-- Recreate the constraint with ON DELETE SET NULL
ALTER TABLE stops 
ADD CONSTRAINT stops_accommodation_id_fkey 
FOREIGN KEY (accommodation_id) 
REFERENCES accommodations(id) 
ON DELETE SET NULL; 