-- Add new columns to quote_requests table for international WhatsApp support
-- Keep legacy 'phone' column for backwards compatibility

ALTER TABLE public.quote_requests 
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_raw TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_e164 TEXT;

-- Add helpful comments to explain the columns
COMMENT ON COLUMN public.quote_requests.country IS 'Country or region for the WhatsApp number';
COMMENT ON COLUMN public.quote_requests.whatsapp_raw IS 'Raw WhatsApp number as entered by user (with spaces and formatting)';
COMMENT ON COLUMN public.quote_requests.whatsapp_e164 IS 'Normalized WhatsApp number in E.164 format (no spaces, just + and digits)';