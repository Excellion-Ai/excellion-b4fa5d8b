-- Drop existing SELECT policies on quote_requests to replace with secure ones
DROP POLICY IF EXISTS "Admins can view all quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Users can view their own quote requests" ON public.quote_requests;

-- Create a single PERMISSIVE SELECT policy that properly secures the data
-- Admins can view all, users can view their own requests only
CREATE POLICY "Secure quote requests read access"
ON public.quote_requests
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR (auth.uid() IS NOT NULL AND auth.uid() = user_id)
);