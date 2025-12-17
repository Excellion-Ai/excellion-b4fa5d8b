-- Create custom_domains table for storing domain configurations
CREATE TABLE public.custom_domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.builder_projects(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verifying', 'active', 'failed', 'offline')),
  verification_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  ssl_provisioned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  last_checked_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;

-- Anyone can view domains (for public site resolution)
CREATE POLICY "Anyone can view domains"
ON public.custom_domains
FOR SELECT
USING (true);

-- Anyone can insert domains (matches builder_projects policy)
CREATE POLICY "Anyone can insert domains"
ON public.custom_domains
FOR INSERT
WITH CHECK (true);

-- Anyone can update domains
CREATE POLICY "Anyone can update domains"
ON public.custom_domains
FOR UPDATE
USING (true);

-- Anyone can delete domains
CREATE POLICY "Anyone can delete domains"
ON public.custom_domains
FOR DELETE
USING (true);

-- Index for fast lookups
CREATE INDEX idx_custom_domains_project ON public.custom_domains(project_id);
CREATE INDEX idx_custom_domains_domain ON public.custom_domains(domain);