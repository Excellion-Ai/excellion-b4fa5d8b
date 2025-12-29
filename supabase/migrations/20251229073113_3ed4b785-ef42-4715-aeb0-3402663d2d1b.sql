-- Add versions JSONB column to builder_projects for version history
ALTER TABLE public.builder_projects 
ADD COLUMN IF NOT EXISTS versions jsonb DEFAULT '[]'::jsonb;

-- Add comment explaining the structure
COMMENT ON COLUMN public.builder_projects.versions IS 'Array of version snapshots: [{id, timestamp, spec, name, thumbnail_url}]';

-- Create index for faster queries on versions
CREATE INDEX IF NOT EXISTS idx_builder_projects_versions ON public.builder_projects USING GIN (versions);