-- Fix 1: Restrict auth_activity INSERT to service role only (prevent users from creating false audit trails)
DROP POLICY IF EXISTS "Authenticated users can log own activity" ON public.auth_activity;

CREATE POLICY "Service role can insert auth activity"
ON public.auth_activity
FOR INSERT
TO service_role
WITH CHECK (true);

-- Fix 2: Add rate-limiting protection for support_tickets by requiring user_id NOT NULL
-- (This prevents anonymous spam while still allowing authenticated ticket creation)
DROP POLICY IF EXISTS "Users can create tickets" ON public.support_tickets;

CREATE POLICY "Authenticated users can create tickets"
ON public.support_tickets
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Fix 3: Add project_id validation for site_analytics to prevent random data injection
-- First drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can insert analytics" ON public.site_analytics;

-- Create a more restrictive policy that validates project_id exists
CREATE POLICY "Analytics can be inserted for valid published projects"
ON public.site_analytics
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.builder_projects bp
    WHERE bp.id = project_id
    AND bp.published_url IS NOT NULL
  )
);