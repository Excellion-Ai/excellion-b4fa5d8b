
-- Function to strip content_markdown from modules JSONB
CREATE OR REPLACE FUNCTION public.strip_lesson_content(modules jsonb)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT jsonb_agg(
      jsonb_set(
        mod,
        '{lessons}',
        COALESCE(
          (SELECT jsonb_agg(
            lesson - 'content_markdown'
          ) FROM jsonb_array_elements(mod->'lessons') AS lesson),
          '[]'::jsonb
        )
      )
    ) FROM jsonb_array_elements(modules) AS mod),
    '[]'::jsonb
  )
$$;

-- Create public view with stripped content (no content_markdown in lessons)
CREATE VIEW public.public_courses AS
SELECT 
  id, title, description, difficulty, duration_weeks,
  layout_template, design_config, offer_type,
  price_cents, currency, status, published_at, published_url,
  subdomain, custom_domain, thumbnail_url, social_image_url,
  seo_title, seo_description, instructor_name, instructor_bio,
  total_students, average_rating, review_count,
  section_order, page_sections,
  strip_lesson_content(COALESCE(modules, '[]'::jsonb)) AS modules,
  created_at, updated_at, user_id, builder_project_id, deleted_at
FROM public.courses
WHERE status = 'published' 
  AND published_at IS NOT NULL 
  AND deleted_at IS NULL;

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view published active courses" ON public.courses;

-- Add policy: enrolled students can view full published course content
CREATE POLICY "Enrolled users can view published courses"
ON public.courses
FOR SELECT
USING (
  status = 'published' 
  AND published_at IS NOT NULL 
  AND deleted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE enrollments.course_id = courses.id
    AND enrollments.user_id = auth.uid()
  )
);
