ALTER TABLE charities ADD COLUMN is_featured BOOLEAN DEFAULT false;
-- Set the first charity to featured as a baseline to ensure there is exactly one
UPDATE charities 
SET is_featured = true 
WHERE id = (SELECT id FROM charities LIMIT 1);
