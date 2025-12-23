-- Create a table to store archived pricing tiers for future reference
CREATE TABLE public.archived_pricing_tiers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tier_type text NOT NULL, -- 'dfy' for done-for-you, 'builder' for AI builder
  name text NOT NULL,
  price_range text NOT NULL,
  description text,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_highlighted boolean DEFAULT false,
  display_order integer DEFAULT 0,
  archived_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.archived_pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage archived pricing
CREATE POLICY "Admins can manage archived pricing"
ON public.archived_pricing_tiers
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow public read for potential future use
CREATE POLICY "Public can view archived pricing"
ON public.archived_pricing_tiers
FOR SELECT
USING (true);

-- Insert the DFY pricing tiers
INSERT INTO public.archived_pricing_tiers (tier_type, name, price_range, description, features, is_highlighted, display_order)
VALUES 
  ('dfy', 'Essential', '$600 – $1,000', 'Perfect for simple landing pages', 
   '["1–3 pages", "1 revision round", "Basic SEO setup", "Full launch support"]'::jsonb, 
   false, 1),
  ('dfy', 'Core', '$1,000 – $1,800', 'For growing businesses', 
   '["5–7 pages", "2 revision rounds", "Booking OR payments integration", "Enhanced SEO"]'::jsonb, 
   true, 2),
  ('dfy', 'Premium', '$1,800 – $3,500', 'Full-featured professional sites', 
   '["10–15 pages", "3 revision rounds", "Automations & integrations", "Advanced SEO & analytics"]'::jsonb, 
   false, 3);