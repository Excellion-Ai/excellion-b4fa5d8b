-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view workspaces they belong to" ON public.workspaces;
DROP POLICY IF EXISTS "Users can create workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Owners can update their workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Owners can delete their workspaces" ON public.workspaces;

DROP POLICY IF EXISTS "Users can view memberships of their workspaces" ON public.workspace_memberships;
DROP POLICY IF EXISTS "Admins can insert memberships" ON public.workspace_memberships;
DROP POLICY IF EXISTS "Admins can update memberships" ON public.workspace_memberships;
DROP POLICY IF EXISTS "Admins can delete memberships" ON public.workspace_memberships;

-- Create simple non-recursive policies for workspaces
CREATE POLICY "Users can view owned workspaces"
ON public.workspaces FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Users can view workspaces via membership"
ON public.workspaces FOR SELECT
USING (public.is_workspace_member(auth.uid(), id));

CREATE POLICY "Users can create workspaces"
ON public.workspaces FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their workspaces"
ON public.workspaces FOR UPDATE
USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their workspaces"
ON public.workspaces FOR DELETE
USING (owner_id = auth.uid());

-- Create simple non-recursive policies for workspace_memberships
CREATE POLICY "Users can view own memberships"
ON public.workspace_memberships FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Workspace owners can view all memberships"
ON public.workspace_memberships FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.workspaces w
  WHERE w.id = workspace_id AND w.owner_id = auth.uid()
));

CREATE POLICY "Workspace owners can insert memberships"
ON public.workspace_memberships FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.workspaces w
  WHERE w.id = workspace_id AND w.owner_id = auth.uid()
));

CREATE POLICY "Workspace owners can update memberships"
ON public.workspace_memberships FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.workspaces w
  WHERE w.id = workspace_id AND w.owner_id = auth.uid()
));

CREATE POLICY "Workspace owners can delete memberships"
ON public.workspace_memberships FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.workspaces w
  WHERE w.id = workspace_id AND w.owner_id = auth.uid()
));