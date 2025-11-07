-- Add new columns to quote_requests table for the updated DFY survey
ALTER TABLE quote_requests 
ADD COLUMN IF NOT EXISTS brand_name text,
ADD COLUMN IF NOT EXISTS main_outcome text,
ADD COLUMN IF NOT EXISTS pages_needed text,
ADD COLUMN IF NOT EXISTS features_needed text[],
ADD COLUMN IF NOT EXISTS brand_content_status text,
ADD COLUMN IF NOT EXISTS additional_notes text,
ADD COLUMN IF NOT EXISTS qualified_plan text;

-- Update existing columns (company can be used as brand_name fallback)
-- Note: We'll keep both columns for backward compatibility