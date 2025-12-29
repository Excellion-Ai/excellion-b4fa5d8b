-- Step 1: Add workspace_id column only
ALTER TABLE public.builder_projects 
ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE SET NULL;