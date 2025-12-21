-- Create user_credits table to track credit balances
CREATE TABLE public.user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  current_plan TEXT NOT NULL DEFAULT 'free',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create credit_transactions table for audit logging
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'bonus', 'rollover', 'refund')),
  action_type TEXT CHECK (action_type IN ('chat', 'generation', 'image', 'export', 'publish', 'edit')),
  description TEXT,
  project_id UUID REFERENCES builder_projects(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_credits
CREATE POLICY "Users can view own credits" 
  ON public.user_credits FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage credits" 
  ON public.user_credits FOR ALL 
  USING (true);

-- RLS policies for credit_transactions
CREATE POLICY "Users can view own transactions" 
  ON public.credit_transactions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert transactions" 
  ON public.credit_transactions FOR INSERT 
  WITH CHECK (true);

-- Admin access policies
CREATE POLICY "Admins can view all credits" 
  ON public.user_credits FOR SELECT 
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all transactions" 
  ON public.credit_transactions FOR SELECT 
  USING (has_role(auth.uid(), 'admin'));

-- Create index for faster transaction lookups
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);

-- Function to allocate free credits on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert initial credits for new user (20 free credits)
  INSERT INTO public.user_credits (user_id, balance, total_earned, current_plan)
  VALUES (NEW.id, 20, 20, 'free');
  
  -- Log the bonus transaction
  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (NEW.id, 20, 'bonus', 'Welcome bonus - 20 free credits');
  
  RETURN NEW;
END;
$$;

-- Trigger to allocate credits on user creation
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();