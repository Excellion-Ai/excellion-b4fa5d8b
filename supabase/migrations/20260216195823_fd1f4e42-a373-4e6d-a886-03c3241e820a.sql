-- Fix infinite recursion in courses RLS policies
-- The "Enrolled users can view published courses" policy references enrollments,
-- which itself references courses, creating a circular dependency.
-- Replace it with a simpler policy that doesn't cause recursion.

DROP POLICY IF EXISTS "Enrolled users can view published courses" ON public.courses;

-- Recreate without the circular subquery — use a security definer function instead
CREATE OR REPLACE FUNCTION public.is_enrolled_in_course(_user_id uuid, _course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.enrollments
    WHERE user_id = _user_id
      AND course_id = _course_id
  )
$$;

CREATE POLICY "Enrolled users can view published courses"
ON public.courses
FOR SELECT
USING (
  status = 'published'
  AND published_at IS NOT NULL
  AND deleted_at IS NULL
  AND is_enrolled_in_course(auth.uid(), id)
);