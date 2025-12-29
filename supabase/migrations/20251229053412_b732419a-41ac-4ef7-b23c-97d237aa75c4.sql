-- Drop the existing policy that allows users to read their own quote requests
DROP POLICY IF EXISTS "Secure quote requests read access" ON public.quote_requests;

-- Create a new policy that restricts SELECT to admins only
CREATE POLICY "Only admins can view quote requests"
ON public.quote_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));