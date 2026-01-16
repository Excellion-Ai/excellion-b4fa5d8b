-- Create lesson_resources table
CREATE TABLE public.lesson_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size_bytes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lesson_resources ENABLE ROW LEVEL SECURITY;

-- Course owners can manage resources
CREATE POLICY "Course owners can manage lesson resources"
ON public.lesson_resources
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = lesson_resources.course_id 
    AND courses.user_id = auth.uid()
  )
);

-- Enrolled students can view resources
CREATE POLICY "Enrolled students can view lesson resources"
ON public.lesson_resources
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.enrollments 
    WHERE enrollments.course_id = lesson_resources.course_id 
    AND enrollments.user_id = auth.uid()
  )
);

-- Create storage bucket for course resources
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-resources',
  'course-resources',
  true,
  10485760,
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip', 'image/png', 'image/jpeg']
);

-- Storage policies
CREATE POLICY "Course owners can upload resources"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'course-resources' AND
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id::text = (storage.foldername(name))[1]
    AND courses.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view course resources"
ON storage.objects
FOR SELECT
USING (bucket_id = 'course-resources');

CREATE POLICY "Course owners can delete resources"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'course-resources' AND
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id::text = (storage.foldername(name))[1]
    AND courses.user_id = auth.uid()
  )
);