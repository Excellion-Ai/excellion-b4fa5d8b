-- Phase 1: Add course_id column to custom_domains table
-- This allows domains to be linked directly to courses without the builder_project workaround

ALTER TABLE public.custom_domains 
ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;

-- Add index for efficient lookups by course_id
CREATE INDEX IF NOT EXISTS idx_custom_domains_course_id ON public.custom_domains(course_id);

-- Update RLS policies to allow users to manage domains linked to their courses
-- (existing user_id-based policies still work, this adds course-ownership path)
CREATE POLICY "Users can view domains linked to their courses"
  ON public.custom_domains
  FOR SELECT
  USING (
    course_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = custom_domains.course_id
        AND courses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert domains linked to their courses"
  ON public.custom_domains
  FOR INSERT
  WITH CHECK (
    course_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = course_id
        AND courses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update domains linked to their courses"
  ON public.custom_domains
  FOR UPDATE
  USING (
    course_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = custom_domains.course_id
        AND courses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete domains linked to their courses"
  ON public.custom_domains
  FOR DELETE
  USING (
    course_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = custom_domains.course_id
        AND courses.user_id = auth.uid()
    )
  );