-- Add source column to track where submissions come from
ALTER TABLE public.quote_requests 
ADD COLUMN IF NOT EXISTS source text DEFAULT 'survey';

-- Add index for filtering by source
CREATE INDEX IF NOT EXISTS idx_quote_requests_source ON public.quote_requests(source);

-- Add city column for the mini-form
ALTER TABLE public.quote_requests 
ADD COLUMN IF NOT EXISTS city text;