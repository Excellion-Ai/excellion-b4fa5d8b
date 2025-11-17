-- Make email column nullable in quote_requests table since it's no longer collected in the survey
ALTER TABLE quote_requests ALTER COLUMN email DROP NOT NULL;