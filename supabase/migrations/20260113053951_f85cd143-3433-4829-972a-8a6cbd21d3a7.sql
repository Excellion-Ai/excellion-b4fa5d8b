-- Add page_sections column to courses table
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS page_sections JSONB DEFAULT '{
  "landing": ["hero", "outcomes", "curriculum", "faq", "cta"],
  "curriculum": ["header", "modules", "footer"],
  "lesson": ["sidebar", "content", "navigation"],
  "dashboard": ["welcome", "progress", "next_lesson", "stats"]
}'::jsonb;