-- Migration 014: Add human-readable listing number for easy reference
-- This allows buyers and sellers to reference listings by number (e.g., "LIST-0001")

-- Add listing_number column
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS listing_number TEXT;

-- Create a function to generate listing numbers
CREATE OR REPLACE FUNCTION generate_listing_number()
RETURNS TRIGGER AS $$
DECLARE
  new_number TEXT;
  num_count INTEGER;
BEGIN
  -- If listing_number is already set, don't override it
  IF NEW.listing_number IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Get the count of existing listings to generate next number
  SELECT COUNT(*) INTO num_count FROM listings;
  
  -- Generate listing number in format LIST-XXXX (zero-padded to 4 digits)
  new_number := 'LIST-' || LPAD((num_count + 1)::TEXT, 4, '0');
  
  -- Ensure uniqueness (in case of race conditions)
  WHILE EXISTS (SELECT 1 FROM listings WHERE listing_number = new_number) LOOP
    num_count := num_count + 1;
    new_number := 'LIST-' || LPAD((num_count + 1)::TEXT, 4, '0');
  END LOOP;
  
  NEW.listing_number := new_number;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate listing numbers on insert
DROP TRIGGER IF EXISTS trigger_generate_listing_number ON listings;
CREATE TRIGGER trigger_generate_listing_number
  BEFORE INSERT ON listings
  FOR EACH ROW
  EXECUTE FUNCTION generate_listing_number();

-- Generate listing numbers for existing listings
DO $$
DECLARE
  listing_record RECORD;
  counter INTEGER := 1;
BEGIN
  -- Update existing listings that don't have a listing_number
  FOR listing_record IN 
    SELECT id FROM listings WHERE listing_number IS NULL ORDER BY created_at
  LOOP
    UPDATE listings 
    SET listing_number = 'LIST-' || LPAD(counter::TEXT, 4, '0')
    WHERE id = listing_record.id;
    counter := counter + 1;
  END LOOP;
END $$;

-- Create index for faster lookups by listing number
CREATE INDEX IF NOT EXISTS idx_listings_listing_number ON listings(listing_number);

-- Add comment
COMMENT ON COLUMN listings.listing_number IS 'Human-readable listing identifier (e.g., LIST-0001) for easy reference in communications';

