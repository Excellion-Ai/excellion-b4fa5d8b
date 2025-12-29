-- Create security definer function for workspace membership check
CREATE OR REPLACE FUNCTION public.is_workspace_member(_user_id uuid, _workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_memberships
    WHERE user_id = _user_id
      AND workspace_id = _workspace_id
  )
$$;