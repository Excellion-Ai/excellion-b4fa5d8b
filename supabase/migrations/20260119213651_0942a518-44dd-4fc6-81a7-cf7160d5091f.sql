-- Add offer_type column to courses table for template selection
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS offer_type TEXT DEFAULT 'standard';

-- Add comment for documentation
COMMENT ON COLUMN public.courses.offer_type IS 'Template type: standard, challenge, webinar, lead_magnet, coach_portfolio';