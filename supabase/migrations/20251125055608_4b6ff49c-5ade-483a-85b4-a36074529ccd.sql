-- Create storage bucket for maintenance request images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('maintenance-images', 'maintenance-images', true);

-- Create policies for maintenance image uploads
CREATE POLICY "Anyone can upload maintenance images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'maintenance-images');

CREATE POLICY "Maintenance images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'maintenance-images');