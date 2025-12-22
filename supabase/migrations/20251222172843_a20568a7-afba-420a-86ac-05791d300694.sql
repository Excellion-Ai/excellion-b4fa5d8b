-- Create table for API usage analytics
CREATE TABLE public.api_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  function_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  response_time_ms INTEGER,
  status_code INTEGER,
  error_message TEXT
);

-- Create index for efficient queries
CREATE INDEX idx_api_usage_user_id ON public.api_usage_logs(user_id);
CREATE INDEX idx_api_usage_function_name ON public.api_usage_logs(function_name);
CREATE INDEX idx_api_usage_created_at ON public.api_usage_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage
CREATE POLICY "Users can view own API usage"
ON public.api_usage_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all usage
CREATE POLICY "Admins can view all API usage"
ON public.api_usage_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can insert (edge functions use service role)
CREATE POLICY "Service role can insert usage logs"
ON public.api_usage_logs
FOR INSERT
WITH CHECK (true);