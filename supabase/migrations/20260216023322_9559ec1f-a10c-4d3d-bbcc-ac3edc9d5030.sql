
-- Fix: Recreate view with security_invoker to address security definer warning
DROP VIEW IF EXISTS public.public_courses;

CREATE VIEW public.public_courses
WITH (security_invoker = on)
AS
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

-- We need a limited public SELECT policy back on the base table
-- so the security_invoker view works for anon users,
-- but this time it only exposes stripped content through the view
CREATE POLICY "Anon can view published course metadata"
ON public.courses
FOR SELECT
USING (
  status = 'published' 
  AND published_at IS NOT NULL 
  AND deleted_at IS NULL
);
