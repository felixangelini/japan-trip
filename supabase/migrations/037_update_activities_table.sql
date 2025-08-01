-- Update activities table to add itinerary_id and remove lat/lng
-- Also add proper foreign key constraints for cascade deletion

-- First, add itinerary_id column
ALTER TABLE activities
ADD COLUMN itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE;

-- Create index for better performance when filtering by itinerary
CREATE INDEX idx_activities_itinerary_id ON activities(itinerary_id);

-- Update existing activities to set itinerary_id based on their stop's itinerary
UPDATE activities
SET itinerary_id = stops.itinerary_id
FROM stops
WHERE activities.stop_id = stops.id;

-- Make itinerary_id NOT NULL after populating existing data
ALTER TABLE activities
ALTER COLUMN itinerary_id SET NOT NULL;

-- Remove lat and lng columns
ALTER TABLE activities
DROP COLUMN IF EXISTS lat,
DROP COLUMN IF EXISTS lng;

-- Add foreign key constraint for stop_id with cascade deletion
ALTER TABLE activities
DROP CONSTRAINT IF EXISTS activities_stop_id_fkey;

ALTER TABLE activities
ADD CONSTRAINT activities_stop_id_fkey
FOREIGN KEY (stop_id)
REFERENCES stops(id)
ON DELETE CASCADE;

-- Enable RLS on activities table
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Policy for users to view activities from their itineraries
CREATE POLICY "Users can view activities from their itineraries" ON activities
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM itineraries
    WHERE itineraries.id = activities.itinerary_id
    AND itineraries.user_id = auth.uid()
  )
);

-- Policy for users to insert activities for their itineraries
CREATE POLICY "Users can insert activities for their itineraries" ON activities
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM itineraries
    WHERE itineraries.id = activities.itinerary_id
    AND itineraries.user_id = auth.uid()
  )
);

-- Policy for users to update activities from their itineraries
CREATE POLICY "Users can update activities from their itineraries" ON activities
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM itineraries
    WHERE itineraries.id = activities.itinerary_id
    AND itineraries.user_id = auth.uid()
  )
);

-- Policy for users to delete activities from their itineraries
CREATE POLICY "Users can delete activities from their itineraries" ON activities
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM itineraries
    WHERE itineraries.id = activities.itinerary_id
    AND itineraries.user_id = auth.uid()
  )
); 