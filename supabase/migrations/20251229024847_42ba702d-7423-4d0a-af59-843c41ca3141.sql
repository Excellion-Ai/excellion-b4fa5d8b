-- Create index for workspace-based queries
CREATE INDEX IF NOT EXISTS idx_builder_projects_workspace_id ON public.builder_projects(workspace_id);

-- Backfill existing projects with their owner's workspace
UPDATE public.builder_projects bp
SET workspace_id = w.id
FROM public.workspaces w
WHERE bp.user_id = w.owner_id AND bp.workspace_id IS NULL;