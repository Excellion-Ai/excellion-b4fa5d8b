
-- ================================================
-- 1. FIX auth_activity: Remove permissive INSERT policy that allows public writes
--    Replace with authenticated-only insert, and remove duplicate SELECT policy
-- ================================================

-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Service role can insert auth activity" ON public.auth_activity;

-- Create a proper INSERT policy (only service role via JWT check)
CREATE POLICY "Service role can insert auth activity"
ON public.auth_activity
FOR INSERT
WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

-- Remove duplicate SELECT policy
DROP POLICY IF EXISTS "Users can view their own auth activity" ON public.auth_activity;

-- ================================================
-- 2. FIX purchases: Replace ALL policy with INSERT-only for service role
-- ================================================

DROP POLICY IF EXISTS "Service role can manage purchases" ON public.purchases;

CREATE POLICY "Service role can insert purchases"
ON public.purchases
FOR INSERT
WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

CREATE POLICY "Service role can update purchases"
ON public.purchases
FOR UPDATE
USING ((auth.jwt() ->> 'role') = 'service_role');

-- ================================================
-- 3. FIX github_connections: Remove duplicate policies
-- ================================================

DROP POLICY IF EXISTS "Users can delete own github connections" ON public.github_connections;
DROP POLICY IF EXISTS "Users can insert own github connections" ON public.github_connections;
DROP POLICY IF EXISTS "Users can update own github connections" ON public.github_connections;

-- ================================================
-- 4. FIX credit_transactions & api_usage_logs: Replace USING(true) INSERT 
--    with service-role-only check
-- ================================================

DROP POLICY IF EXISTS "Service role can insert transactions" ON public.credit_transactions;

CREATE POLICY "Service role can insert transactions"
ON public.credit_transactions
FOR INSERT
WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

DROP POLICY IF EXISTS "Service role can insert usage logs" ON public.api_usage_logs;

CREATE POLICY "Service role can insert usage logs"
ON public.api_usage_logs
FOR INSERT
WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');
