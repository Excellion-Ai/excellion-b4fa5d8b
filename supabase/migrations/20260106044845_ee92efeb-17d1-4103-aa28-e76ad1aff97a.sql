-- Add subdomain slug column for human-readable course URLs
ALTER TABLE public.courses 
ADD COLUMN subdomain TEXT UNIQUE;

-- Create index for fast subdomain lookups
CREATE INDEX idx_courses_subdomain ON public.courses(subdomain);

-- Add RLS policy for public viewing of published courses
CREATE POLICY "Anyone can view published courses"
ON public.courses
FOR SELECT
USING (status = 'published' AND published_at IS NOT NULL);