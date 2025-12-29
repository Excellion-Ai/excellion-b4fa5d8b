-- Drop existing RLS policies on builder_projects
DROP POLICY IF EXISTS "Users can view their own projects" ON public.builder_projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON public.builder_projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.builder_projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.builder_projects;
DROP POLICY IF EXISTS "Users can view own or workspace projects" ON public.builder_projects;
DROP POLICY IF EXISTS "Users can update own or workspace projects" ON public.builder_projects;

-- Create new workspace-aware RLS policies
CREATE POLICY "Users can view own or workspace projects"
ON public.builder_projects FOR SELECT
USING (user_id = auth.uid() OR (workspace_id IS NOT NULL AND public.is_workspace_member(auth.uid(), workspace_id)));

CREATE POLICY "Users can insert their own projects"
ON public.builder_projects FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own or workspace projects"
ON public.builder_projects FOR UPDATE
USING (user_id = auth.uid() OR (workspace_id IS NOT NULL AND public.is_workspace_member(auth.uid(), workspace_id)));

CREATE POLICY "Users can delete their own projects"
ON public.builder_projects FOR DELETE
USING (user_id = auth.uid());