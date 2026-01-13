-- Add certificates table for course completion
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  student_name TEXT NOT NULL,
  course_title TEXT NOT NULL,
  certificate_number TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Users can view their own certificates
CREATE POLICY "Users can view their own certificates"
  ON public.certificates
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own certificates
CREATE POLICY "Users can create their own certificates"
  ON public.certificates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Public can view certificates by id (for sharing)
CREATE POLICY "Anyone can view certificates for verification"
  ON public.certificates
  FOR SELECT
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_certificates_enrollment_id ON public.certificates(enrollment_id);
CREATE INDEX idx_certificates_user_id ON public.certificates(user_id);