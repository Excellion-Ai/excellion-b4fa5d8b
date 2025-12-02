-- Add phone_normalized field to store cleaned phone numbers
-- This field stores the phone with spaces/dashes/parens removed, preserving leading +
ALTER TABLE public.quote_requests
ADD COLUMN IF NOT EXISTS phone_normalized TEXT;

COMMENT ON COLUMN public.quote_requests.phone_normalized IS 'Normalized phone number with spaces/dashes/parentheses removed, preserving leading + for international format';