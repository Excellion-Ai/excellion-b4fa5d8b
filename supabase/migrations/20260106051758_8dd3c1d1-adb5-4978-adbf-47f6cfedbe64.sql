-- Fix SECURITY DEFINER views - convert to SECURITY INVOKER
-- This ensures the views use the permissions of the querying user, not the creator

-- Recreate github_connections_safe view with SECURITY INVOKER
DROP VIEW IF EXISTS public.github_connections_safe;
CREATE VIEW public.github_connections_safe
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  github_username,
  github_user_id,
  connected_at,
  updated_at
FROM public.github_connections
WHERE user_id = auth.uid();

GRANT SELECT ON public.github_connections_safe TO authenticated;

-- Recreate workspace_invites_safe view with SECURITY INVOKER
DROP VIEW IF EXISTS public.workspace_invites_safe;
CREATE VIEW public.workspace_invites_safe
WITH (security_invoker = true)
AS
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