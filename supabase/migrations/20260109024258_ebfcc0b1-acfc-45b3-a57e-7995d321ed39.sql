-- Drop existing restrictive SELECT policies on courses
DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;
DROP POLICY IF EXISTS "Users can view their own courses" ON public.courses;

-- Create new PERMISSIVE policies (default behavior, OR logic between policies)
-- Policy 1: Users can view ALL their own courses (draft or published)
CREATE POLICY "Users can view their own courses"
ON public.courses
FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Anyone can view published courses (for public access)
CREATE POLICY "Anyone can view published courses"
ON public.courses
FOR SELECT
USING (status = 'published' AND published_at IS NOT NULL);