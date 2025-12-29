-- Add GitHub integration columns to builder_projects
ALTER TABLE public.builder_projects
ADD COLUMN IF NOT EXISTS github_repo_url text,
ADD COLUMN IF NOT EXISTS github_last_synced_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS github_access_token text;

-- Create github_connections table for storing OAuth tokens per user
CREATE TABLE IF NOT EXISTS public.github_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  access_token text NOT NULL,
  github_username text,
  github_user_id text,
  connected_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on github_connections
ALTER TABLE public.github_connections ENABLE ROW LEVEL SECURITY;

-- Users can only see their own connection
CREATE POLICY "Users can view own github connection"
  ON public.github_connections FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own connection
CREATE POLICY "Users can insert own github connection"
  ON public.github_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own connection
CREATE POLICY "Users can update own github connection"
  ON public.github_connections FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own connection
CREATE POLICY "Users can delete own github connection"
  ON public.github_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_github_connections_updated_at
  BEFORE UPDATE ON public.github_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();