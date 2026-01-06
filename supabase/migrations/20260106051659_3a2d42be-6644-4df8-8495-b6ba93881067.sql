-- ============================================
-- FIX 1: Quote Requests - Tighten SELECT policy
-- Users should only see their own quote requests
-- ============================================

-- Drop the existing admin-only policy
DROP POLICY IF EXISTS "Admins can view all quote requests" ON public.quote_requests;

-- Create new policy: Users can view their own quote requests
CREATE POLICY "Users can view own quote requests"
ON public.quote_requests
FOR SELECT
USING (
  auth.uid() = user_id 
  OR public.has_role(auth.uid(), 'admin')
);

-- ============================================
-- FIX 2: GitHub Connections - Remove access_token from SELECT
-- Create a view that excludes the token for safe querying
-- ============================================

-- Create a secure view that excludes the access_token
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

-- Tighten the original table policy to only allow service_role SELECT
DROP POLICY IF EXISTS "Users can view own github connections" ON public.github_connections;

-- Only service role can read full data (for edge functions)
CREATE POLICY "Service role can view github connections"
ON public.github_connections
FOR SELECT
USING (false); -- No direct SELECT allowed, use edge functions

-- Users can still INSERT and UPDATE their own
DROP POLICY IF EXISTS "Users can insert own github connections" ON public.github_connections;
CREATE POLICY "Users can insert own github connections"
ON public.github_connections
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own github connections" ON public.github_connections;
CREATE POLICY "Users can update own github connections"
ON public.github_connections
FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own github connections" ON public.github_connections;
CREATE POLICY "Users can delete own github connections"
ON public.github_connections
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- FIX 3: Auth Activity - Tighten to own records only
-- ============================================

DROP POLICY IF EXISTS "Users can view own auth activity" ON public.auth_activity;
CREATE POLICY "Users can view own auth activity"
ON public.auth_activity
FOR SELECT
USING (auth.uid() = user_id);

-- ============================================
-- FIX 4: Site Analytics - Restrict INSERT to service role only
-- Remove public insert capability
-- ============================================

DROP POLICY IF EXISTS "Anyone can insert analytics for published projects" ON public.site_analytics;

-- Only allow service role to insert analytics (via edge functions)
-- This prevents malicious analytics injection
CREATE POLICY "Service role can insert analytics"
ON public.site_analytics
FOR INSERT
WITH CHECK (false); -- Block direct inserts, use edge functions

-- ============================================
-- FIX 5: Workspace Invites - Hide tokens from non-admins
-- ============================================

-- Create a secure view that excludes tokens for non-admins
CREATE OR REPLACE VIEW public.workspace_invites_safe AS
SELECT 
  id,
  workspace_id,
  email,
  role,
  status,
  created_at,
  CASE 
    WHEN public.has_role(auth.uid(), 'admin') THEN token
    ELSE NULL
  END as token
FROM public.workspace_invites;

GRANT SELECT ON public.workspace_invites_safe TO authenticated;

-- ============================================
-- FIX 6: Support Tickets - Add workspace membership check
-- ============================================

DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
CREATE POLICY "Users can view own tickets or workspace tickets"
ON public.support_tickets
FOR SELECT
USING (
  auth.uid() = user_id 
  OR (workspace_id IS NOT NULL AND public.is_workspace_member(auth.uid(), workspace_id))
  OR public.has_role(auth.uid(), 'admin')
);

-- ============================================
-- FIX 7: Courses - Add unique constraint on subdomain
-- ============================================

-- Add unique constraint if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'courses_subdomain_unique'
  ) THEN
    ALTER TABLE public.courses ADD CONSTRAINT courses_subdomain_unique UNIQUE (subdomain);
  END IF;
END $$;