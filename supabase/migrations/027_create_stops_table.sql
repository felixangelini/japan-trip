-- Create stops table (if not exists, update if needed)
CREATE TABLE IF NOT EXISTS stops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  itinerary_id UUID NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
  parent_stop_id UUID REFERENCES stops(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location_name TEXT,
  start_date DATE,
  end_date DATE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stops_itinerary_id ON stops(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_stops_created_at ON stops(created_at);
CREATE INDEX IF NOT EXISTS idx_stops_dates ON stops(start_date, end_date);

-- Enable RLS
ALTER TABLE stops ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view stops for their itineraries" ON stops;
DROP POLICY IF EXISTS "Users can view stops for collaborated itineraries" ON stops;
DROP POLICY IF EXISTS "Itinerary owners can manage stops" ON stops;
DROP POLICY IF EXISTS "Collaborators can manage stops" ON stops;

-- Policies for stops
CREATE POLICY "Users can view stops for their itineraries"
  ON stops
  FOR SELECT
  USING (
    itinerary_id IN (
      SELECT id FROM itineraries WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view stops for collaborated itineraries"
  ON stops
  FOR SELECT
  USING (
    itinerary_id IN (
      SELECT c.itinerary_id FROM itinerary_collaborators c WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Itinerary owners can manage stops"
  ON stops
  FOR ALL
  USING (
    itinerary_id IN (
      SELECT id FROM itineraries WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Collaborators can manage stops"
  ON stops
  FOR ALL
  USING (
    itinerary_id IN (
      SELECT c.itinerary_id FROM itinerary_collaborators c 
      WHERE c.user_id = auth.uid() AND c.role = 'editor'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
