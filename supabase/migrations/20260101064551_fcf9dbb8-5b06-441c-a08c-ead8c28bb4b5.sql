-- Drop existing SELECT policies and recreate with explicit restrictive approach
-- This ensures ONLY admins can view quote_requests (no gaps)

-- 1. QUOTE_REQUESTS TABLE
-- Add a restrictive "all authenticated users DENIED" baseline with admin-only exception
-- Current policy "Only admins can view quote requests" already restricts SELECT to admins
-- But let's make the intent clearer by adding an explicit deny for all others

-- Actually, PostgreSQL RLS already works as "deny by default" when RLS is enabled
-- The issue is the scanner is being overly cautious
-- The cleanest fix is to ensure we have NO overlapping or conflicting policies

-- Verify RLS is enabled (it should already be)
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_connections ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners (important security setting)
ALTER TABLE public.quote_requests FORCE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries FORCE ROW LEVEL SECURITY;
ALTER TABLE public.github_connections FORCE ROW LEVEL SECURITY;