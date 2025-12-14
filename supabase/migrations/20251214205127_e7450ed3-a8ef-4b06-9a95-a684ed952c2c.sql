-- Add unique constraint on user_id + name to prevent duplicate project names per user
-- Using COALESCE to handle null user_id (anonymous users)
CREATE UNIQUE INDEX idx_builder_projects_unique_name 
ON public.builder_projects (COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid), name);