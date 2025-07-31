-- Create attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'pdf', 'file')),
  filename TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE,
  stop_id UUID REFERENCES stops(id) ON DELETE CASCADE,
  activity_id UUID,
  accommodation_id UUID,
  note_id UUID
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attachments_user_id ON attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_attachments_itinerary_id ON attachments(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_attachments_stop_id ON attachments(stop_id);
CREATE INDEX IF NOT EXISTS idx_attachments_type ON attachments(type);

-- Enable RLS
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own attachments" ON attachments;
DROP POLICY IF EXISTS "Users can view attachments for their itineraries" ON attachments;
DROP POLICY IF EXISTS "Users can view attachments for collaborated itineraries" ON attachments;
DROP POLICY IF EXISTS "Users can view attachments for their stops" ON attachments;
DROP POLICY IF EXISTS "Users can view attachments for collaborated stops" ON attachments;
DROP POLICY IF EXISTS "Users can create their own attachments" ON attachments;
DROP POLICY IF EXISTS "Users can update their own attachments" ON attachments;
DROP POLICY IF EXISTS "Users can delete their own attachments" ON attachments;

-- Policies for attachments
CREATE POLICY "Users can view their own attachments"
  ON attachments
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view attachments for their itineraries"
  ON attachments
  FOR SELECT
  USING (
    itinerary_id IN (
      SELECT id FROM itineraries WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view attachments for collaborated itineraries"
  ON attachments
  FOR SELECT
  USING (
    itinerary_id IN (
      SELECT c.itinerary_id FROM itinerary_collaborators c WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view attachments for their stops"
  ON attachments
  FOR SELECT
  USING (
    stop_id IN (
      SELECT s.id FROM stops s 
      JOIN itineraries i ON s.itinerary_id = i.id 
      WHERE i.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view attachments for collaborated stops"
  ON attachments
  FOR SELECT
  USING (
    stop_id IN (
      SELECT s.id FROM stops s 
      JOIN itinerary_collaborators c ON s.itinerary_id = c.itinerary_id 
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own attachments"
  ON attachments
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own attachments"
  ON attachments
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own attachments"
  ON attachments
  FOR DELETE
  USING (user_id = auth.uid()); 