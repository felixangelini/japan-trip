-- Add accommodation_id field to stops table
ALTER TABLE stops 
ADD COLUMN accommodation_id UUID REFERENCES accommodations(id);

-- Create index for better performance
CREATE INDEX idx_stops_accommodation_id ON stops(accommodation_id); 