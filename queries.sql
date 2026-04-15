-- Retrieve all records
SELECT * FROM form_fields;

-- Search by field
SELECT * FROM form_fields WHERE field_name = 'firstName';

-- Update record
UPDATE form_fields
SET value = 'David'
WHERE field_name = 'firstName';

-- Delete record
DELETE FROM form_fields
WHERE field_name = 'firstName';