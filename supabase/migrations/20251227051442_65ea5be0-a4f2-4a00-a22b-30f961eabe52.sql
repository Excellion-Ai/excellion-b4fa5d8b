-- Fix auth_activity INSERT policies to be more restrictive
-- Remove the overly permissive "Allow insert for all" policy
DROP POLICY IF EXISTS "Allow insert for all" ON public.auth_activity;

-- Keep "Allow tracking of authentication attempts" but make it more restrictive
-- This policy should only allow specific event types for unauthenticated tracking
DROP POLICY IF EXISTS "Allow tracking of authentication attempts" ON public.auth_activity;

-- Keep "Users can insert their own auth activity" for authenticated users
-- This policy already exists and is correct

-- Create a new, more restrictive policy for authentication tracking
-- This limits unauthenticated inserts to specific event types and requires user_id to be NULL
CREATE POLICY "Track anonymous auth attempts only" 
ON public.auth_activity 
FOR INSERT 
TO anon
WITH CHECK (
  event_type IN ('login_attempt', 'signup_attempt', 'password_reset_attempt')
  AND user_id IS NULL
);

-- Ensure authenticated users can log their own activity
DROP POLICY IF EXISTS "Users can insert their own auth activity" ON public.auth_activity;
CREATE POLICY "Authenticated users can log own activity" 
ON public.auth_activity 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);