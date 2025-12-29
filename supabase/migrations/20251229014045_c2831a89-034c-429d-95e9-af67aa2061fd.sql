-- Add SELECT policy to inquiries table to restrict access to admins only
-- Currently only admins should view inquiry data (no user_id column for user-based access)
CREATE POLICY "Only admins can view inquiries"
ON public.inquiries
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));