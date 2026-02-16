
-- Add edit_count to courses table to track number of edits per course
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS edit_count integer NOT NULL DEFAULT 0;
