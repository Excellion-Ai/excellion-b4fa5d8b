-- Create storage bucket for builder images
INSERT INTO storage.buckets (id, name, public)
VALUES ('builder-images', 'builder-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload images (since projects are currently public)
CREATE POLICY "Anyone can upload builder images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'builder-images');

-- Allow anyone to view builder images
CREATE POLICY "Anyone can view builder images"
ON storage.objects FOR SELECT
USING (bucket_id = 'builder-images');

-- Allow anyone to update their images
CREATE POLICY "Anyone can update builder images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'builder-images');

-- Allow anyone to delete builder images
CREATE POLICY "Anyone can delete builder images"
ON storage.objects FOR DELETE
USING (bucket_id = 'builder-images');