-- Add user_id column to link domains to users
ALTER TABLE public.custom_domains 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add is_verified boolean column
ALTER TABLE public.custom_domains 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;

-- Add ssl_status text column (different from existing ssl_provisioned boolean)
ALTER TABLE public.custom_domains 
ADD COLUMN IF NOT EXISTS ssl_status TEXT NOT NULL DEFAULT 'pending';

-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_custom_domains_user_id ON public.custom_domains(user_id);

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can delete domains" ON public.custom_domains;
DROP POLICY IF EXISTS "Anyone can insert domains" ON public.custom_domains;
DROP POLICY IF EXISTS "Anyone can update domains" ON public.custom_domains;
DROP POLICY IF EXISTS "Anyone can view domains" ON public.custom_domains;

-- Create proper RLS policies
-- Users can view their own domains
CREATE POLICY "Users can view their own domains"
ON public.custom_domains FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own domains
CREATE POLICY "Users can insert their own domains"
ON public.custom_domains FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own domains
CREATE POLICY "Users can update their own domains"
ON public.custom_domains FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own domains
CREATE POLICY "Users can delete their own domains"
ON public.custom_domains FOR DELETE
USING (auth.uid() = user_id);

-- Public read access for domain verification (Caddy server needs this)
CREATE POLICY "Public can verify domains"
ON public.custom_domains FOR SELECT
USING (true);