
-- Add design columns to courses table for visual editing support
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS design_config JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS layout_template TEXT DEFAULT 'suspended',
ADD COLUMN IF NOT EXISTS section_order JSONB DEFAULT '["hero","outcomes","curriculum","faq","cta"]'::jsonb;
