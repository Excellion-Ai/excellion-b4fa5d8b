-- Fix 1: Drop the security definer view (github_connections_safe)
DROP VIEW IF EXISTS public.github_connections_safe;

-- Fix 2: Remove duplicate RLS policies on builder_projects
DROP POLICY IF EXISTS "Users can view own projects" ON public.builder_projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON public.builder_projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.builder_projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.builder_projects;

-- Fix 3: Remove duplicate SELECT policy on inquiries
DROP POLICY IF EXISTS "Only admins can view inquiries" ON public.inquiries;

-- Fix 4: Strengthen auth_activity INSERT policy to require matching user_id
DROP POLICY IF EXISTS "Authenticated users can log own activity" ON public.auth_activity;
CREATE POLICY "Authenticated users can log own activity"
ON public.auth_activity
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Fix 5: Remove github_access_token column from builder_projects (consolidate to github_connections)
ALTER TABLE public.builder_projects DROP COLUMN IF EXISTS github_access_token;