-- Create courses table for AI-generated courses
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT DEFAULT 'beginner',
  duration_weeks INTEGER DEFAULT 6,
  status TEXT DEFAULT 'draft',
  published_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  modules JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create enrollments table for student enrollment tracking
CREATE TABLE public.enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percent INTEGER DEFAULT 0,
  UNIQUE(course_id, user_id)
);

-- Create lesson_progress table for tracking lesson completion
CREATE TABLE public.lesson_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE NOT NULL,
  lesson_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(enrollment_id, lesson_id)
);

-- Enable Row Level Security
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Courses policies
CREATE POLICY "Users can view their own courses" 
  ON public.courses FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own courses" 
  ON public.courses FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own courses" 
  ON public.courses FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own courses" 
  ON public.courses FOR DELETE 
  USING (auth.uid() = user_id);

-- Enrollments policies
CREATE POLICY "Users can view their enrollments" 
  ON public.enrollments FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll themselves" 
  ON public.enrollments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Course owners can view enrollments" 
  ON public.enrollments FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = enrollments.course_id 
    AND courses.user_id = auth.uid()
  ));

-- Lesson progress policies
CREATE POLICY "Users can view their lesson progress" 
  ON public.lesson_progress FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.enrollments 
    WHERE enrollments.id = lesson_progress.enrollment_id 
    AND enrollments.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their lesson progress" 
  ON public.lesson_progress FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.enrollments 
    WHERE enrollments.id = lesson_progress.enrollment_id 
    AND enrollments.user_id = auth.uid()
  ));

CREATE POLICY "Users can modify their lesson progress" 
  ON public.lesson_progress FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.enrollments 
    WHERE enrollments.id = lesson_progress.enrollment_id 
    AND enrollments.user_id = auth.uid()
  ));

-- Trigger for auto-updating updated_at on courses
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();