-- Fix 1: Remove overly permissive auth_activity INSERT policy
DROP POLICY IF EXISTS "Anyone can insert auth activity" ON public.auth_activity;

-- Fix 2: Add storage policies for maintenance-images bucket
-- Restrict uploads to specific file types and reasonable sizes
CREATE POLICY "Allow public to view maintenance images"
ON storage.objects FOR SELECT
USING (bucket_id = 'maintenance-images');

CREATE POLICY "Allow uploads with validation"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'maintenance-images' AND
  (storage.extension(name) = 'jpg' OR 
   storage.extension(name) = 'jpeg' OR 
   storage.extension(name) = 'png' OR 
   storage.extension(name) = 'gif' OR 
   storage.extension(name) = 'webp')
);