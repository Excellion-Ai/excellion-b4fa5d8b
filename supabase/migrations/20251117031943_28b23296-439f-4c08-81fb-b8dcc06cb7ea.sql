-- Add phone column to quote_requests table
ALTER TABLE public.quote_requests
ADD COLUMN phone text;