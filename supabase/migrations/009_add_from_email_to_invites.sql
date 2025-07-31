-- Add from_email column to itinerary_invites table
ALTER TABLE itinerary_invites 
ADD COLUMN from_email TEXT;

-- Update existing records to set from_email based on inviter_id
UPDATE itinerary_invites 
SET from_email = (
  SELECT email 
  FROM auth.users 
  WHERE id = inviter_id
);

-- Make from_email NOT NULL after populating existing data
ALTER TABLE itinerary_invites 
ALTER COLUMN from_email SET NOT NULL; 