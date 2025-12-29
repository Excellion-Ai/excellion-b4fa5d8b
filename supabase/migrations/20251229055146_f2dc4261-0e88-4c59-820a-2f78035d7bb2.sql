-- Fix auth_activity: Remove anonymous insert policy that could be exploited
-- and ensure only authenticated users can log their own activity

-- Drop the problematic anonymous tracking policy
DROP POLICY IF EXISTS "Track anonymous auth attempts only" ON public.auth_activity;

-- The remaining policies are secure:
-- - Admins can view all auth activity
-- - Authenticated users can log own activity  
-- - Users can view their own auth activity

-- Add a more secure policy for tracking failed login attempts via service role only
-- (handled by edge functions with service role, not anonymous users)