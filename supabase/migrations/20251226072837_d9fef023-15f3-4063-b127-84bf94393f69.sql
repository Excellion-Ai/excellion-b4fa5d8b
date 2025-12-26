-- Fix Security Issue #1: knowledge_base table overly permissive RLS policies
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view knowledge base entries" ON public.knowledge_base;
DROP POLICY IF EXISTS "Anyone can create knowledge base entries" ON public.knowledge_base;
DROP POLICY IF EXISTS "Anyone can update knowledge base entries" ON public.knowledge_base;
DROP POLICY IF EXISTS "Anyone can delete knowledge base entries" ON public.knowledge_base;

-- Create proper owner-based RLS policies
CREATE POLICY "Users can view own knowledge base"
  ON public.knowledge_base FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM builder_projects
      WHERE builder_projects.id = knowledge_base.project_id
      AND (builder_projects.user_id = auth.uid() OR builder_projects.user_id IS NULL)
    )
  );

CREATE POLICY "Users can create knowledge base for own projects"
  ON public.knowledge_base FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM builder_projects
      WHERE builder_projects.id = knowledge_base.project_id
      AND (builder_projects.user_id = auth.uid() OR builder_projects.user_id IS NULL)
    )
  );

CREATE POLICY "Users can update own knowledge base"
  ON public.knowledge_base FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM builder_projects
      WHERE builder_projects.id = knowledge_base.project_id
      AND (builder_projects.user_id = auth.uid() OR builder_projects.user_id IS NULL)
    )
  );

CREATE POLICY "Users can delete own knowledge base"
  ON public.knowledge_base FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM builder_projects
      WHERE builder_projects.id = knowledge_base.project_id
      AND (builder_projects.user_id = auth.uid() OR builder_projects.user_id IS NULL)
    )
  );

-- Admins can manage all knowledge base entries
CREATE POLICY "Admins can manage all knowledge base"
  ON public.knowledge_base FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Fix Security Issue #2: published-sites storage bucket allows anonymous upload
-- Drop overly permissive storage policies
DROP POLICY IF EXISTS "Anyone can publish sites" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update published sites" ON storage.objects;

-- Create proper owner-based storage policies
CREATE POLICY "Users can publish their own sites"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'published-sites' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM builder_projects
      WHERE builder_projects.id::text = (storage.foldername(name))[1]
      AND (builder_projects.user_id = auth.uid() OR builder_projects.user_id IS NULL)
    )
  );

CREATE POLICY "Users can update their own published sites"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'published-sites' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM builder_projects
      WHERE builder_projects.id::text = (storage.foldername(name))[1]
      AND (builder_projects.user_id = auth.uid() OR builder_projects.user_id IS NULL)
    )
  );

CREATE POLICY "Users can delete their own published sites"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'published-sites' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM builder_projects
      WHERE builder_projects.id::text = (storage.foldername(name))[1]
      AND (builder_projects.user_id = auth.uid() OR builder_projects.user_id IS NULL)
    )
  );

-- Admins can manage all published sites
CREATE POLICY "Admins can manage all published sites"
  ON storage.objects
  FOR ALL
  USING (bucket_id = 'published-sites' AND has_role(auth.uid(), 'admin'));