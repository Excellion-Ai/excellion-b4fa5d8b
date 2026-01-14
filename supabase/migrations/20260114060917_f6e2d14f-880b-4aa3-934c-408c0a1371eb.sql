-- Add soft-delete column to courses table
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Create index for efficient trash queries
CREATE INDEX IF NOT EXISTS idx_courses_deleted_at ON public.courses(deleted_at);

-- Update RLS policies to exclude soft-deleted courses from normal queries
-- Drop existing select policies first
DROP POLICY IF EXISTS "Users can view own courses" ON public.courses;
DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;

-- Recreate policies that exclude deleted courses for normal viewing
CREATE POLICY "Users can view own active courses" 
ON public.courses 
FOR SELECT 
USING (
  auth.uid() = user_id 
  AND deleted_at IS NULL
);

CREATE POLICY "Users can view own deleted courses" 
ON public.courses 
FOR SELECT 
USING (
  auth.uid() = user_id 
  AND deleted_at IS NOT NULL
);

CREATE POLICY "Anyone can view published active courses" 
ON public.courses 
FOR SELECT 
USING (
  status = 'published' 
  AND published_at IS NOT NULL 
  AND deleted_at IS NULL
);

-- Add comment for documentation
COMMENT ON COLUMN public.courses.deleted_at IS 'Soft-delete timestamp. Courses with non-null value are in trash. Auto-purge after 30 days.';