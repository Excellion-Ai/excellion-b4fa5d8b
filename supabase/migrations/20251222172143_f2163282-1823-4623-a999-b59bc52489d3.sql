-- Fix 1: Bookmarks - Restrict to owner access
DROP POLICY IF EXISTS "Anyone can view bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Anyone can create bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Anyone can update bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Anyone can delete bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can view own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can create own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can update own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Admins can manage all bookmarks" ON public.bookmarks;

CREATE POLICY "Users can view own bookmarks"
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create own bookmarks"
  ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id OR (auth.uid() IS NULL AND user_id IS NULL));

CREATE POLICY "Users can update own bookmarks"
  ON public.bookmarks FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can manage all bookmarks"
  ON public.bookmarks FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Fix 2: Auth Activity - Remove exposure of NULL user_id records
DROP POLICY IF EXISTS "Users can view their own auth activity" ON public.auth_activity;
DROP POLICY IF EXISTS "Admins can view all auth activity" ON public.auth_activity;

CREATE POLICY "Users can view their own auth activity"
  ON public.auth_activity FOR SELECT
  USING (auth.uid() = user_id);

-- Fix 3: Site Analytics - Restrict to project owners and admins
DROP POLICY IF EXISTS "Anyone can view analytics" ON public.site_analytics;
DROP POLICY IF EXISTS "Project owners can view their analytics" ON public.site_analytics;
DROP POLICY IF EXISTS "Admins can view all analytics" ON public.site_analytics;

CREATE POLICY "Project owners can view their analytics"
  ON public.site_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.builder_projects bp
      WHERE bp.id = site_analytics.project_id
      AND (bp.user_id = auth.uid() OR bp.user_id IS NULL)
    )
  );

CREATE POLICY "Admins can view all analytics"
  ON public.site_analytics FOR ALL
  USING (has_role(auth.uid(), 'admin'));