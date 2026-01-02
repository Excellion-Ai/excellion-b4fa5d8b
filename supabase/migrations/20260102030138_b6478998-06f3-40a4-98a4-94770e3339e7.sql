-- Create generated_sites table for storing website generation requests
CREATE TABLE public.generated_sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.generated_sites ENABLE ROW LEVEL SECURITY;

-- Users can insert their own sites
CREATE POLICY "Users can insert their own sites"
ON public.generated_sites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own sites
CREATE POLICY "Users can view their own sites"
ON public.generated_sites
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own sites
CREATE POLICY "Users can update their own sites"
ON public.generated_sites
FOR UPDATE
USING (auth.uid() = user_id);

-- Service role can update any site (for the Railway API callback)
CREATE POLICY "Service role can update sites"
ON public.generated_sites
FOR UPDATE
USING (true);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.generated_sites;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_generated_sites_updated_at
BEFORE UPDATE ON public.generated_sites
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();