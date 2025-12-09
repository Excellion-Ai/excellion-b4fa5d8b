-- Universal Items table: holds Products, Services, Menu Items, or Portfolio Projects
CREATE TABLE IF NOT EXISTS public.items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  business_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL, -- 'product', 'service', 'menu_item', 'project'
  title text NOT NULL,
  description text,
  price decimal(10,2), -- Nullable (Portfolios don't have prices)
  image_url text,
  category text,
  is_featured boolean DEFAULT false,
  metadata jsonb -- Stores specific data like "size" for shoes or "cook_time" for pizza
);

-- Universal Inquiries table: holds Orders, Bookings, or Contact Form submissions
CREATE TABLE IF NOT EXISTS public.inquiries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  customer_email text NOT NULL,
  customer_name text,
  status text DEFAULT 'pending', -- 'paid', 'confirmed', 'shipped'
  total_amount decimal(10,2),
  details jsonb -- Stores the cart items OR the booking date/time
);

-- Enable RLS
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read items (Public Storefront)
CREATE POLICY "Public items are viewable by everyone"
  ON public.items FOR SELECT
  USING (true);

-- Policy: Only the business owner can insert their items
CREATE POLICY "Owners can insert their own items"
  ON public.items FOR INSERT
  WITH CHECK (auth.uid() = business_id);

-- Policy: Only the business owner can update their items
CREATE POLICY "Owners can update their own items"
  ON public.items FOR UPDATE
  USING (auth.uid() = business_id);

-- Policy: Only the business owner can delete their items
CREATE POLICY "Owners can delete their own items"
  ON public.items FOR DELETE
  USING (auth.uid() = business_id);

-- Policy: Anyone can submit an inquiry (contact form, order)
CREATE POLICY "Anyone can submit inquiries"
  ON public.inquiries FOR INSERT
  WITH CHECK (true);

-- Policy: Business owners can view inquiries (via metadata match or admin role)
CREATE POLICY "Admins can view all inquiries"
  ON public.inquiries FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));