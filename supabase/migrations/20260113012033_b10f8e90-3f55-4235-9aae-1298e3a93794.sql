-- Create a dedicated table for user-level global knowledge that persists independently of projects
CREATE TABLE IF NOT EXISTS public.user_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  file_type TEXT DEFAULT 'text',
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Ensure each user can only have one entry with the same name (e.g., one __global_instructions__)
  CONSTRAINT unique_user_knowledge_name UNIQUE (user_id, name)
);

-- Enable Row Level Security
ALTER TABLE public.user_knowledge ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - users can ONLY manage their OWN knowledge
CREATE POLICY "Users can view own global knowledge"
ON public.user_knowledge
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own global knowledge"
ON public.user_knowledge
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own global knowledge"
ON public.user_knowledge
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own global knowledge"
ON public.user_knowledge
FOR DELETE
USING (auth.uid() = user_id);

-- Admin access
CREATE POLICY "Admins can manage all global knowledge"
ON public.user_knowledge
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for fast user lookups
CREATE INDEX idx_user_knowledge_user_id ON public.user_knowledge(user_id);
CREATE INDEX idx_user_knowledge_name ON public.user_knowledge(user_id, name);

-- Add trigger for updated_at
CREATE TRIGGER update_user_knowledge_updated_at
BEFORE UPDATE ON public.user_knowledge
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();