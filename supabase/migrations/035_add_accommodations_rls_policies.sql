-- Enable RLS on accommodations table
ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;

-- Policy for users to view accommodations from their itineraries
CREATE POLICY "Users can view accommodations from their itineraries" ON accommodations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM itineraries 
    WHERE itineraries.id = accommodations.itinerary_id 
    AND itineraries.user_id = auth.uid()
  )
);

-- Policy for users to insert accommodations for their itineraries
CREATE POLICY "Users can insert accommodations for their itineraries" ON accommodations
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM itineraries 
    WHERE itineraries.id = accommodations.itinerary_id 
    AND itineraries.user_id = auth.uid()
  )
);

-- Policy for users to update accommodations from their itineraries
CREATE POLICY "Users can update accommodations from their itineraries" ON accommodations
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM itineraries 
    WHERE itineraries.id = accommodations.itinerary_id 
    AND itineraries.user_id = auth.uid()
  )
);

-- Policy for users to delete accommodations from their itineraries
CREATE POLICY "Users can delete accommodations from their itineraries" ON accommodations
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM itineraries 
    WHERE itineraries.id = accommodations.itinerary_id 
    AND itineraries.user_id = auth.uid()
  )
); 