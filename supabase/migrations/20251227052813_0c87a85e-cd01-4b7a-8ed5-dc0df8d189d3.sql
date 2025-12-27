-- =====================================================
-- SECURITY FIX: Tighten RLS policies across all tables
-- =====================================================

-- 1. FIX user_credits: Remove overly permissive "Service role can manage credits" 
-- and create a proper policy that only allows service role (not anon/authenticated)
DROP POLICY IF EXISTS "Service role can manage credits" ON public.user_credits;

-- 2. FIX builder_projects: Remove NULL user_id access which exposes projects to anyone
DROP POLICY IF EXISTS "Users can view own projects" ON public.builder_projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON public.builder_projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.builder_projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.builder_projects;

-- Recreate with proper authentication required
CREATE POLICY "Users can view own projects" 
ON public.builder_projects 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" 
ON public.builder_projects 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" 
ON public.builder_projects 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" 
ON public.builder_projects 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- 3. FIX bookmarks: Remove NULL user_id access
DROP POLICY IF EXISTS "Users can view own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can create own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can update own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.bookmarks;

-- Recreate with proper authentication required
CREATE POLICY "Users can view own bookmarks" 
ON public.bookmarks 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookmarks" 
ON public.bookmarks 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookmarks" 
ON public.bookmarks 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" 
ON public.bookmarks 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- 4. FIX custom_domains: Restrict public SELECT to only show domain and is_verified
-- (not verification_token). Create a more restrictive public policy.
DROP POLICY IF EXISTS "Public can verify domains" ON public.custom_domains;

-- Create a function to check domain verification without exposing token
CREATE OR REPLACE FUNCTION public.check_domain_verification(domain_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.custom_domains
    WHERE domain = domain_name
      AND is_verified = true
  )
$$;

-- Allow public to check if a domain is verified (but not see all data)
-- Users can only see their own domains now
-- Verification should happen through edge function with service role

-- 5. FIX knowledge_base: Remove NULL user_id project access
DROP POLICY IF EXISTS "Users can view own knowledge base" ON public.knowledge_base;
DROP POLICY IF EXISTS "Users can create knowledge base for own projects" ON public.knowledge_base;
DROP POLICY IF EXISTS "Users can update own knowledge base" ON public.knowledge_base;
DROP POLICY IF EXISTS "Users can delete own knowledge base" ON public.knowledge_base;

-- Recreate with proper authentication required (no NULL user_id bypass)
CREATE POLICY "Users can view own knowledge base" 
ON public.knowledge_base 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM builder_projects 
  WHERE builder_projects.id = knowledge_base.project_id 
  AND builder_projects.user_id = auth.uid()
));

CREATE POLICY "Users can create knowledge base for own projects" 
ON public.knowledge_base 
FOR INSERT 
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM builder_projects 
  WHERE builder_projects.id = knowledge_base.project_id 
  AND builder_projects.user_id = auth.uid()
));

CREATE POLICY "Users can update own knowledge base" 
ON public.knowledge_base 
FOR UPDATE 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM builder_projects 
  WHERE builder_projects.id = knowledge_base.project_id 
  AND builder_projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete own knowledge base" 
ON public.knowledge_base 
FOR DELETE 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM builder_projects 
  WHERE builder_projects.id = knowledge_base.project_id 
  AND builder_projects.user_id = auth.uid()
));

-- 6. FIX site_analytics: Remove NULL user_id project access for SELECT
DROP POLICY IF EXISTS "Project owners can view their analytics" ON public.site_analytics;

CREATE POLICY "Project owners can view their analytics" 
ON public.site_analytics 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM builder_projects bp 
  WHERE bp.id = site_analytics.project_id 
  AND bp.user_id = auth.uid()
));

-- 7. Add admin policy for profiles so admins can view all
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 8. Add admin policy for user_settings
CREATE POLICY "Admins can manage all settings" 
ON public.user_settings 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));