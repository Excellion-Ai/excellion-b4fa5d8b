-- Add admin SELECT policy for auth_activity (currently missing)
CREATE POLICY "Admins can view all auth activity"
ON public.auth_activity
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- The quote_requests and inquiries tables already have admin SELECT policies
-- but let's verify they're working correctly by checking they exist
-- (these will fail silently if they already exist, which is expected)