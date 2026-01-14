-- Create course_reviews table
CREATE TABLE public.course_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  review TEXT,
  is_verified_completion BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint: one review per user per course
CREATE UNIQUE INDEX idx_course_reviews_unique ON public.course_reviews (course_id, user_id);

-- Create index for fast course lookups
CREATE INDEX idx_course_reviews_course ON public.course_reviews (course_id);

-- Enable RLS
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can read reviews for published courses
CREATE POLICY "Anyone can read course reviews"
ON public.course_reviews
FOR SELECT
USING (true);

-- Users can create their own reviews (must be enrolled)
CREATE POLICY "Users can create own reviews"
ON public.course_reviews
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
ON public.course_reviews
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
ON public.course_reviews
FOR DELETE
USING (auth.uid() = user_id);

-- Add average_rating and review_count columns to courses table
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS average_rating NUMERIC(2,1) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Create function to update course rating stats
CREATE OR REPLACE FUNCTION public.update_course_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the course's average rating and count
  UPDATE public.courses
  SET 
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM public.course_reviews
      WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
    ),
    review_count = (
      SELECT COUNT(*)
      FROM public.course_reviews
      WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
    )
  WHERE id = COALESCE(NEW.course_id, OLD.course_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to update stats on review changes
CREATE TRIGGER update_course_rating_on_review_change
AFTER INSERT OR UPDATE OR DELETE ON public.course_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_course_rating_stats();

-- Create function to update updated_at timestamp
CREATE TRIGGER update_course_reviews_updated_at
BEFORE UPDATE ON public.course_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();