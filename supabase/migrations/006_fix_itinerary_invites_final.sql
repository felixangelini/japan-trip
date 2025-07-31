-- Comprehensive fix for itinerary_invites table
-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_itinerary_invites_updated_at ON itinerary_invites;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own invites" ON itinerary_invites;
DROP POLICY IF EXISTS "Users can create invites for their itineraries" ON itinerary_invites;
DROP POLICY IF EXISTS "Users can update their own invites" ON itinerary_invites;
DROP POLICY IF EXISTS "Users can delete their own invites" ON itinerary_invites;

-- Recreate the trigger
CREATE TRIGGER update_itinerary_invites_updated_at 
  BEFORE UPDATE ON itinerary_invites 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create simplified policies without problematic auth.users queries
-- Users can view invites for itineraries they own OR invites sent to their email
CREATE POLICY "Users can view their own invites" ON itinerary_invites
  FOR SELECT USING (
    inviter_id = auth.uid() OR
    email = auth.jwt() ->> 'email'
  );

-- Users can create invites for itineraries they own
CREATE POLICY "Users can create invites for their itineraries" ON itinerary_invites
  FOR INSERT WITH CHECK (
    inviter_id = auth.uid() AND
    itinerary_id IN (
      SELECT id FROM itineraries WHERE user_id = auth.uid()
    )
  );

-- Users can update invites they created OR invites sent to their email
CREATE POLICY "Users can update their own invites" ON itinerary_invites
  FOR UPDATE USING (
    inviter_id = auth.uid() OR
    email = auth.jwt() ->> 'email'
  );

-- Users can delete invites they created
CREATE POLICY "Users can delete their own invites" ON itinerary_invites
  FOR DELETE USING (
    inviter_id = auth.uid()
  ); 