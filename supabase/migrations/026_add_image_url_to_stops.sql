-- Add image_url column to stops table
ALTER TABLE stops ADD COLUMN IF NOT EXISTS image_url TEXT; 