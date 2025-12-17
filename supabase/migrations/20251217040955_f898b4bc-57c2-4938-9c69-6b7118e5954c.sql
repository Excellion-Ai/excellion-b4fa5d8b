-- Create site_analytics table for tracking page views
CREATE TABLE public.site_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.builder_projects(id) ON DELETE CASCADE NOT NULL,
  page_path text NOT NULL DEFAULT '/',
  referrer text,
  user_agent text,
  country text,
  city text,
  device_type text,
  browser text,
  session_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_site_analytics_project_id ON public.site_analytics(project_id);
CREATE INDEX idx_site_analytics_created_at ON public.site_analytics(created_at DESC);
CREATE INDEX idx_site_analytics_page_path ON public.site_analytics(page_path);

-- Enable RLS
ALTER TABLE public.site_analytics ENABLE ROW LEVEL SECURITY;

-- Anyone can insert analytics (for tracking script)
CREATE POLICY "Anyone can insert analytics"
ON public.site_analytics
FOR INSERT
WITH CHECK (true);

-- Anyone can view analytics for now (will scope to project owner later)
CREATE POLICY "Anyone can view analytics"
ON public.site_analytics
FOR SELECT
USING (true);