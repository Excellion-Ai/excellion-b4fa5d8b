-- Tighten site_analytics INSERT policy to only allow from published project context
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Analytics can be inserted for valid published projects" ON public.site_analytics;

-- Create a more restrictive policy that requires service role or authenticated context
CREATE POLICY "Analytics can be inserted via service role" 
ON public.site_analytics 
FOR INSERT 
TO service_role
WITH CHECK (
  EXISTS (
    SELECT 1 FROM builder_projects bp 
    WHERE bp.id = site_analytics.project_id 
    AND bp.published_url IS NOT NULL
  )
);

-- Also allow the anon key to insert but with stricter validation
CREATE POLICY "Analytics can be inserted for published projects" 
ON public.site_analytics 
FOR INSERT 
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM builder_projects bp 
    WHERE bp.id = site_analytics.project_id 
    AND bp.published_url IS NOT NULL
  )
  AND session_id IS NOT NULL
  AND page_path IS NOT NULL
);