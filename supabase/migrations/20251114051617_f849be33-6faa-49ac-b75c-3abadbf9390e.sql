-- Add user_id column to track ownership
ALTER TABLE public.quote_requests 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view quote requests" ON public.quote_requests;

-- Create owner-only SELECT policy
CREATE POLICY "Users can view their own quote requests"
ON public.quote_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Update INSERT policy to ensure user_id is set correctly
DROP POLICY IF EXISTS "Anyone can submit quote requests" ON public.quote_requests;

CREATE POLICY "Users can insert their own quote requests"
ON public.quote_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow anonymous submissions (set user_id when authenticated)
CREATE POLICY "Anonymous users can submit quote requests"
ON public.quote_requests
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);