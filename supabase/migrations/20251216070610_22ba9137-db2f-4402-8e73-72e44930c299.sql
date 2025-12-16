-- Add published_url column to builder_projects
ALTER TABLE public.builder_projects 
ADD COLUMN IF NOT EXISTS published_url text,
ADD COLUMN IF NOT EXISTS published_at timestamp with time zone;

-- Create storage bucket for published sites
INSERT INTO storage.buckets (id, name, public)
VALUES ('published-sites', 'published-sites', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to published sites
CREATE POLICY "Published sites are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'published-sites');

-- Allow anyone to upload to published sites (for now)
CREATE POLICY "Anyone can publish sites"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'published-sites');

-- Allow updates to published sites
CREATE POLICY "Anyone can update published sites"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'published-sites');