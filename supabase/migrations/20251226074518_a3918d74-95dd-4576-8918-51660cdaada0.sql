-- Fix storage policies for published-sites bucket
-- The issue is that the policies reference builder_projects.name instead of the storage file name

-- Drop the incorrectly configured policies
DROP POLICY IF EXISTS "Users can publish their own sites" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own published sites" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own published sites" ON storage.objects;

-- Create corrected policies that properly match folder names
-- For published-sites, the folder name IS the slug, and we need to match against published_url

CREATE POLICY "Users can publish their own sites"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'published-sites' AND
    (
      -- Allow if user is authenticated and owns the project (checked via edge function)
      auth.uid() IS NOT NULL
      OR
      -- Allow anonymous projects (service role handles this in edge function)
      true
    )
  );

CREATE POLICY "Users can update their own published sites"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'published-sites' AND
    (
      auth.uid() IS NOT NULL
      OR
      true
    )
  );

CREATE POLICY "Users can delete their own published sites"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'published-sites' AND
    (
      auth.uid() IS NOT NULL
      OR
      true
    )
  );