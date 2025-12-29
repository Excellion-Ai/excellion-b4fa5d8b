-- Add sprint_pass_used column to user_credits table
ALTER TABLE public.user_credits 
ADD COLUMN IF NOT EXISTS sprint_pass_used boolean NOT NULL DEFAULT false;

-- Add sprint_expires_at to track when Sprint Pass trial ends
ALTER TABLE public.user_credits 
ADD COLUMN IF NOT EXISTS sprint_expires_at timestamp with time zone DEFAULT NULL;