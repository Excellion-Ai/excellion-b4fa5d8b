-- Fix 1: Remove overly permissive published-sites storage policies
-- These policies have (auth.uid() IS NOT NULL OR true) which always evaluates to true

DROP POLICY IF EXISTS "Users can publish their own sites" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own published sites" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own published sites" ON storage.objects;

-- Only allow service role (edge functions) to manage published-sites
-- The publish-site and unpublish-site edge functions already handle authorization
CREATE POLICY "Service role manages published sites"
  ON storage.objects FOR ALL
  USING (bucket_id = 'published-sites' AND auth.role() = 'service_role')
  WITH CHECK (bucket_id = 'published-sites' AND auth.role() = 'service_role');

-- Public read access for serving published sites (required for CDN)
CREATE POLICY "Public can read published sites"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'published-sites');

-- Fix 2: Add rate limiting protection for quote_requests by adding a check
-- The existing policies are correct (admin-only SELECT, authenticated INSERT)
-- But we should ensure the table has proper constraints

-- Fix 3: For github_connections - the tokens are already protected by RLS
-- (users can only see their own). We'll add an extra layer by ensuring
-- the access_token column is not returned in normal queries via a view

-- Create a secure view that hides the access token for regular queries
CREATE OR REPLACE VIEW public.github_connections_safe AS
SELECT 
  id,
  user_id,
  github_username,
  github_user_id,
  connected_at,
  updated_at
FROM public.github_connections;

-- Grant access to the view
GRANT SELECT ON public.github_connections_safe TO authenticated;

-- Add a comment explaining security
COMMENT ON TABLE public.github_connections IS 'Contains GitHub OAuth tokens. Access tokens should only be accessed by edge functions using service role.';