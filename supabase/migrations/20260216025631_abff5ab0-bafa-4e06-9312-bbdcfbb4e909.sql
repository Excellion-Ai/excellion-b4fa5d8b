
-- Drop the existing overly permissive course owner SELECT policy
DROP POLICY IF EXISTS "Course owners can view purchases for their courses" ON public.purchases;

-- Create a restricted view for course owners that excludes Stripe payment identifiers
CREATE OR REPLACE VIEW public.course_purchase_stats
WITH (security_invoker = on)
AS
SELECT 
  p.course_id,
  p.status,
  p.amount_cents,
  p.currency,
  p.purchased_at,
  p.created_at
FROM public.purchases p
WHERE EXISTS (
  SELECT 1 FROM public.courses c
  WHERE c.id = p.course_id AND c.user_id = auth.uid()
);

-- Re-add a narrower course owner policy that only allows aggregated access via the view
-- Course owners should use the course_purchase_stats view instead of querying purchases directly
-- No direct SELECT policy for course owners on purchases table anymore
