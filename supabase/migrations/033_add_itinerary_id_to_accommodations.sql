-- Add itinerary_id field to accommodations table
ALTER TABLE accommodations
ADD COLUMN itinerary_id UUID REFERENCES itineraries(id);

-- Create index for better performance when filtering by itinerary
CREATE INDEX idx_accommodations_itinerary_id ON accommodations(itinerary_id);

-- Update existing accommodations to set itinerary_id based on their stop's itinerary
UPDATE accommodations 
SET itinerary_id = stops.itinerary_id
FROM stops 
WHERE accommodations.stop_id = stops.id;

-- Make itinerary_id NOT NULL after populating existing data
ALTER TABLE accommodations
ALTER COLUMN itinerary_id SET NOT NULL; 