-- Create course_views table for tracking course page visits
CREATE TABLE public.course_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  viewer_id UUID,
  referrer TEXT,
  device_type TEXT DEFAULT 'desktop',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lesson_views table for tracking lesson engagement
CREATE TABLE public.lesson_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  viewer_id UUID,
  enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE SET NULL,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.course_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_views ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert course views (public pages)
CREATE POLICY "Anyone can insert course views"
ON public.course_views
FOR INSERT
WITH CHECK (true);

-- Allow course owners to view their course analytics
CREATE POLICY "Course owners can view their course views"
ON public.course_views
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = course_views.course_id
    AND courses.user_id = auth.uid()
  )
);

-- Allow authenticated users to insert lesson views
CREATE POLICY "Authenticated users can insert lesson views"
ON public.lesson_views
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update their own lesson views (for time tracking)
CREATE POLICY "Users can update their own lesson views"
ON public.lesson_views
FOR UPDATE
USING (viewer_id = auth.uid());

-- Allow course owners to view lesson analytics
CREATE POLICY "Course owners can view lesson views"
ON public.lesson_views
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = lesson_views.course_id
    AND courses.user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_course_views_course_id ON public.course_views(course_id);
CREATE INDEX idx_course_views_created_at ON public.course_views(created_at);
CREATE INDEX idx_lesson_views_course_id ON public.lesson_views(course_id);
CREATE INDEX idx_lesson_views_lesson_id ON public.lesson_views(lesson_id);
CREATE INDEX idx_lesson_views_enrollment_id ON public.lesson_views(enrollment_id);