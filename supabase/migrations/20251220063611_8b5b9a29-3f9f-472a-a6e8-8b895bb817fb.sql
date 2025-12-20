-- Fix auth_activity RLS policy to allow inserts without authentication
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.auth_activity;
DROP POLICY IF EXISTS "Allow insert for all" ON public.auth_activity;
DROP POLICY IF EXISTS "Allow select for authenticated users" ON public.auth_activity;

-- Create policy that allows anyone to insert (needed for login/signup tracking before auth)
CREATE POLICY "Allow insert for all" 
ON public.auth_activity 
FOR INSERT 
WITH CHECK (true);

-- Allow authenticated users to view their own activity
CREATE POLICY "Users can view their own auth activity" 
ON public.auth_activity 
FOR SELECT 
USING (auth.uid()::text = user_id::text OR user_id IS NULL);