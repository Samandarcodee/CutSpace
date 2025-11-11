-- Migration: Add description column to barbershops table
-- Run this SQL command in your Neon database console

ALTER TABLE barbershops 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Update existing rows with empty description if needed
UPDATE barbershops 
SET description = '' 
WHERE description IS NULL;

-- Optional: Add a comment to the column
COMMENT ON COLUMN barbershops.description IS 'Description of the barbershop';

