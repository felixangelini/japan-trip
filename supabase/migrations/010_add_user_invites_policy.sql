-- Add policy for users to view their invites by user_id or email
CREATE POLICY "Users can view their invites by user_id or email"
  ON itinerary_invites
  FOR SELECT
  USING (
    inviter_id = auth.uid()
    OR email = auth.jwt() ->> 'email'
  );

-- Add policy for users to update their invites by email
CREATE POLICY "Users can update their invites by email"
  ON itinerary_invites
  FOR UPDATE
  USING (
    inviter_id = auth.uid()
    OR email = auth.jwt() ->> 'email'
  ); 