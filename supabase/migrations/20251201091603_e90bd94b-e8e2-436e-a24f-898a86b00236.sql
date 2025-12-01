-- Fix auth_activity INSERT policy to be more restrictive
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can insert their own auth activity" ON public.auth_activity;

-- Create a more restrictive policy that only allows inserting records for the authenticated user
CREATE POLICY "Users can insert their own auth activity" 
ON public.auth_activity 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Also add a policy for unauthenticated users (for login attempts before auth)
-- This allows tracking failed login attempts
CREATE POLICY "Allow tracking of authentication attempts" 
ON public.auth_activity 
FOR INSERT 
TO anon
WITH CHECK (
  event_type IN ('login_attempt', 'signup_attempt', 'password_reset_attempt')
  AND user_id IS NULL
);