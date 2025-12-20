-- Create storage bucket for builder images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('builder-images', 'builder-images', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to builder-images bucket
CREATE POLICY "Public read access for builder-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'builder-images');

-- Allow authenticated users to upload to builder-images bucket
CREATE POLICY "Authenticated users can upload to builder-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'builder-images');

-- Allow authenticated users to update their uploads
CREATE POLICY "Users can update builder-images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'builder-images');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Users can delete builder-images"
ON storage.objects FOR DELETE
USING (bucket_id = 'builder-images');