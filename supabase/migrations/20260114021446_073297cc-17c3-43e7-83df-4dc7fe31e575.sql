-- Add SEO and social sharing columns to courses table
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS custom_domain TEXT,
ADD COLUMN IF NOT EXISTS social_image_url TEXT;

-- Add index for custom domain lookups
CREATE INDEX IF NOT EXISTS idx_courses_custom_domain ON public.courses(custom_domain) WHERE custom_domain IS NOT NULL;