-- Create itinerary_invites table
CREATE TABLE IF NOT EXISTS itinerary_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('viewer', 'editor')) DEFAULT 'viewer',
  message TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_itinerary_invites_itinerary_id ON itinerary_invites(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_invites_email ON itinerary_invites(email);
CREATE INDEX IF NOT EXISTS idx_itinerary_invites_status ON itinerary_invites(status);

-- Enable RLS
ALTER TABLE itinerary_invites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own invites" ON itinerary_invites;
DROP POLICY IF EXISTS "Users can create invites for their itineraries" ON itinerary_invites;
DROP POLICY IF EXISTS "Users can update their own invites" ON itinerary_invites;
DROP POLICY IF EXISTS "Users can delete their own invites" ON itinerary_invites;

-- RLS Policies for itinerary_invites
-- Users can view invites for itineraries they own or are invited to
CREATE POLICY "Users can view their own invites" ON itinerary_invites
  FOR SELECT USING (
    inviter_id = auth.uid() OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Users can create invites for itineraries they own
CREATE POLICY "Users can create invites for their itineraries" ON itinerary_invites
  FOR INSERT WITH CHECK (
    inviter_id = auth.uid() AND
    itinerary_id IN (
      SELECT id FROM itineraries WHERE user_id = auth.uid()
    )
  );

-- Users can update invites they created
CREATE POLICY "Users can update their own invites" ON itinerary_invites
  FOR UPDATE USING (
    inviter_id = auth.uid()
  );

-- Users can delete invites they created
CREATE POLICY "Users can delete their own invites" ON itinerary_invites
  FOR DELETE USING (
    inviter_id = auth.uid()
  );

-- Add updated_at trigger (only if function doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_itinerary_invites_updated_at') THEN
        CREATE TRIGGER update_itinerary_invites_updated_at 
          BEFORE UPDATE ON itinerary_invites 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$; 