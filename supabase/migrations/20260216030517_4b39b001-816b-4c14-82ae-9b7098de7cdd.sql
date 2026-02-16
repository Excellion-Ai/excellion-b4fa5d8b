
-- Drop the permissive enrollment policy
DROP POLICY IF EXISTS "Users can enroll themselves" ON public.enrollments;

-- Replace with a policy that checks payment for paid courses
CREATE POLICY "Users can enroll in free or purchased courses"
ON public.enrollments
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND (
    -- Course is free (price is null or 0)
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = enrollments.course_id
      AND (courses.price_cents IS NULL OR courses.price_cents = 0)
      AND courses.status = 'published'
      AND courses.deleted_at IS NULL
    )
    OR
    -- User has completed purchase for the course
    EXISTS (
      SELECT 1 FROM public.purchases
      WHERE purchases.user_id = enrollments.user_id
      AND purchases.course_id = enrollments.course_id
      AND purchases.status = 'completed'
    )
    OR
    -- User is the course owner
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = enrollments.course_id
      AND courses.user_id = auth.uid()
    )
  )
);
